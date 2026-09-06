import HeaderBox from '@/components/HeaderBox'
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getAccounts, getAccount } from '@/lib/actions/bank.actions';
import { formatAmount } from '@/lib/utils';
import TransactionsTable from '@/components/TransactionsTable';
import { Pagination } from '@/components/Pagination';
import PlaidLink from '@/components/PlaidLink';

export const dynamic = 'force-dynamic';

const TransactionHistory = async ({ searchParams }: SearchParamProps) => {
const { id, page } = await searchParams;
const currentPage = Number(page as string ) || 1;
const loggedIn = await getLoggedInUser();
const accounts = await getAccounts({
          userId: loggedIn.id
      })
 
if (!accounts) return;
const accountsData = accounts?.data

// Safety net: if no bank accounts are linked
if (!accountsData || accountsData.length === 0) {
    return (
        <section className="transactions">
            <div className="transactions-header">
                <HeaderBox
                  title="Transaction History"
                  subtext="Connect your bank account to view transactions."
                />
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

// Handle case where account is null
if (!account || !account.data) {
    return (
        <section className="transactions">
            <div className="transactions-header">
                <HeaderBox
                  title="Transaction History"
                  subtext="Unable to load account details."
                />
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <p className="text-gray-600 text-center">
                        There was an issue loading your account. Please try again or connect a different account.
                    </p>
                    <PlaidLink user={loggedIn} variant="primary" />
                </div>
            </div>
        </section>
    );
}

const rowsPerPage = 10;
const totalPages = Math.ceil((account?.transactions?.length || 0) / rowsPerPage);
const indexOfLastTransaction = currentPage * rowsPerPage;
const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
const currentTransactions = account?.transactions?.slice(
    indexOfFirstTransaction, indexOfLastTransaction
  ) || []

  return (
   <section className='transactiions'>
    <div className="transactions-header">
      <HeaderBox
       title="Transaction History"
       subtext="See your bank details and transactions."
     
      />
      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className='text-18 font-bold text-white'>{account?.data.name}</h2>
            <p className='text-14 text-blue-25'>
              {account?.data.officialName}</p>
               <p className="text-14 font-semibold tracking-[1.1px] text-white">
                   ●●●●●●●● ●●●● {account?.data.mask}
                </p>
          </div>
          <div className="transactions-account-balance">
            <p className="text-14">Current Balance</p>
            <p className="text-24 text-center font-bold">
              {formatAmount(account?.data.currentBalance)}
            </p>
          </div>
        </div>
        <section className="flex w-full flex-col gap-6">
          <TransactionsTable
           transactions={currentTransactions}
         
        />
          {totalPages > 1 && (
            <div className="my-4 w-full">
              <Pagination totalPages={totalPages} page={currentPage} />
            </div>
          )}
        </section>
      </div>
    </div>
   </section>
  )
}

export default TransactionHistory
