"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Wallet, BookOpen } from "lucide-react"
import PaymentGuide from "../payment-guide/PaymentGuide"
import { WalletManagement } from "../payment-section/WalletManagement"
import { ViolationRulesView } from "../payment-section/ViolationRulesView"

export function PaymentSection() {
  const [activeTab, setActiveTab] = useState("payment")

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Thanh toán</span>
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Ví của tôi</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Quy định phạt</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="mt-6">
          <PaymentGuide />
        </TabsContent>

        <TabsContent value="wallet" className="mt-6">
          <WalletManagement />
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <ViolationRulesView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
