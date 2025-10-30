"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, CreditCard, FileText } from "lucide-react"

export function ViolationLookup() {
  const [searchType, setSearchType] = useState<"license" | "id">("license")
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchValue.trim()) return

    setIsSearching(true)

    // Mock search results
    setTimeout(() => {
      const mockResults = [
        {
          id: "VL-001",
          type: "Vượt đèn đỏ",
          location: "Ngã tư Láng Hạ",
          time: "14:30 - 15/12/2024",
          licensePlate: searchType === "license" ? searchValue : "30A-12345",
          status: "unpaid",
          fine: "1,000,000 VNĐ",
          dueDate: "29/12/2024",
          evidence: "CAM-001_20241215_1430.jpg",
        },
        {
          id: "VL-045",
          type: "Đỗ xe sai quy định",
          location: "Phố Bà Triệu",
          time: "10:30 - 10/12/2024",
          licensePlate: searchType === "license" ? searchValue : "30A-12345",
          status: "paid",
          fine: "300,000 VNĐ",
          paidDate: "12/12/2024",
          evidence: "Báo cáo từ người dân",
        },
      ]

      setSearchResults(searchType === "id" ? mockResults.filter((r) => r.id === searchValue) : mockResults)
      setIsSearching(false)
    }, 1000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unpaid":
        return <Badge className="bg-warning text-warning-foreground">Chưa thanh toán</Badge>
      case "paid":
        return <Badge className="bg-success text-success-foreground">Đã thanh toán</Badge>
      case "processing":
        return <Badge className="bg-primary text-primary-foreground">Đang xử lý</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tra cứu vi phạm</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant={searchType === "license" ? "default" : "outline"}
              onClick={() => setSearchType("license")}
              className="flex-1"
            >
              Tra cứu theo biển số
            </Button>
            <Button
              variant={searchType === "id" ? "default" : "outline"}
              onClick={() => setSearchType("id")}
              className="flex-1"
            >
              Tra cứu theo mã vi phạm
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">{searchType === "license" ? "Biển số xe" : "Mã vi phạm"}</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder={
                  searchType === "license" ? "Nhập biển số xe (VD: 30A-12345)" : "Nhập mã vi phạm (VD: VL-001)"
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching || !searchValue.trim()}>
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang tìm...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Tìm kiếm
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kết quả tìm kiếm ({searchResults.length})</h3>
            {searchResults.map((violation) => (
              <div key={violation.id} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">{violation.id}</span>
                    {getStatusBadge(violation.status)}
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${
                        violation.status === "unpaid" ? "text-destructive" : "text-success"
                      }`}
                    >
                      {violation.fine}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Loại vi phạm:</span>
                    <p className="font-medium">{violation.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Biển số:</span>
                    <p className="font-medium">{violation.licensePlate}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Địa điểm:</span>
                    <p className="font-medium">{violation.location}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Thời gian:</span>
                    <p className="font-medium">{violation.time}</p>
                  </div>
                </div>

                {violation.status === "unpaid" && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <p className="text-sm text-warning-foreground">
                      <strong>Hạn nộp phạt:</strong> {violation.dueDate}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vui lòng thanh toán trước hạn để tránh bị tăng mức phạt
                    </p>
                  </div>
                )}

                {violation.status === "paid" && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <p className="text-sm text-success-foreground">
                      <strong>Đã thanh toán:</strong> {violation.paidDate}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Xem bằng chứng
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Tải quyết định
                  </Button>
                  {violation.status === "unpaid" && (
                    <Button size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Thanh toán ngay
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchValue && !isSearching && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Không tìm thấy vi phạm nào với {searchType === "license" ? "biển số" : "mã vi phạm"}:{" "}
              <strong>{searchValue}</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
