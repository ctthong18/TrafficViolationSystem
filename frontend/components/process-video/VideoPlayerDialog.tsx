"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VideoPlayer } from "./VideoPlayer"

interface VideoPlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  videoUrl: string
  videoId: number
  title?: string
  detections?: any[]
}

export function VideoPlayerDialog({
  open,
  onOpenChange,
  videoUrl,
  videoId,
  title = "Video Player",
  detections = []
}: VideoPlayerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <VideoPlayer
            videoUrl={videoUrl}
            detections={detections}
            onSeek={(timestamp) => {
              console.log("Seek to:", timestamp)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
