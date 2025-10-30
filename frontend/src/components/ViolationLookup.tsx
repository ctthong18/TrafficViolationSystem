"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Search, Car, CreditCard, Calendar, MapPin, AlertTriangle } from "lucide-react"

export default function ViolationLookup() {
  const [searchType, setSearchType] = useState("license")
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchValue.trim()) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const mockResults = [
        {
          id: "VL001",
          type: "Vượt đèn đỏ",
          location: "Ngã tư Láng Hạ, Hà Nội",
          date: "15/01/2024 14:30",
          licensePlate: "30A-12345",
          fine: "1.000.000",
          status: "unpaid",
          dueDate: "30/01/2024",
          evidence: "/placeholder.jpg",
        },
        {
          id: "VL002",
          type: "Quá tốc độ",
          location: "Đại lộ Thăng Long, Hà Nội",
          date: "10/01/2024 09:15",
          licensePlate: "30A-12345",
          fine: "800.000",
          status: "paid",
          paidDate: "12/01/2024",
          evidence: "/placeholder.jpg",
        },
      ]
      setSearchResults(mockResults)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tra cứu vi phạm giao thông</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={searchType} onValueChange={setSearchType} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="license">Theo biển số xe</TabsTrigger>
              <TabsTrigger value="violation">Theo mã vi phạm</TabsTrigger>
            </TabsList>

            <TabsContent value="license" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="license-plate">Biển số xe</Label>
                <Input
                  id="license-plate"
                  placeholder="Ví dụ: 30A-12345"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="violation" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="violation-code">Mã vi phạm</Label>
                <Input
                  id="violation-code"
                  placeholder="Ví dụ: VL001"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </TabsContent>

            <Button onClick={handleSearch} disabled={isLoading || !searchValue.trim()} className="w-full">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang tìm kiếm...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Tra cứu
                </div>
              )}
            </Button>
          </Tabs>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Kết quả tra cứu ({searchResults.length})</h3>
          {searchResults.map((violation) => (
            <Card key={violation.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg">{violation.id}</span>
                      <Badge variant={violation.status === "paid" ? "default" : "destructive"}>
                        {violation.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-lg mb-2">{violation.type}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-destructive">{violation.fine} VNĐ</p>
                    {violation.status === "unpaid" && (
                      <p className="text-sm text-muted-foreground">Hạn nộp: {violation.dueDate}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Biển số: {violation.licensePlate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Thời gian: {violation.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Địa điểm: {violation.location}</span>
                  </div>
                  {violation.status === "paid" && violation.paidDate && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Đã thanh toán: {violation.paidDate}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <Label className="text-sm font-medium">Bằng chứng vi phạm:</Label>
                  <img
                    src={violation.evidence || "/placeholder.svg"}
                    alt="Evidence"
                    className="w-full max-w-md h-48 object-cover rounded-lg border mt-2"
                  />
                </div>

                {violation.status === "unpaid" && (
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Thanh toán ngay
                    </Button>
                    <Button variant="outline">Xem hướng dẫn thanh toán</Button>
                  </div>
                )}

                {violation.status === "unpaid" && (
                  <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Lưu ý quan trọng</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vui lòng thanh toán trước ngày {violation.dueDate} để tránh bị tăng mức phạt.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchResults.length === 0 && searchValue && !isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Không tìm thấy vi phạm</h3>
            <p className="text-muted-foreground">
              Không tìm thấy vi phạm nào với thông tin "{searchValue}". Vui lòng kiểm tra lại thông tin tìm kiếm.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
