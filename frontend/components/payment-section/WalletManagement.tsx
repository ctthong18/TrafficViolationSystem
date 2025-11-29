"use client"

import { useEffect } from "react"
import { usePayments } from "@/hooks/usePayment"
import { WalletSummary } from "../wallet/WalletSummary"
import { DepositForm } from "../wallet/DepositForm"
import { WalletHistory } from "../wallet/WalletHistory"

export function WalletManagement() {
  const { payments, loading, refetch } = usePayments()

  // Filter wallet-related transactions
  const walletTransactions = payments.filter(
    (p) => p.type === "wallet_deposit" || p.payment_method === "wallet"
  )

  const handleDepositSuccess = () => {
    refetch()
  }

  return (
    <div className="space-y-6">
      <WalletSummary />
      
      <div className="grid gap-6 md:grid-cols-2">
        <DepositForm onSuccess={handleDepositSuccess} />
        <div className="md:col-span-2">
          <WalletHistory transactions={walletTransactions} loading={loading} />
        </div>
      </div>
    </div>
  )
}
