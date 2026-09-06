import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import {  getAccount, getAccounts } from '@/lib/actions/bank.actions'
import RecentTransactions from '@/components/RecentTransactions';
import PlaidLink from '@/components/PlaidLink';

export const dynamic = 'force-dynamic';

const Home = async ( { searchParams }:SearchParamProps) =>{
    const { id, page } = await searchParams;
    const currentPage = Number(page as string ) || 1;
    const loggedIn = await getLoggedInUser();
    const accounts = await getAccounts({
        userId: loggedIn.id
    })
    if (!accounts) return;
    const accountsData = accounts?.data
    
    
    // Safety net: if no bank accounts are linked, show connect prompt
    if (!accountsData || accountsData.length === 0) {
        return (
            <section className="home">
                <div className="home-content">
                    <header className="home-header">
                        <HeaderBox
                          type="greeting"
                          title="Welcome"
                          user={loggedIn?.first_name || 'Guest'}
                          subtext="Connect your bank account to get started."
                        />
                    </header>
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <p className="text-gray-600 text-center">
                            You haven't connected any bank accounts yet. Click below to link your first account.
                        </p>
                        <PlaidLink user={loggedIn} variant="primary" />
                    </div>
                </div>
            </section>
        );
    }
    
    const appwriteItemId = (id as string) || accounts?.data[0]?.appwriteItemId;
    const account = await getAccount({ appwriteItemId })
   
    return (
        <section className="home">
            <div className="home-content">
                <header className="home-header">
                    <HeaderBox
                      type="greeting"
                      title="Welcome"
                      user={loggedIn?.first_name || 'Guest'}
                      subtext="Access and manage your account and transactions efficiently."
                    />
                    <TotalBalanceBox
                    accounts={accountsData}
                    totalBanks={accounts?.totalBanks}
                    totalCurrentBalance={accounts?.totalCurrentBalance}
                    />
                </header>
               <RecentTransactions
                accounts={accountsData}
                transactions={account?.transactions}
                appwriteItemId={appwriteItemId}
                page={currentPage}
               />
            </div>
            <RightSidebar
               user={loggedIn}
               transactions={account?.transactions}
               banks={accountsData?.slice(0, 2)}
            />
        </section>
    )
}

export default Home
