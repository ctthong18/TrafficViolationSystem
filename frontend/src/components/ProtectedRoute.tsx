import type React from "react"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const userStr = localStorage.getItem("user")

  if (!userStr) {
    return <Navigate to="/" replace />
  }

  try {
    const user = JSON.parse(userStr)
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />
    }

    return <>{children}</>
  } catch {
    localStorage.removeItem("user")
    return <Navigate to="/" replace />
  }
}
