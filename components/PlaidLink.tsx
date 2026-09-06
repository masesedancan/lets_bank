"use client";

import { Button } from './ui/button'
import { useCallback, useEffect, useState } from 'react'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation'
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions'
import Image from "next/image";

const PlaidLink = ({ user, variant }: PlaidLinkProps) => {

  const router = useRouter();  
  const [token, setToken] = useState('') 
  
  useEffect(() => {
    const getLinkToken = async () => {
       const data = await createLinkToken(user);
       setToken(data?.linkToken);
    }
    getLinkToken();

  }, [user]);



  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string | null) => {
    console.log('PlaidLink onSuccess called with token:', public_token ? 'token received' : 'no token');
    if (!public_token) return;
    
    console.log('Exchanging public token...');
    await exchangePublicToken({
      publicToken: public_token,
      user,
    })
    console.log('Exchange complete, redirecting to dashboard');
    router.push('/');
  }, [user, router])  
  const config: PlaidLinkOptions = {
    token,
    onSuccess
  }

  const { open, ready } = usePlaidLink(config);

  return (
    <>
      {variant === 'primary' ? (
        <Button
        onClick={() => open()}
        disabled={!ready}
        
        className="plaidlink-primary flex-center size-full max-sm:px-6">
            Connect Bank
        </Button>
      ): variant === 'ghost' ? (
        <Button 
          onClick={() => open()}
          className="plaidlink-default"
        >
           <Image
           src="/icons/connect-bank.svg"
           alt="connect-bank"
           width={24}
           height={24}
          
          />
            <p className='hiddenl text-[16px] font-semibold text-black-2 xl:block'>
            Connect Bank</p>
        </Button>
      ):(
        <Button
         onClick={() => open()} variant="ghost"
         className="plaidlink-default"
        
        >
          <Image
           src="/icons/connect-bank.svg"
           alt="connect-bank"
           width={24}
           height={24}
          
          />
            <p className='text-[16px] font-semibold text-black-2'>
            Connect Bank</p>
        </Button>
      ) }
    
    </>
  )
}



export default PlaidLink