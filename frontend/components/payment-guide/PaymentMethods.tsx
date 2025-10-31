"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { PaymentMethod } from "@/hooks/usePaymentData"

interface Props {
  methods: PaymentMethod[]
}

export function PaymentMethods({ methods }: Props) {
  if (!methods.length) return <p>Chưa có dữ liệu phương thức thanh toán</p>

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
      {methods.map((method) => (
        <Card key={method.id} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">{method.title}</CardTitle>
              {method.available ? (
                <Badge className="bg-success text-success-foreground">Khả dụng</Badge>
              ) : (
                <Badge variant="secondary">Sắp có</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{method.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Các bước thực hiện:</h4>
              <ol className="text-sm space-y-1">
                {method.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">Phương thức hỗ trợ:</h4>
              <div className="flex flex-wrap gap-1">
                {method.methods.map((m, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>

            {method.available && (
              <Button className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Thanh toán ngay
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
