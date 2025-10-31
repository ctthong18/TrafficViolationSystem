"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SearchForm } from "./search-form"
import { ViolationCard } from "./violation-card"
import { fetchViolationsByLicense, fetchViolationById, Violation } from "../../hooks/useViolations"
import { Search } from "lucide-react"

export function ViolationLookup() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState("")

  const handleSearch = async (type: "license" | "id", value: string) => {
    setQuery(value)
    setIsLoading(true)
    try {
      const data =
        type === "license"
          ? await fetchViolationsByLicense(value)
          : await fetchViolationById(value)
      setViolations(data)
    } catch (e) {
      console.error(e)
      setViolations([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tra cứu vi phạm</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {!isLoading && violations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kết quả tìm kiếm ({violations.length})</h3>
            {violations.map((v) => (
              <ViolationCard key={v.id} violation={v} />
            ))}
          </div>
        )}

        {!isLoading && query && violations.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Không tìm thấy vi phạm nào với <strong>{query}</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
