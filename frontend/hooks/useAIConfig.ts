"use client"

import { useState, useEffect } from "react"

// Mock types for AI Config
export interface AIConfig {
  id: number
  confidence_threshold: number
  iou_threshold: number
  detection_frequency: number
  violation_types: {
    [key: string]: {
      enabled: boolean
      confidence_min: number
    }
  }
  created_at: string
  is_active: boolean
  notes?: string  // Optional notes field
}

export interface AIConfigCreate {
  confidence_threshold: number
  iou_threshold: number
  detection_frequency: number
  violation_types: {
    [key: string]: {
      enabled: boolean
      confidence_min: number
    }
  }
  notes?: string  // Optional notes field
}

export interface AIStats {
  total_detections: number
  accuracy_rate: number
  false_positive_rate: number
  processing_time_avg: number
  total_configs?: number  // Total number of configs
  current_config_id?: number  // Current active config ID
  last_updated?: string  // Last update timestamp
  enabled_violation_types?: string[]  // List of enabled violation types
  disabled_violation_types?: string[]  // List of disabled violation types
}

// Mock hook for AI Config management
export function useAIConfig() {
  const [currentConfig, setCurrentConfig] = useState<AIConfig | null>(null)
  const [configHistory, setConfigHistory] = useState<AIConfig[]>([])
  const [stats, setStats] = useState<AIStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data
  const mockConfig: AIConfig = {
    id: 1,
    confidence_threshold: 0.7,
    iou_threshold: 0.5,
    detection_frequency: 2,
    violation_types: {
      no_helmet: { enabled: true, confidence_min: 0.6 },
      red_light: { enabled: true, confidence_min: 0.7 },
      wrong_lane: { enabled: true, confidence_min: 0.65 },
      speeding: { enabled: true, confidence_min: 0.75 },
    },
    created_at: new Date().toISOString(),
    is_active: true
  }

  const mockStats: AIStats = {
    total_detections: 1250,
    accuracy_rate: 0.92,
    false_positive_rate: 0.08,
    processing_time_avg: 1.2
  }

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCurrentConfig(mockConfig)
      setConfigHistory([mockConfig])
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [])

  const fetchConfigHistory = async () => {
    // Mock implementation
    setConfigHistory([mockConfig])
  }

  const createConfig = async (config: AIConfigCreate) => {
    // Mock implementation
    const newConfig: AIConfig = {
      ...config,
      id: Date.now(),
      created_at: new Date().toISOString(),
      is_active: false
    }
    setConfigHistory(prev => [newConfig, ...prev])
    return newConfig
  }

  const updateConfig = async (id: number, config: Partial<AIConfigCreate>) => {
    // Mock implementation
    if (currentConfig) {
      const updatedConfig = { ...currentConfig, ...config }
      setCurrentConfig(updatedConfig)
      return updatedConfig
    }
    throw new Error("No current config")
  }

  const activateConfig = async (id: number) => {
    // Mock implementation
    const config = configHistory.find(c => c.id === id)
    if (config) {
      setCurrentConfig({ ...config, is_active: true })
      setConfigHistory(prev => prev.map(c => ({ ...c, is_active: c.id === id })))
    }
  }

  return {
    currentConfig,
    configHistory,
    stats,
    loading,
    error,
    fetchConfigHistory,
    createConfig,
    updateConfig,
    activateConfig
  }
}