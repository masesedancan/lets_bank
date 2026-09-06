import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }


/* 
import React from 'react'
import { FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Form } from  'react-hook-form'
import { z } from 'zod'
import { Control } from 'react-hook-form'
import { authFormSchema } from '@/lib/utils'

interface CustomInput {
    control: Control <z.infer<typeof authFormSchema>>,
    name: string,
    label: string,
    placeholder: string
}

const CustomInput = ({ form, name, label, placeholder}:
 CustomInput ) => {
  return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
            <div className="form-item">
            
        <FormLabel className="form-label">
                      {label}
        </FormLabel>

            <div className="flex w-full flex-col">
                 <FormControl>
                    <Input
                          placeholder={placeholder}
                          className="input-class"
                          {...field}
                    />
                </FormControl>

                <FormMessage className="form-message" />
             </div>
             </div>
        )}
        />

                        

     )
 }

export default CustomInput

/* 
 <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8">
                { type === 'sign-up' && (
                    <>
                      <div className="flex gap-4">
                        <FormField
                       control={form.control}
                       name="firstName"
                       render={({ field }) => (
                        <FormItem className="form-item">
                        <FormLabel className="form-label">
                         First Name
                         </FormLabel>

                         <div className="flex w-full flex-col">
                          <FormControl>
                          <Input
                          placeholder="John"
                          className="input-class"
                          {...field}
                          />
                          </FormControl>

                          <FormMessage className="form-message" />
                        </div>
                            </FormItem>
                            )}
                        />
                           <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                            <FormItem className="form-item">
                                <FormLabel className="form-label">
                                Last Name
                                </FormLabel>

                                <div className="flex w-full flex-col">
                                <FormControl>
                                    <Input
                                    placeholder="ex: Doe"
                                    className="input-class"
                                    {...field}
                                    />
                                </FormControl>

                                <FormMessage className="form-message" />
                                </div>
                            </FormItem>
                            )}
                        />

                      </div>
                      
                         <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                <FormItem className="form-item">
                                    <FormLabel className="form-label">
                                    Address 
                                    </FormLabel>

                                    <div className="flex w-full flex-col">
                                    <FormControl>
                                        <Input
                                        placeholder="Enter your specific address"
                                        className="input-class"
                                        {...field}
                                        />
                                    </FormControl>

                                    <FormMessage className="form-message" />
                                    </div>
                                </FormItem>
                                )}
                            />
                            <div className="flex gap-4">
                             
                                 <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                <FormItem className="form-item">
                                    <FormLabel className="form-label">
                                    State
                                    </FormLabel>

                                    <div className="flex w-full flex-col">
                                    <FormControl>
                                        <Input
                                        placeholder="ex: NY"
                                        className="input-class"
                                        {...field}
                                        />
                                    </FormControl>

                                    <FormMessage className="form-message" />
                                    </div>
                                </FormItem>
                                )}
                            />  
                                 <FormField
                                    control={form.control}
                                    name="postal code"
                                    render={({ field }) => (
                                    <FormItem className="form-item">
                                        <FormLabel className="form-label">
                                        Postal Code
                                        </FormLabel>

                                        <div className="flex w-full flex-col">
                                        <FormControl>
                                            <Input
                                            placeholder="ex: 1234"
                                            className="input-class"
                                            {...field}
                                            />
                                        </FormControl>

                                        <FormMessage className="form-message" />
                                        </div>
                                    </FormItem>
                                    )}
                                />

                            </div>

                            <div className="flex gap-4">
                               
                                <FormField
                                control={form.control}
                                name="date of birth"
                                render={({ field }) => (
                                <FormItem className="form-item">
                                    <FormLabel className="form-label">
                                    Date Of Birth
                                    </FormLabel>

                                    <div className="flex w-full flex-col">
                                    <FormControl>
                                        <Input
                                        placeholder="yyyy-mm-dd"
                                        className="input-class"
                                        {...field}
                                        />
                                    </FormControl>

                                    <FormMessage className="form-message" />
                                    </div>
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ssn"
                                render={({ field }) => (
                                <FormItem className="form-item">
                                    <FormLabel className="form-label">
                                    SSN
                                    </FormLabel>

                                    <div className="flex w-full flex-col">
                                    <FormControl>
                                        <Input
                                        placeholder="ex: 1234"
                                        className="input-class"
                                        {...field}
                                        />
                                    </FormControl>

                                    <FormMessage className="form-message" />
                                    </div>
                                </FormItem>
                                )}
                            />
                            </div>
                                </>
                            )
                            }
                        
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="form-item">
                    <FormLabel className="form-label">
                      Email
                    </FormLabel>

                    <div className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          className="input-class"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage className="form-message" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="form-item">
                    <FormLabel className="form-label">
                      Password
                    </FormLabel>

                    <div className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="input-class"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage className="form-message" />
                    </div>
                  </FormItem>
                )}
              />


*/