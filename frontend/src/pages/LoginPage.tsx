"use client"

import { useState } from "react"
import Header from "../components/Header"
import { LoginForm } from "../../components/account/login-form"

type UserRole = "admin" | "officer" | "citizen"

export default function LoginPage() {
  const [role] = useState<UserRole>("citizen") 

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
        <div className="mx-auto max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Đăng nhập hệ thống
            </h2>
            <p className="text-muted-foreground">
              Vui lòng đăng nhập để truy cập hệ thống phạt nguội
            </p>
          </div>

          <LoginForm role={role} />
        </div>
      </main>
    </div>
  )
}
