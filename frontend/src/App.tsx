import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { LoginPage } from "./pages/LoginPage"
import { AuthorityDashboard } from "./pages/AuthorityDashboard"
import { OfficerDashboard } from "./pages/OfficerDashboard"
import { CitizenDashboard } from "./pages/CitizenDashboard"
import { ProtectedRoute } from "./components/ProtectedRoute"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />

          <Route
            path="/authority"
            element={
              <ProtectedRoute allowedRoles={["authority"]}>
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer"
            element={
              <ProtectedRoute allowedRoles={["officer"]}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
