"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, AlertCircle } from "lucide-react";

export default function OfficerLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated as officer
  useEffect(() => {
    if (isAuthenticated && user?.role === "officer") {
      router.push("/officer");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(usernameOrEmail, password, identificationNumber || undefined);
      router.push("/officer");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Officer Portal Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the officer portal
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">Username or Email</Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter username or email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identificationNumber">
                Badge/ID Number (Optional)
              </Label>
              <Input
                id="identificationNumber"
                type="text"
                placeholder="Enter badge or ID number"
                value={identificationNumber}
                onChange={(e) => setIdentificationNumber(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Provide your badge number for enhanced security
              </p>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                This portal is restricted to authorized law enforcement
                personnel only.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Need an account?{" "}
              <span className="text-primary">Contact your administrator</span>
            </div>

            <div className="text-sm text-center">
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary hover:underline"
              >
                ← Back to Home
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
