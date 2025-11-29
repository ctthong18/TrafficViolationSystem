"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { videoApi, cameraApi, Camera, VideoUploadResponse } from "@/lib/api"
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Video,
  Clock,
  HardDrive
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface VideoUploadProps {
  onUploadComplete?: (result: VideoUploadResponse) => void
  onCancel?: () => void
  preselectedCameraId?: number
}

const ALLOWED_FORMATS = ['mp4', 'avi', 'mov', 'mkv']
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export function VideoUpload({ onUploadComplete, onCancel, preselectedCameraId }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(preselectedCameraId || null)
  const [recordedAt, setRecordedAt] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<VideoUploadResponse | null>(null)
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loadingCameras, setLoadingCameras] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load cameras on component mount
  useEffect(() => {
    const loadCameras = async () => {
      try {
        const response = await cameraApi.getAll({ limit: 100 })
        setCameras(response.items)
      } catch (err) {
        console.error("Failed to load cameras:", err)
        setError("Không thể tải danh sách camera")
      } finally {
        setLoadingCameras(false)
      }
    }
    loadCameras()
  }, [])

  const validateFile = (file: File): string | null => {
    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !ALLOWED_FORMATS.includes(extension)) {
      return `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${ALLOWED_FORMATS.join(', ')}`
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File quá lớn. Kích thước tối đa: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }

    // Check if it's actually a video file
    if (!file.type.startsWith('video/')) {
      return "File được chọn không phải là video"
    }

    return null
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setError(null)
    setSuccess(null)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setSelectedFile(file)
    setError(null)
    setSuccess(null)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const removeFile = () => {
    setSelectedFile(null)
    setError(null)
    setSuccess(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedCameraId) {
      setError("Vui lòng chọn file video và camera")
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Simulate upload progress (in real implementation, you'd track actual progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await videoApi.upload({
        file: selectedFile,
        camera_id: selectedCameraId,
        recorded_at: recordedAt || undefined
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
      setSuccess(result)
      
      if (onUploadComplete) {
        onUploadComplete(result)
      }

    } catch (err: any) {
      console.error("Upload failed:", err)
      setError(err.message || "Không thể upload video")
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase()
    return <Video className="h-8 w-8 text-blue-500" />
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Upload thành công!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Video đã được upload thành công và đang được xử lý bởi AI. 
              Bạn có thể theo dõi tiến trình trong thư viện video.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Video ID:</span>
              <span className="font-mono">{success.video_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Job ID:</span>
              <span className="font-mono">{success.processing_job_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Trạng thái:</span>
              <Badge variant="secondary">{success.status}</Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setSuccess(null)
                setSelectedFile(null)
                setSelectedCameraId(preselectedCameraId || null)
                setRecordedAt("")
                setUploadProgress(0)
              }}
            >
              Upload video khác
            </Button>
            <Button className="flex-1" onClick={onCancel}>
              Đóng
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Video
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Camera Selection */}
        <div className="space-y-2">
          <Label htmlFor="camera-select">Camera *</Label>
          {loadingCameras ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải danh sách camera...
            </div>
          ) : (
            <Select 
              value={selectedCameraId?.toString() || ""} 
              onValueChange={(value) => setSelectedCameraId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn camera" />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((camera) => (
                  <SelectItem key={camera.id} value={camera.id.toString()}>
                    {camera.name} ({camera.camera_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Recording Time */}
        <div className="space-y-2">
          <Label htmlFor="recorded-at">Thời gian ghi hình (tùy chọn)</Label>
          <Input
            id="recorded-at"
            type="datetime-local"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
          />
          <p className="text-xs text-muted-foreground">
            Để trống nếu sử dụng thời gian hiện tại
          </p>
        </div>

        {/* File Upload Area */}
        <div className="space-y-2">
          <Label>Video File *</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              selectedFile 
                ? "border-green-300 bg-green-50" 
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  {getFileIcon(selectedFile.name)}
                  <div className="text-left">
                    <div className="font-medium">{selectedFile.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(selectedFile.size)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedFile.type}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-medium">Kéo thả video vào đây</p>
                  <p className="text-sm text-muted-foreground">
                    hoặc{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      chọn file
                    </button>
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Hỗ trợ: {ALLOWED_FORMATS.join(', ')} • Tối đa {MAX_FILE_SIZE / (1024 * 1024)}MB
                </div>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_FORMATS.map(f => `.${f}`).join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Đang upload...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isUploading}
          >
            Hủy
          </Button>
          <Button
            className="flex-1"
            onClick={handleUpload}
            disabled={!selectedFile || !selectedCameraId || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang upload...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}