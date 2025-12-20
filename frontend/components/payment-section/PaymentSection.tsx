"use client"

import PaymentGuide from "../payment-guide/PaymentGuide"
import { WalletManagement } from "../payment-section/WalletManagement"
import { ViolationRulesView } from "../payment-section/ViolationRulesView"

interface PaymentSectionProps {
  activeSubTab: string
}

export function PaymentSection({ activeSubTab }: PaymentSectionProps) {
  return (
    <div className="space-y-6">
      {activeSubTab === "payment" && <PaymentGuide />}
      {activeSubTab === "wallet" && <WalletManagement />}
      {activeSubTab === "rules" && <ViolationRulesView />}
    </div>
  )
}
