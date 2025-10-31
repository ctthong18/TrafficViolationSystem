"use client"
import { useEffect, useState } from "react"

export interface PaymentMethod {
  id: string
  title: string
  description: string
  available: boolean
  steps: string[]
  methods: string[]
}

export interface PaymentOffice {
  name: string
  address: string
  phone: string
  hours: string
  services: string[]
}

export interface FAQItem {
  question: string
  answer: string
}

export function usePaymentData() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [offices, setOffices] = useState<PaymentOffice[]>([])
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [methodsRes, officesRes, faqsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/methods`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/offices`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/faq`),
        ])

        if (!methodsRes.ok || !officesRes.ok || !faqsRes.ok) {
          throw new Error("Không thể tải dữ liệu thanh toán")
        }

        setMethods(await methodsRes.json())
        setOffices(await officesRes.json())
        setFaqs(await faqsRes.json())
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { methods, offices, faqs, loading, error }
}
