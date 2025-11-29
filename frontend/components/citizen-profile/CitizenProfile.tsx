"use client"

import { useCitizen } from "@/hooks/useCitizen"
import { useViolations } from "@/hooks/useViolations"
import { PersonalInfo } from "@/components/citizen-profile/PersonalInfo"
import { VehicleList } from "@/components/citizen-profile/VehicleList"
import { DrivingLicenseSection } from "@/components/citizen-profile/DrivingLicenseSection"
import { ViolationHistory } from "@/components/citizen-profile/ViolationHistory"

interface CitizenProfileProps {
  citizenId: string
  activeSubTab: string
}

export function CitizenProfile({ citizenId, activeSubTab }: CitizenProfileProps) {
  const { citizen, setCitizen, loading, error } = useCitizen(citizenId)
  const { violations, loading: violationsLoading } = useViolations()

  if (loading) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!citizen) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-muted-foreground">Không tìm thấy công dân</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeSubTab === "account" && (
        <PersonalInfo data={citizen} setData={setCitizen} />
      )}

      {activeSubTab === "vehicle" && (
        <VehicleList 
          vehicles={citizen.vehicles} 
          setVehicles={(v) => setCitizen({ ...citizen, vehicles: v })} 
        />
      )}

      {activeSubTab === "license" && (
        <DrivingLicenseSection />
      )}

      {activeSubTab === "history" && (
        <>
          {violationsLoading ? (
            <div className="rounded-lg border p-6">
              <p className="text-muted-foreground">Đang tải lịch sử vi phạm...</p>
            </div>
          ) : (
            <ViolationHistory violations={violations} />
          )}
        </>
      )}
    </div>
  )
}
