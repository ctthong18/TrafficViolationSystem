"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Building, ExternalLink } from "lucide-react"
import { PaymentOffice } from "@/hooks/usePaymentData"
import { Badge } from "@/components/ui/badge"

interface Props {
  offices: PaymentOffice[]
}

export function PaymentOffices({ offices }: Props) {
  if (!offices.length) return <p>Chưa có dữ liệu văn phòng</p>

  return (
    <div className="space-y-4">
      {offices.map((office, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              {office.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Địa chỉ:</p>
                    <p className="text-sm text-muted-foreground">{office.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Giờ làm việc:</p>
                    <p className="text-sm text-muted-foreground">{office.hours}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Số điện thoại:</p>
                  <p className="text-sm text-primary font-medium">{office.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Dịch vụ:</p>
                  <div className="flex flex-wrap gap-1">
                    {office.services.map((service, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Xem bản đồ
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Thông tin chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
