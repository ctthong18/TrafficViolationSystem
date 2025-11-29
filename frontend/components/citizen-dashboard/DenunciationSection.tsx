"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DenunciationList } from "@/components/denunciation/DenunciationList"
import { DenunciationForm } from "@/components/denunciation/DenunciationForm"
import { DenunciationDetail } from "@/components/denunciation/DenunciationDetail"
import { Denunciation } from "@/hooks/useDenuciation"

export function DenunciationSection() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedDenunciation, setSelectedDenunciation] = useState<Denunciation | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Tố cáo
          </h2>
          <p className="text-muted-foreground">Tố cáo hành vi vi phạm - Thông tin được bảo mật tuyệt đối</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo tố cáo mới
        </Button>
      </div>

      <Tabs defaultValue="my-denunciations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-denunciations" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tố cáo của tôi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-denunciations">
          <DenunciationList 
            onViewDetail={(denunciation) => setSelectedDenunciation(denunciation)}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog tạo tố cáo */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo tố cáo mới</DialogTitle>
          </DialogHeader>
          <DenunciationForm
            onSuccess={() => setShowCreateDialog(false)}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog xem chi tiết */}
      <Dialog open={!!selectedDenunciation} onOpenChange={(open) => !open && setSelectedDenunciation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDenunciation && (
            <DenunciationDetail
              denunciation={selectedDenunciation}
              onClose={() => setSelectedDenunciation(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
