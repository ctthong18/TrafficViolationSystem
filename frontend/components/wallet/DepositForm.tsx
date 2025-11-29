"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useWallet } from "@/hooks/useWallet"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Wallet } from "lucide-react"
import Image from "next/image"
import { Payment } from "@/hooks/payment-type"

const depositSchema = z.object({
  amount: z
    .string()
    .min(1, "Vui lòng nhập số tiền")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Số tiền phải lớn hơn 0"
    })
    .refine((val) => Number(val) <= 50000000, {
      message: "Số tiền không được vượt quá 50,000,000 đ"
    }),
  paymentMethod: z.string().min(1, "Vui lòng chọn phương thức thanh toán")
})

type DepositFormValues = z.infer<typeof depositSchema>

interface DepositFormProps {
  onSuccess?: () => void
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const { deposit, loading } = useWallet()
  const { toast } = useToast()
  const [qrPayment, setQrPayment] = useState<Payment | null>(null)

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "",
      paymentMethod: ""
    }
  })

  const onSubmit = async (data: DepositFormValues) => {
    const result = await deposit(Number(data.amount), data.paymentMethod)
    
    if (result) {
      toast({
        title: "Tạo giao dịch thành công",
        description: `Đã tạo giao dịch nạp ${Number(data.amount).toLocaleString()} đ`,
      })
      
      // Show QR code if available (ưu tiên QR URL)
      if (result.qr_url || result.qr_image_base64) {
        setQrPayment(result)
      }
      
      form.reset()
      onSuccess?.()
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể tạo giao dịch nạp tiền",
        variant: "destructive"
      })
    }
  }

  const paymentMethods = [
    { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
    { value: "credit_card", label: "Thẻ tín dụng" },
    { value: "e_wallet", label: "Ví điện tử" }
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Nạp tiền vào ví
          </CardTitle>
          <CardDescription>
            Nhập số tiền và chọn phương thức thanh toán để nạp vào ví
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền (đ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập số tiền"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Số tiền tối đa: 50,000,000 đ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phương thức thanh toán</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phương thức" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Nạp tiền
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={!!qrPayment} onOpenChange={() => setQrPayment(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Quét mã QR để nạp tiền</DialogTitle>
            <DialogDescription>
              Sử dụng ứng dụng ngân hàng để quét mã QR
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {qrPayment?.qr_url ? (
              <Image
                src={qrPayment.qr_url}
                alt="QR code nạp tiền"
                width={220}
                height={220}
                unoptimized
              />
            ) : qrPayment?.qr_image_base64 ? (
              <Image
                src={`data:image/png;base64,${qrPayment.qr_image_base64}`}
                alt="QR code nạp tiền"
                width={220}
                height={220}
                unoptimized
              />
            ) : (
              <p>Không có QR code</p>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Số tiền: <strong>{qrPayment?.amount.toLocaleString()} đ</strong>
            </p>

            {qrPayment?.qr_expiry_time && (
              <p className="text-center text-sm">
                Hạn QR: {new Date(qrPayment.qr_expiry_time).toLocaleString("vi-VN")}
              </p>
            )}

            {qrPayment?.bank_name && (
              <div className="text-center text-sm">
                <p className="text-muted-foreground">Ngân hàng: {qrPayment.bank_name}</p>
                {qrPayment.transfer_content && (
                  <p className="text-muted-foreground">Nội dung: {qrPayment.transfer_content}</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
