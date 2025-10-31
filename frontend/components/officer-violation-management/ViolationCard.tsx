"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { Violation } from "../../hooks/useViolations"
import ViolationDialog from "./ViolationDialog"

interface Props {
  violation: Violation
  onProcess: (id: string, action: string, note: string) => void
}

export default function ViolationCard({ violation, onProcess }: Props) {
  return (
    <Card key={violation.id}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{violation.id}</span>
              <Badge
                variant={
                  violation.priority === "high"
                    ? "destructive"
                    : violation.priority === "medium"
                      ? "default"
                      : "secondary"
                }
              >
                {violation.priority === "high"
                  ? "Ưu tiên cao"
                  : violation.priority === "medium"
                    ? "Ưu tiên trung bình"
                    : "Ưu tiên thấp"}
              </Badge>
            </div>
            <p className="text-sm font-medium">{violation.type}</p>
            <p className="text-sm text-muted-foreground">
              Biển số: {violation.licensePlate} • {violation.location}
            </p>
            <p className="text-xs text-muted-foreground">{violation.time}</p>
          </div>

          {violation.status === "pending" && (
            <ViolationDialog violation={violation} onProcess={onProcess} />
          )}

          {violation.status === "processing" && (
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Cập nhật
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
