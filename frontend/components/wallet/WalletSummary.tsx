"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, CreditCard, AlertCircle } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { Skeleton } from "@/components/ui/skeleton"

export function WalletSummary() {
  const { summary, loading, error, fetchSummary } = useWallet()

  useEffect(() => {
    fetchSummary()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) return null

  const metrics = [
    {
      title: "Số dư hiện tại",
      value: summary.wallet_balance,
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Số dư khả dụng trong ví"
    },
    {
      title: "Tổng đã nạp",
      value: summary.total_deposited,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Tổng số tiền đã nạp vào ví"
    },
    {
      title: "Tổng phạt đã trả",
      value: summary.total_paid_fines,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Tổng số tiền phạt đã thanh toán"
    },
    {
      title: "Phạt chưa trả",
      value: summary.pending_fines,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Tổng số tiền phạt chưa thanh toán"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.value.toLocaleString()} đ
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
