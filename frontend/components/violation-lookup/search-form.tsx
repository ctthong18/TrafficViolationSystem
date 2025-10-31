"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

interface Props {
  onSearch: (type: "license" | "id", value: string) => void
  isLoading: boolean
}

export function SearchForm({ onSearch, isLoading }: Props) {
  const [searchType, setSearchType] = useState<"license" | "id">("license")
  const [searchValue, setSearchValue] = useState("")

  const handleSubmit = () => {
    if (searchValue.trim()) onSearch(searchType, searchValue)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          variant={searchType === "license" ? "default" : "outline"}
          onClick={() => setSearchType("license")}
          className="flex-1"
        >
          Tra cứu theo biển số
        </Button>
        <Button
          variant={searchType === "id" ? "default" : "outline"}
          onClick={() => setSearchType("id")}
          className="flex-1"
        >
          Tra cứu theo mã vi phạm
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="search">{searchType === "license" ? "Biển số xe" : "Mã vi phạm"}</Label>
        <div className="flex gap-2">
          <Input
            id="search"
            placeholder={
              searchType === "license" ? "Nhập biển số xe (VD: 30A-12345)" : "Nhập mã vi phạm (VD: VL-001)"
            }
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button onClick={handleSubmit} disabled={isLoading || !searchValue.trim()}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang tìm...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Tìm kiếm
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
