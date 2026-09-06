"use server";

import { revalidatePath } from "next/cache";

import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";
import { plaidClient } from "@/lib/plaid";

import { parseStringify, extractCustomerIdFromUrl, encryptId } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  let newUserId: string | undefined;

  try {
    const supabase = await createClient();

    // create Supabase auth user with email redirect
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/sign-in`,
      },
    });

    if (authError) {
      // Handle specific error cases with better messages
      if (authError.message.includes('rate limit')) {
        throw new Error('Too many signup attempts. Please wait a few minutes and try again.');
      }
      if (authError.message.includes('already registered')) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Failed to create account. Please try again.');
    }

    newUserId = authData.user.id;

    // Check if email confirmation is required (session will be null)
    const needsEmailConfirmation = !authData.session;

    if (needsEmailConfirmation) {
      // Don't create Dwolla customer or profile yet - wait for email confirmation
      return { 
        user: null, 
        needsEmailConfirmation: true 
      };
    }

    // create dwolla customer - map fields to match Dwolla API expectations
    const dwollaCustomerUrl = await createDwollaCustomer({
      firstName: userData.first_name,
      lastName: userData.last_name,
      email: userData.email,
      type: "personal",
      address1: userData.address1,
      city: userData.city,
      state: userData.state,
      postalCode: userData.postalCode,
      dateOfBirth: userData.dateOfBirth,
      ssn: userData.ssn,
    });

    if (!dwollaCustomerUrl) throw new Error("Error creating dwolla customer");
    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

  

    // store the extra profile fields Supabase Auth doesn't hold itself
    const supabaseAdmin = createAdminClient();
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUserId,
        first_name: userData.first_name,
        last_name: userData.last_name,
        address1: userData.address1,
        city: userData.city,
        state: userData.state,
        postal_code: userData.postalCode,
        date_of_birth: userData.dateOfBirth,
        ssn: userData.ssn,
        email: userData.email,
        dwolla_customer_id: dwollaCustomerId,
        dwolla_customer_url: dwollaCustomerUrl,
      
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Map database fields (snake_case) to User type fields (camelCase)
    const user = {
      ...newProfile,
      dwollaCustomerId: newProfile.dwolla_customer_id,
      dwollaCustomerUrl: newProfile.dwolla_customer_url,
      postalCode: newProfile.postal_code,
      dateOfBirth: newProfile.date_of_birth,
    };

    return { 
      user: parseStringify(user), 
      needsEmailConfirmation: false 
    };
  } catch (error) {
    console.error("Error", error);

    // mirror the original tutorial's cleanup: if anything after auth
    // creation fails, delete the auth user so sign-up can be retried
    if (newUserId) {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
    }

    throw error;
  }
};

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific error cases with better messages
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email address before signing in.');
      }
      if (error.message.includes('rate limit')) {
        throw new Error('Too many login attempts. Please wait a few minutes and try again.');
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Sign in failed. Please try again.');
    }

    const user = await getUserInfo({ userId: data.user.id });
    return parseStringify(user);
  } catch (error) {
    console.error("Error", error);
    // Re-throw the error so the UI can display it
    throw error;
  }
};

export const getLoggedInUser = async () => {
  try {
    const supabase = await createClient();
    // getUser() re-checks with the Supabase Auth server instead of just
    // trusting the local cookie — the safer call to make server-side,
    // especially for a banking app.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const profile = await getUserInfo({ userId: user.id });
    return parseStringify(profile);
  } catch (error) {
    console.error("Error", error);
    return null;
  }
};

// logout functionality

export const logoutAccount = async () => {
    try{
        const supabase = await createClient();
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        return true;
    } catch (error) {
        console.error("Error", error);
        return null;
    }
};



// CREATE PLAID LINK TOKEN
export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.id, // was user.$id under Appwrite
      },
      client_name: user?.first_name + user?.last_name,
      products: ["auth", "transactions"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.error(
      "An error occurred while creating a new Horizon user:",
      error
    );
  }
};

// EXCHANGE PLAID PUBLIC TOKEN
export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];

    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse =
      await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    if (!fundingSourceUrl) throw Error;

    await createBankAccount({
      userId: user.id, // was user.$id under Appwrite
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      sharableId: encryptId(accountData.account_id),
    });

    revalidatePath("/");

    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (error) {
    console.error(
      "An error occurred while creating exchanging token:",
      error
    );
  }
};


export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) return null;
    
    // Map database fields (snake_case) to User type fields (camelCase)
    const user = {
      ...data,
      dwollaCustomerId: data.dwolla_customer_id,
      dwollaCustomerUrl: data.dwolla_customer_url,
      postalCode: data.postal_code,
      dateOfBirth: data.date_of_birth,
    };
    
    return parseStringify(user);
  } catch (error) {
    console.error("Error", error);
    return null;
  }
};

export const createBankAccount = async ({
  accessToken,
  userId,
  accountId,
  bankId,
  fundingSourceUrl,
  sharableId,
}: createBankAccountProps) => {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("banks")
      .insert({
        access_token: accessToken,
        user_id: userId,
        account_id: accountId,
        bank_id: bankId,
        funding_source_url: fundingSourceUrl,
        sharable_id: sharableId,
      })
      .select()
      .single();

    if (error) throw error;
    return parseStringify(data);
  } catch (error) {
    console.error("Error", error);
    return null;
  }
};

// get user bank accounts
export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("banks")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    
    // Map database fields (snake_case) to Bank type fields (camelCase)
    const banks = data?.map((bank: any) => ({
      ...bank,
      accessToken: bank.access_token,
      accountId: bank.account_id,
      bankId: bank.bank_id,
      fundingSourceUrl: bank.funding_source_url,
      sharableId: bank.sharable_id,
      userId: bank.user_id,
    }));
    
    return parseStringify(banks);
  } catch (error) {
    console.error("Error", error);
    return null;
  }
};

// get specific bank from the banks table by row id
// (param kept as "documentId" so existing callers elsewhere in the app
// don't need to change — it's just a Postgres uuid now, not an Appwrite
// document id)
export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("banks")
      .select("*")
      .eq("id", documentId)
      .single();

    if (error) return null;
    
    // Map database fields (snake_case) to Bank type fields (camelCase)
    const bank = {
      ...data,
      accessToken: data.access_token,
      accountId: data.account_id,
      bankId: data.bank_id,
      fundingSourceUrl: data.funding_source_url,
      sharableId: data.sharable_id,
      userId: data.user_id,
      // Add $id for backward compatibility
      $id: data.id,
    };
    
    return parseStringify(bank);
  } catch (error) {
    console.error("Error", error);
    return null;
  }
};

// get specific bank from the banks table by Plaid account id.
// Used to look up the RECEIVER's bank during a transfer — deliberately
// not scoped to the current user, which is exactly why this (like every
// query above) goes through the admin client rather than a user-scoped
// RLS-filtered query.
export const getBankByAccountId = async ({
  accountId,
}: getBankByAccountIdProps) => {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("banks")
      .select("*")
      .eq("account_id", accountId)
      .single();

    if (error) return null;
    
    // Map snake_case fields to camelCase
    const mappedBank = data ? {
      id: data.id,
      userId: data.user_id,
      accountId: data.account_id,
      bankId: data.bank_id,
      accessToken: data.access_token,
      fundingSourceUrl: data.funding_source_url,
      sharableId: data.sharable_id,
      createdAt: data.created_at,
      // Keep original field names for backward compatibility
      $id: data.id,
    } : null;
    
    return parseStringify(mappedBank);
  } catch (error) {
    console.error("Error", error);
    return null;
  }
};
