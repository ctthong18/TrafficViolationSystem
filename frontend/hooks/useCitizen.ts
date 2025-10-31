"use client"
import { useState, useEffect } from "react"

export interface Vehicle {
  id: number
  licensePlate: string
  type: string
  brand?: string
  model?: string
  year?: string
  color?: string
  status: "active" | "inactive"
}

export interface Violation {
  date: string
  type: string
  licensePlate: string
  fine: string
  status: "paid" | "unpaid"
}

export interface Citizen {
  fullName: string
  email: string
  phone: string
  address: string
  idNumber: string
  dateOfBirth: string
  vehicles: Vehicle[]
  violationHistory: Violation[]
}

export function useCitizen(citizenId: string) {
  const [citizen, setCitizen] = useState<Citizen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCitizen = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/citizens/${citizenId}`)
        if (!res.ok) throw new Error("Không thể tải dữ liệu")
        const data: Citizen = await res.json()
        setCitizen(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCitizen()
  }, [citizenId])

  return { citizen, setCitizen, loading, error }
}
