import { RegisterForm } from "../../components/register-form"
import { Shield } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Hệ thống Phạt Nguội</h1>
                <p className="text-sm text-muted-foreground">Cục Cảnh sát Giao thông</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Đăng nhập hệ thống</h2>
            <p className="text-muted-foreground">Vui lòng đăng nhập để truy cập hệ thống phạt nguội</p>
          </div>
          <RegisterForm />
        </div>
      </main>
    </div>
  )
}
