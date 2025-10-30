"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Eye, EyeOff, LogIn } from "lucide-react"

type UserRole = "authority" | "officer" | "citizen"

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "" as UserRole | "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username || !formData.password || !formData.role) return
  
    setIsLoading(true)
  
    setTimeout(() => {
      // Store user info in localStorage for demo purposes
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: formData.username,
          role: formData.role,
        }),
      )
  
      switch (formData.role) {
        case "authority":
          router.push("/authority")
          break
        case "officer":
          router.push("/officer")
          break
        case "citizen":
          router.push("/citizen")
          break
      }
  
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Thông tin đăng nhập</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Loại tài khoản</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => setFormData((prev) => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại tài khoản" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="authority">Cơ quan có thẩm quyền</SelectItem>
                <SelectItem value="officer">Cán bộ được phân công</SelectItem>
                <SelectItem value="citizen">Người dân</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.username || !formData.password || !formData.role}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang đăng nhập...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
