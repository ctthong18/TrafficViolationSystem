import { useState, useEffect } from 'react'
import { drivingLicenseApi, DrivingLicense, DrivingLicenseCreate, DrivingLicenseUpdate } from '@/lib/api'

export function useDrivingLicense() {
  const [license, setLicense] = useState<DrivingLicense | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLicense = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await drivingLicenseApi.getMy()
      setLicense(data)
    } catch (err) {
      console.error('Failed to fetch driving license:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch driving license')
    } finally {
      setLoading(false)
    }
  }

  const createLicense = async (data: DrivingLicenseCreate) => {
    try {
      const newLicense = await drivingLicenseApi.create(data)
      setLicense(newLicense)
      return newLicense
    } catch (err) {
      console.error('Failed to create driving license:', err)
      throw err
    }
  }

  const updateLicense = async (id: number, data: DrivingLicenseUpdate) => {
    try {
      const updatedLicense = await drivingLicenseApi.update(id, data)
      setLicense(updatedLicense)
      return updatedLicense
    } catch (err) {
      console.error('Failed to update driving license:', err)
      throw err
    }
  }

  const deleteLicense = async (id: number) => {
    try {
      await drivingLicenseApi.delete(id)
      setLicense(null)
    } catch (err) {
      console.error('Failed to delete driving license:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchLicense()
  }, [])

  return {
    license,
    loading,
    error,
    refetch: fetchLicense,
    createLicense,
    updateLicense,
    deleteLicense
  }
}
