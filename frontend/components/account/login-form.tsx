"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"


interface LoginFormProps {
  role: "admin" | "officer" | "citizen"
  onBack?: () => void
}

export function LoginForm({ role, onBack }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
    identification_number: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.usernameOrEmail || !formData.password) return

    setIsLoading(true)
    try {
      const payload: any = {
        username_or_email: formData.usernameOrEmail,
        password: formData.password,
        role,
      }

      if (role === "citizen") {
        payload.identification_number = formData.identification_number
      }

      const res = await authApi.login(payload)
      console.log(res)
      
      if (res?.access_token) {
        localStorage.setItem("access_token", res.access_token);
        if (res.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
        }
      }

      const me = authApi.getCurrentUser()
      const userRole = me?.role
      switch (userRole) {
        case "admin":
          router.push("/admin")
          break
        case "officer":
          router.push("/officer")
          break
        case "citizen":
          router.push("/citizen")
          break
        default:
          router.push("/")
      }
    } catch (err) {
      alert("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Thông tin đăng nhập</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username hoặc Email */}
          <div className="space-y-2">
            <Label htmlFor="usernameOrEmail">Tên đăng nhập hoặc Email</Label>
            <Input
              id="usernameOrEmail"
              type="text"
              placeholder="Nhập tên đăng nhập hoặc email"
              value={formData.usernameOrEmail}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, usernameOrEmail: e.target.value }))
              }
              required
            />
          </div>

          {/* CCCD — chỉ hiển thị khi role là citizen */}
          {role === "citizen" && (
            <div className="space-y-2">
              <Label htmlFor="identification_number">Số căn cước công dân</Label>
              <Input
                id="identification_number"
                type="text"
                placeholder="050203512689"
                value={formData.identification_number}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, identification_number: e.target.value }))
                }
                required
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Register Link */}
          {role === "citizen" && (
            <p className="text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.usernameOrEmail || !formData.password}
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

          {/* Nút quay lại trang chính */}
          <Button
            type="button"
            variant="outline"
            className="w-full mt-2"
            onClick={() => {
              if (onBack) onBack()
              else router.push("/")
            }}
          >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại chọn vai trò
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
