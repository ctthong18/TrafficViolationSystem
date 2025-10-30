"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Smartphone, Building, MapPin, Clock, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"

export function PaymentGuide() {
  const paymentMethods = [
    {
      id: "online",
      title: "Thanh toán trực tuyến",
      icon: CreditCard,
      description: "Thanh toán qua internet banking, ví điện tử",
      available: true,
      steps: [
        "Truy cập cổng thanh toán điện tử",
        "Nhập mã vi phạm hoặc biển số xe",
        "Chọn phương thức thanh toán",
        "Xác nhận và hoàn tất thanh toán",
        "Lưu biên lai điện tử",
      ],
      methods: ["Internet Banking", "Ví MoMo", "ZaloPay", "VNPay", "Thẻ ATM/Visa/Master"],
    },
    {
      id: "mobile",
      title: "Thanh toán qua ứng dụng",
      icon: Smartphone,
      description: "Sử dụng app di động để thanh toán",
      available: true,
      steps: [
        "Tải ứng dụng CSGT trên điện thoại",
        "Đăng ký/Đăng nhập tài khoản",
        "Quét mã QR hoặc nhập thông tin vi phạm",
        "Chọn phương thức thanh toán",
        "Xác nhận và hoàn tất giao dịch",
      ],
      methods: ["App CSGT", "App Ngân hàng", "Ví điện tử"],
    },
    {
      id: "office",
      title: "Thanh toán tại cơ quan",
      icon: Building,
      description: "Đến trực tiếp cơ quan CSGT để thanh toán",
      available: true,
      steps: [
        "Chuẩn bị giấy tờ cần thiết",
        "Đến cơ quan CSGT có thẩm quyền",
        "Làm thủ tục thanh toán tại quầy",
        "Nhận biên lai thanh toán",
        "Lưu giữ biên lai để đối chiếu",
      ],
      methods: ["Tiền mặt", "Chuyển khoản"],
    },
  ]

  const offices = [
    {
      name: "Phòng CSGT Công an TP Hà Nội",
      address: "số 67 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội",
      phone: "024.3825.2222",
      hours: "7:30 - 11:30, 13:30 - 17:00 (T2-T6)",
      services: ["Thanh toán phạt", "Giải quyết khiếu nại", "Tư vấn"],
    },
    {
      name: "Chi cục CSGT số 1",
      address: "số 12 Phạm Hùng, Nam Từ Liêm, Hà Nội",
      phone: "024.3768.1234",
      hours: "7:30 - 11:30, 13:30 - 17:00 (T2-T6)",
      services: ["Thanh toán phạt", "Xử lý vi phạm"],
    },
    {
      name: "Chi cục CSGT số 2",
      address: "số 456 Giải Phóng, Hai Bà Trưng, Hà Nội",
      phone: "024.3971.5678",
      hours: "7:30 - 11:30, 13:30 - 17:00 (T2-T6)",
      services: ["Thanh toán phạt", "Xử lý vi phạm"],
    },
  ]

  const faqItems = [
    {
      question: "Thời hạn thanh toán phạt vi phạm giao thông là bao lâu?",
      answer:
        "Theo quy định, người vi phạm phải thanh toán phạt trong vòng 15 ngày kể từ ngày nhận quyết định xử phạt. Nếu quá hạn, mức phạt có thể bị tăng thêm.",
    },
    {
      question: "Có thể thanh toán phạt thay cho người khác không?",
      answer:
        "Có thể thanh toán thay, nhưng cần có đầy đủ thông tin về vi phạm (mã vi phạm, biển số xe) và giấy tờ ủy quyền hợp lệ nếu thanh toán tại cơ quan.",
    },
    {
      question: "Làm thế nào để lấy biên lai thanh toán?",
      answer:
        "Với thanh toán trực tuyến: biên lai điện tử sẽ được gửi qua email/SMS. Với thanh toán tại cơ quan: nhận biên lai giấy ngay tại quầy.",
    },
    {
      question: "Phí giao dịch khi thanh toán trực tuyến là bao nhiều?",
      answer:
        "Phí giao dịch tùy thuộc vào phương thức thanh toán: Internet Banking (miễn phí), Ví điện tử (0-5,000 VNĐ), Thẻ ATM/Visa (5,000-15,000 VNĐ).",
    },
    {
      question: "Có thể khiếu nại về vi phạm không đúng không?",
      answer:
        "Có thể khiếu nại trong vòng 10 ngày kể từ ngày nhận quyết định. Nộp đơn khiếu nại tại cơ quan CSGT có thẩm quyền kèm theo bằng chứng.",
    },
  ]

  return (
    <div className="space-y-6">
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
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {paymentMethods.map((method) => (
              <Card key={method.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <method.icon className="h-5 w-5 text-primary" />
                      {method.title}
                    </CardTitle>
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
                      {method.methods.map((m, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Lưu ý quan trọng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium text-success flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Nên làm:
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Thanh toán đúng hạn để tránh phạt bổ sung</li>
                    <li>• Lưu giữ biên lai thanh toán</li>
                    <li>• Kiểm tra thông tin vi phạm trước khi thanh toán</li>
                    <li>• Sử dụng các kênh thanh toán chính thức</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Tránh làm:
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Thanh toán qua các kênh không chính thức</li>
                    <li>• Bỏ qua việc kiểm tra thông tin vi phạm</li>
                    <li>• Thanh toán muộn hạn</li>
                    <li>• Mất biên lai thanh toán</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offices" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          {faqItems.map((item, index) => (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
