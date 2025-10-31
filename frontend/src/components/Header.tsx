"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { User, LogOut } from "lucide-react"

interface UserData {
  id: string
  full_name: string
  email: string
  role: "authority" | "officer" | "citizen"
}
import Image from "next/image"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const isPublic = pathname === "/" || pathname === "/login" || pathname === "/register"
        if (!token) {
          // Không redirect ở các trang công khai
          if (!isPublic) router.push("/login")
          setLoading(false)
          return
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Không thể tải thông tin người dùng")

        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error("❌ Lỗi lấy thông tin user:", err)
        const isPublic = pathname === "/" || pathname === "/login" || pathname === "/register"
        if (!isPublic) router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <header className="border-b border-border bg-card">
<div className="container mx-auto px-4 py-2">
  <div className="flex items-center justify-between">
    {/* Logo + tiêu đề */}
    <div className="flex items-center gap-3">
      {/* Logo hình ảnh */}
      <div className="flex items-center justify-center rounded-lg overflow-hidden">
        <Image
          src="/logo.png"
          alt="Logo"
          width={55}
          height={55}
          className="object-contain"
        />
      </div>

      {/* Tiêu đề */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Traffic Monitoring</h1>
        {user?.role && (
          <p className="text-sm text-muted-foreground capitalize">
            Cổng thông tin{" "}
            {user.role === "authority"
              ? "Cơ quan chức năng"
              : user.role === "officer"
              ? "Cán bộ xử lý"
              : "Người dân"}
          </p>
        )}
      </div>
    </div>


          {/* Thông tin người dùng */}
          <div className="flex items-center gap-3">
  {loading ? (
    <span className="text-sm text-muted-foreground">Đang tải...</span>
  ) : user ? (
    <>
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">{user.full_name}</span>
        </div>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>

      <Button variant="outline" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Đăng xuất
      </Button>
    </>
  ) : null}
</div>

        </div>
      </div>
    </header>
  )
}
