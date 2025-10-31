"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, MapPin, AlertTriangle } from "lucide-react"
import { usePaymentData } from "@/hooks/usePaymentData"
import { PaymentMethods } from "@/components/payment-guide/PaymentMethods"
import { PaymentOffices } from "@/components/payment-guide/PaymentOffices"
import { PaymentFAQ } from "@/components/payment-guide/PaymentFAQ"

export function PaymentGuide() {
  const { methods, offices, faqs, loading, error } = usePaymentData()

  return (
    <div className="space-y-6">
      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className="text-destructive">{error}</p>}
      {!loading && !error && (
        <Tabs defaultValue="methods" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="methods" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Phương thức thanh toán
            </TabsTrigger>
            <TabsTrigger value="offices" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Địa điểm thanh toán
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Câu hỏi thường gặp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="methods" className="space-y-6">
            <PaymentMethods methods={methods} />
          </TabsContent>

          <TabsContent value="offices" className="space-y-6">
            <PaymentOffices offices={offices} />
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <PaymentFAQ faqs={faqs} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
