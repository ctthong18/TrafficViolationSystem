"use client"
import { useState, useEffect } from "react"
import Header from "@/components/Header"
import { LoginForm } from "../components/account/login-form"
import { useRouter } from "next/navigation"

type UserRole = "admin" | "officer" | "citizen"

export default function HomePage() {
  const [role, setRole] = useState<UserRole | "">("")
  const [showLoginForm, setShowLoginForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userJson = localStorage.getItem("user")
    if (!userJson) return
    
    const user = JSON.parse(userJson)

    switch(user.role) {
      case "admin":
        router.push("/admin")
        break
      case "officer":
        router.push("/officer")
        break
      case "citizen":
        router.push("/citizen")
        break
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
        {!showLoginForm ? (
          // --- Màn hình chọn vai trò ---
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Xin chào</h2>
            <p className="text-muted-foreground text-lg">Vui lòng chọn vai trò để đăng nhập</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="btn-primary px-4 py-2 rounded"
                onClick={() => {
                  setRole("admin")
                  setShowLoginForm(true)
                }}
              >
                Admin
              </button>
              <button
                className="btn-primary px-4 py-2 rounded"
                onClick={() => {
                  setRole("officer")
                  setShowLoginForm(true)
                }}
              >
                Officer
              </button>
              <button
                className="btn-primary px-4 py-2 rounded"
                onClick={() => {
                  setRole("citizen")
                  setShowLoginForm(true)
                }}
              >
                Citizen
              </button>
            </div>
          </div>
        ) : (
          // --- Form đăng nhập ---
          <div className="mx-auto max-w-md w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Đăng nhập hệ thống</h2>
              <p className="text-muted-foreground">Vai trò: {role}</p>
            </div>

            {/* truyền callback để quay lại chọn role */}
            <LoginForm role={role as UserRole} onBack={() => setShowLoginForm(false)} />
          </div>
        )}
      </main>
    </div>
  )
}
