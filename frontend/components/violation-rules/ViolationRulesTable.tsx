"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight, BookOpen, ArrowUpDown } from "lucide-react"
import { ViolationRule } from "@/hooks/useViolationRules"
import { Skeleton } from "@/components/ui/skeleton"

interface ViolationRulesTableProps {
  rules: ViolationRule[]
  loading?: boolean
}

type SortField = "code" | "points_bike" | "points_car" | "fine_min_bike" | "fine_min_car"
type SortOrder = "asc" | "desc"

export function ViolationRulesTable({ rules, loading = false }: ViolationRulesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("code")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const itemsPerPage = 10

  // Reset to page 1 when rules change
  useEffect(() => {
    setCurrentPage(1)
  }, [rules])

  // Sorting logic
  const sortedRules = [...rules].sort((a, b) => {
    const aValue = a[sortField] ?? 0
    const bValue = b[sortField] ?? 0
    
    if (sortField === "code") {
      return sortOrder === "asc" 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    }
    
    return sortOrder === "asc" 
      ? Number(aValue) - Number(bValue)
      : Number(bValue) - Number(aValue)
  })

  // Pagination
  const totalPages = Math.ceil(sortedRules.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRules = sortedRules.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const formatFineRange = (min: number | null, max: number | null) => {
    if (min === null && max === null) return "N/A"
    if (min === max) return `${min?.toLocaleString()} đ`
    return `${min?.toLocaleString() || 0} - ${max?.toLocaleString() || 0} đ`
  }

  const formatPoints = (points: number | null) => {
    if (points === null) return "N/A"
    return `${points} điểm`
  }


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Quy định phạt nguội
        </CardTitle>
        <CardDescription>
          Danh sách các quy định vi phạm và mức phạt theo loại phương tiện
        </CardDescription>
      </CardHeader>
      <CardContent>

        {rules.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Không tìm thấy quy định vi phạm nào</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort("code")}
                      >
                        Mã vi phạm
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[250px]">Mô tả</TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort("points_bike")}
                      >
                        Điểm trừ (Xe máy)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort("points_car")}
                      >
                        Điểm trừ (Ô tô)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort("fine_min_bike")}
                      >
                        Mức phạt (Xe máy)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort("fine_min_car")}
                      >
                        Mức phạt (Ô tô)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[200px]">Căn cứ pháp lý</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {rule.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{rule.description}</TableCell>
                      <TableCell className="text-center text-sm">
                        {formatPoints(rule.points_bike)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {formatPoints(rule.points_car)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatFineRange(rule.fine_min_bike, rule.fine_max_bike)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatFineRange(rule.fine_min_car, rule.fine_max_car)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rule.law_reference}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {paginatedRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="font-mono">
                          {rule.code}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">{rule.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Xe máy:</p>
                          <p className="font-medium">{formatPoints(rule.points_bike)}</p>
                          <p className="text-xs">{formatFineRange(rule.fine_min_bike, rule.fine_max_bike)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Ô tô:</p>
                          <p className="font-medium">{formatPoints(rule.points_car)}</p>
                          <p className="text-xs">{formatFineRange(rule.fine_min_car, rule.fine_max_car)}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Căn cứ pháp lý:</span> {rule.law_reference}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Trang {currentPage} / {totalPages} ({sortedRules.length} quy định)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
