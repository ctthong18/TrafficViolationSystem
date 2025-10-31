"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function ViolationSearch({ value, onChange }: Props) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Tìm kiếm theo mã vi phạm, loại vi phạm hoặc biển số..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
