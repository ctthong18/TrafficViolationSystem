"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FAQItem } from "@/hooks/usePaymentData"
import { AlertTriangle } from "lucide-react"

interface Props {
  faqs: FAQItem[]
}

export function PaymentFAQ({ faqs }: Props) {
  if (!faqs.length) return <p>Chưa có dữ liệu câu hỏi thường gặp</p>

  return (
    <div className="space-y-4">
      {faqs.map((item, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-base">{item.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Cần hỗ trợ thêm?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Nếu bạn có thắc mắc khác hoặc cần hỗ trợ, vui lòng liên hệ:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Tổng đài hỗ trợ:</h4>
              <p className="text-primary font-medium">1900.1234 (24/7)</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Email hỗ trợ:</h4>
              <p className="text-primary font-medium">hotro@csgt.gov.vn</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
