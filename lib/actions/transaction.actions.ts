"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { parseStringify } from "@/lib/utils";

export const createTransaction = async (
  transaction: CreateTransactionProps
) => {
  try {
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        name: transaction.name,
        // the original type has amount as a string (straight from the
        // form) — cast it explicitly rather than relying on Postgres to
        // coerce a JSON string into the numeric column on insert
        amount: Number(transaction.amount),
        sender_id: transaction.senderId,
        sender_bank_id: transaction.senderBankId,
        receiver_id: transaction.receiverId,
        receiver_bank_id: transaction.receiverBankId,
        email: transaction.email,
      })
      .select()
      .single();

    if (error) throw error;
    return parseStringify(data);
  } catch (error) {
    console.error("Error", error);
  }
};

export const getTransactionsByBankId = async ({
  bankId,
}: getTransactionsByBankIdProps) => {
  try {
    const supabaseAdmin = createAdminClient();

    // Appwrite needed two separate queries (sender match, receiver
    // match) merged together, since it couldn't easily OR across two
    // different fields. Postgres does it in one query.
    // bankId is expected to be a Postgres uuid from getBank/getBanks —
    // don't pass raw/unvalidated user input into this filter string.
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .or(`sender_bank_id.eq.${bankId},receiver_bank_id.eq.${bankId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // kept in the { total, documents } shape so existing callers
    // (e.g. getAccount in bank.actions.ts) don't need to change how
    // they read the result, just how they read each transaction's
    // fields (.id instead of .$id, .created_at instead of .$createdAt, etc.)
    return parseStringify({
      total: data.length,
      documents: data,
    });
  } catch (error) {
    console.error("Error", error);
  }
};

