"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ComplaintList } from "@/components/complaint/ComplaintList"
import { ComplaintForm } from "@/components/complaint/ComplaintForm"
import { ComplaintDetail } from "@/components/complaint/ComplaintDetail"
import { Complaint } from "@/hooks/useComplaints"

export function ComplaintSection() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Khiếu nại</h2>
          <p className="text-muted-foreground">Quản lý các khiếu nại của bạn</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo khiếu nại mới
        </Button>
      </div>

      <Tabs defaultValue="my-complaints" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-complaints" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Khiếu nại của tôi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-complaints">
          <ComplaintList 
            onViewDetail={(complaint) => setSelectedComplaint(complaint)}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog tạo khiếu nại */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo khiếu nại mới</DialogTitle>
          </DialogHeader>
          <ComplaintForm
            onSuccess={() => setShowCreateDialog(false)}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog xem chi tiết */}
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedComplaint && (
            <ComplaintDetail
              complaint={selectedComplaint}
              onClose={() => setSelectedComplaint(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
