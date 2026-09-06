
"use client";

import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { email, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";

import CustomInput from "@/components/CustomInput";

import { authFormSchema } from "@/lib/utils";

import { useRouter } from 'next/navigation';
import { signUp, signIn } from "@/lib/actions/user.actions";
 import PlaidLink from "./PlaidLink";



const AuthForm =  ({ type }: { type: "sign-in" | "sign-up" }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  


  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: type === 'sign-in' ? {
      email: "",
      password: "",
    } : {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      address1: "",
      city: "",
      state: "",
      postalCode: "",
      dateOfBirth: "",
      ssn: "",
    },
  });

  const  onSubmit = async(data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      

      //  Sign up with Supabase & create Dwolla customer

      if(type === 'sign-up'){
        const newUser = await signUp(data);

        if (!newUser) {
          throw new Error('Sign up failed. Please try again.');
        }

        setUser(newUser);

      }

      if(type === 'sign-in'){
        const response = await signIn({
        email: data.email,
        password:data.password,
        })

      if(response) {
        router.push('/');
      } else {
        throw new Error('Sign in failed. Please check your credentials.');
      }

      }
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
      
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div >
      <section className="auth-form">

        <header className="flex flex-col gap-5 md:gap-8">

          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Image
              src="/icons/logo.svg"
              width={34}
              height={34}
              alt="Horizon logo"
            />

            <h1 className="text-2xl font-bold">
              Horizon
            </h1>
          </Link>

          <div>

            <h2 className="text-3xl font-semibold">
              {user
                ? "Link Account"
                : type === "sign-in"
                ? "Sign In"
                : "Sign Up"}
            </h2>

            <p className="text-gray-600 mt-2">
              {user
                ? "Link your account to get started"
                : "Please enter your details"}
            </p>

          </div>

        </header>

        {user ? ( 
       
          <div>
            <PlaidLink  user={user} variant="primary"/> 
          </div>
        ) : ( 
          <>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))}
                  className="space-y-8"
                >
                  { type === 'sign-up' && 
                  <>
                    <div className="flex gap-4">
                      <CustomInput
                      control={form.control}
                      name="first_name"
                      label="First Name"
                      placeholder="John"
                      type="string"
                    />
                    <CustomInput
                      control={form.control}
                      name="last_name"
                      label="Last Name"
                      placeholder="ex: Doe"
                      type="string"
                    />
                  </div>
                  <CustomInput
                    control={form.control}
                    name="address1"
                    label="Adress"
                    placeholder="Enter your specific address"
                    type="string"
                  />
                  <CustomInput
                    control={form.control}
                    name="city"
                    label="City"
                    placeholder="Enter your city"
                    type="string"
                  />
                  <div className="flex gap-4">
                    <CustomInput
                      control={form.control}
                      name="state"
                      label="State"
                      placeholder="ex: NY"
                      type="string"
                    />
                    <CustomInput
                      control={form.control}
                      name="postalCode"
                      label="Postal Code "
                      placeholder="ex: 11001"
                      type="string"
                    />
                  </div>
                  <div className="flex gap-4">
                    <CustomInput
                      control={form.control}
                      name="dateOfBirth"
                      label="Date Of Birth"
                      placeholder="yyyy-mm-dd"
                      type="string"
                    />
                    <CustomInput
                      control={form.control}
                      name="ssn"
                      label="SSN"
                      placeholder="ex: 1234"
                      type="string"
                    />
                  </div>
                  </>
                  }
                  <CustomInput
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                  />

                  <CustomInput
                    control={form.control}
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="string"
                  />

                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-4"> 

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="form-btn w-full"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2
                            size={20}
                            className="animate-spin"
                          />
                          Loading...
                        </span>
                      ) : type === "sign-in" ? (
                        "Sign In"
                      ): (
                        "Sign Up"
                      )}
                    </button>
                  </div>
                </form>
              </Form>
          </>
        )} 

        <footer className="flex justify-center gap-1 ">

          <p className="text-14 font-normal text-gray-600">
            {type === "sign-in"
              ? "Don't have an account?"
              : "Already have an account?"}
          </p>

          <Link
            href={
              type === "sign-in"
                ? "/sign-up"
                : "/sign-in"
            }
            className="form-link"
          >
            {type === "sign-in"
              ? "Sign Up"
              : "Sign In"}
          </Link>

        </footer>

      </section>
    </div>
  );
};

export default AuthForm;