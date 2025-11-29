export interface Payment {
  id: number
  receipt_number?: string
  violation_code?: string
  amount: number
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled"
  due_date?: string
  paid_at?: string
  payment_method?: "bank_transfer" | "credit_card" | "e_wallet"
  type?: "fine" | "wallet_deposit"
  qr_url?: string  // QR URL từ VietQR
  qr_image_base64?: string  // Giữ lại để backward compatibility
  qr_expiry_time?: string
  bank_name?: string
  transfer_content?: string
  qr_transaction_id?: string
}