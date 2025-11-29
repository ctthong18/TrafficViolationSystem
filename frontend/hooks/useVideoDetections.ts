import { useState, useEffect } from 'react'
import { detectionApi } from '@/lib/api'

interface BoundingBox {
  x1: number
  y1: number
  x2: number
  y2: number
  class_id: number
  class_name: string
  confidence: number
  track_id?: number
  license_plate?: string
}

interface Detection {
  id: number
  timestamp: number
  confidence: number
  data: {
    bounding_boxes?: BoundingBox[]
    license_plate?: string
    vehicle_type?: string
    vehicle_count?: number
    violation_type?: string
    bbox?: number[]  // Legacy format [x1, y1, x2, y2]
  }
}

export function useVideoDetections(videoId: number | null) {
  const [detections, setDetections] = useState<Detection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!videoId) {
      setDetections([])
      return
    }

    const fetchDetections = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await detectionApi.getByVideoId(videoId)
        
        // Transform API response to Detection format
        const transformedDetections: Detection[] = response.detections.map((det: any) => {
          // Nếu là FRAME detection, đã có bounding_boxes
          if (det.detection_type === 'frame' && det.data.bounding_boxes) {
            return {
              id: det.id,
              timestamp: det.timestamp,
              confidence: det.confidence,
              data: {
                bounding_boxes: det.data.bounding_boxes
              }
            }
          }
          
          // Convert legacy bbox format to bounding_boxes if needed
          let boundingBoxes = det.data.bounding_boxes || []
          
          // If no bounding_boxes but has bbox (legacy format), convert it
          if (!boundingBoxes.length && det.data.bbox && Array.isArray(det.data.bbox)) {
            const [x1, y1, x2, y2] = det.data.bbox
            boundingBoxes = [{
              x1,
              y1,
              x2,
              y2,
              class_id: 2, // Default to car
              class_name: det.data.vehicle_type || 'car',
              confidence: det.confidence,
              license_plate: det.data.license_plate || det.data.plate_number
            }]
          }
          
          // Nếu là vehicle_count, thêm vào data
          if (det.detection_type === 'vehicle_count') {
            return {
              id: det.id,
              timestamp: det.timestamp,
              confidence: det.confidence,
              data: {
                vehicle_count: det.data,
                bounding_boxes: boundingBoxes
              }
            }
          }
          
          return {
            id: det.id,
            timestamp: det.timestamp,
            confidence: det.confidence,
            data: {
              ...det.data,
              bounding_boxes: boundingBoxes,
              license_plate: det.data.license_plate || det.data.plate_number,
              vehicle_type: det.data.vehicle_type
            }
          }
        })
        
        setDetections(transformedDetections)
      } catch (err) {
        console.error('Failed to fetch detections:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch detections')
        setDetections([])
      } finally {
        setLoading(false)
      }
    }

    fetchDetections()
  }, [videoId])

  return { detections, loading, error }
}
