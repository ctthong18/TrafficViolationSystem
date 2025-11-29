import { useState, useEffect } from 'react'
import { paymentApi, Payment, WalletSummary, PaymentReceipt } from '@/lib/api'

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = async (paymentType?: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await paymentApi.getMyPayments(paymentType)
      setPayments(data)
    } catch (err) {
      console.error('Failed to fetch payments:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const fetchWalletSummary = async () => {
    try {
      const data = await paymentApi.getWalletSummary()
      setWalletSummary(data)
    } catch (err) {
      console.error('Failed to fetch wallet summary:', err)
    }
  }

  const createFinePayment = async (violationId: number) => {
    try {
      const payment = await paymentApi.createFinePayment(violationId)
      setPayments(prev => [payment, ...prev])
      return payment
    } catch (err) {
      console.error('Failed to create fine payment:', err)
      throw err
    }
  }

  const depositToWallet = async (amount: number, paymentMethod: 'bank_transfer' | 'credit_card' | 'e_wallet') => {
    try {
      const payment = await paymentApi.depositToWallet({ amount, payment_method: paymentMethod })
      setPayments(prev => [payment, ...prev])
      await fetchWalletSummary()
      return payment
    } catch (err) {
      console.error('Failed to deposit to wallet:', err)
      throw err
    }
  }

  const payFineFromWallet = async (paymentId: number) => {
    try {
      const payment = await paymentApi.payFineFromWallet(paymentId)
      setPayments(prev => prev.map(p => p.id === paymentId ? payment : p))
      await fetchWalletSummary()
      return payment
    } catch (err) {
      console.error('Failed to pay fine from wallet:', err)
      throw err
    }
  }

  const getReceipt = async (paymentId: number): Promise<PaymentReceipt> => {
    try {
      return await paymentApi.getReceipt(paymentId)
    } catch (err) {
      console.error('Failed to get receipt:', err)
      throw err
    }
  }

  const createQRPayment = async (userId: number, paymentId: number) => {
    try {
      return await paymentApi.createQRPayment(userId, paymentId)
    } catch (err) {
      console.error('Failed to create QR payment:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchPayments()
    fetchWalletSummary()
  }, [])

  return {
    payments,
    walletSummary,
    loading,
    error,
    fetchPayments,
    fetchWalletSummary,
    createFinePayment,
    depositToWallet,
    payFineFromWallet,
    getReceipt,
    createQRPayment,
  }
}
