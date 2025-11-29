import { useState, useEffect } from 'react'
import { vehicleApi, Vehicle, VehicleCreate, VehicleUpdate } from '@/lib/api'

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await vehicleApi.getMyVehicles()
      setVehicles(data)
    } catch (err) {
      console.error('Failed to fetch vehicles:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }

  const createVehicle = async (data: VehicleCreate) => {
    try {
      const newVehicle = await vehicleApi.create(data)
      setVehicles(prev => [...prev, newVehicle])
      return newVehicle
    } catch (err) {
      console.error('Failed to create vehicle:', err)
      throw err
    }
  }

  const updateVehicle = async (id: number, data: VehicleUpdate) => {
    try {
      const updatedVehicle = await vehicleApi.update(id, data)
      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v))
      return updatedVehicle
    } catch (err) {
      console.error('Failed to update vehicle:', err)
      throw err
    }
  }

  const deleteVehicle = async (id: number) => {
    try {
      await vehicleApi.delete(id)
      setVehicles(prev => prev.filter(v => v.id !== id))
    } catch (err) {
      console.error('Failed to delete vehicle:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  return {
    vehicles,
    loading,
    error,
    refetch: fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle
  }
}
