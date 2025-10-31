"use client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { User, Car } from "lucide-react"
import { useCitizen } from "@/hooks/useCitizen"
import { PersonalInfo } from "@/components/citizen-profile/PersonalInfo"
import { VehicleList } from "@/components/citizen-profile/VehicleList"
import { ViolationHistory } from "@/components/citizen-profile/ViolationHistory"

export function CitizenProfile({ citizenId }: { citizenId: string }) {
  const { citizen, setCitizen, loading, error } = useCitizen(citizenId)

  if (loading) return <p>Đang tải dữ liệu...</p>
  if (error) return <p className="text-destructive">{error}</p>
  if (!citizen) return <p>Không tìm thấy công dân</p>

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" /> Phương tiện ({citizen.vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Lịch sử vi phạm
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfo data={citizen} setData={setCitizen} />
        </TabsContent>

        <TabsContent value="vehicles">
          <VehicleList vehicles={citizen.vehicles} setVehicles={(v) => setCitizen({ ...citizen, vehicles: v })} />
        </TabsContent>

        <TabsContent value="history">
          <ViolationHistory violations={citizen.violationHistory} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
