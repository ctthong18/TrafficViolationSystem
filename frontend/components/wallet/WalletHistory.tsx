"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUpCircle, ArrowDownCircle, History, ChevronLeft, ChevronRight } from "lucide-react"
import { Payment } from "@/hooks/payment-type"
import { Skeleton } from "@/components/ui/skeleton"

interface WalletHistoryProps {
  transactions?: Payment[]
  loading?: boolean
}

export function WalletHistory({ transactions = [], loading = false }: WalletHistoryProps) {
  const [filter, setFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true
    if (filter === "deposit") return transaction.type === "wallet_deposit"
    if (filter === "payment") return transaction.type === "fine"
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  const getTransactionIcon = (type?: string) => {
    if (type === "wallet_deposit") {
      return <ArrowUpCircle className="h-5 w-5 text-green-600" />
    }
    return <ArrowDownCircle className="h-5 w-5 text-orange-600" />
  }

  const getTransactionType = (type?: string) => {
    if (type === "wallet_deposit") {
      return <Badge className="bg-green-100 text-green-800">Nạp tiền</Badge>
    }
    return <Badge className="bg-orange-100 text-orange-800">Thanh toán phạt</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success">Thành công</Badge>
      case "pending":
        return <Badge className="bg-warning">Chờ xử lý</Badge>
      case "failed":
        return <Badge className="bg-destructive">Thất bại</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("vi-VN")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Lịch sử giao dịch
            </CardTitle>
            <CardDescription>
              Xem lại các giao dịch nạp tiền và thanh toán phạt
            </CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="deposit">Nạp tiền</SelectItem>
              <SelectItem value="payment">Thanh toán phạt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại</TableHead>
                    <TableHead>Mã giao dịch</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          {getTransactionType(transaction.type)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.receipt_number || `#${transaction.id}`}
                      </TableCell>
                      <TableCell>
                        <span className={transaction.type === "wallet_deposit" ? "text-green-600 font-semibold" : "text-orange-600 font-semibold"}>
                          {transaction.type === "wallet_deposit" ? "+" : "-"}
                          {transaction.amount.toLocaleString()} đ
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(transaction.paid_at || transaction.due_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {paginatedTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        {getTransactionType(transaction.type)}
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Mã giao dịch:</span>
                        <span className="text-sm font-medium">
                          {transaction.receipt_number || `#${transaction.id}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Số tiền:</span>
                        <span className={`text-sm font-semibold ${transaction.type === "wallet_deposit" ? "text-green-600" : "text-orange-600"}`}>
                          {transaction.type === "wallet_deposit" ? "+" : "-"}
                          {transaction.amount.toLocaleString()} đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ngày:</span>
                        <span className="text-sm">
                          {formatDate(transaction.paid_at || transaction.due_date)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Trang {currentPage} / {totalPages} ({filteredTransactions.length} giao dịch)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
