"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface ViolationRulesSearchProps {
  onSearch: (query: string) => void
  loading?: boolean
}

export function ViolationRulesSearch({ onSearch, loading = false }: ViolationRulesSearchProps) {
  const [searchValue, setSearchValue] = useState("")
  const [debouncedValue, setDebouncedValue] = useState("")

  // Debounce search with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue)
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [searchValue])

  // Trigger search when debounced value changes
  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  const handleClear = useCallback(() => {
    setSearchValue("")
    setDebouncedValue("")
  }, [])

  return (
    <div className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm theo mã vi phạm hoặc mô tả..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-10"
          disabled={loading}
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={handleClear}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
