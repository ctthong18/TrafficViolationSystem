import { LoginForm } from "@/components/login-form"
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Image src="/logo.png" alt="Traffic Monitoring Logo" width={80} height={80} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Traffic Monitoring</h1>
                <p className="text-sm text-muted-foreground">Self-governing Traffic Department</p>
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
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
