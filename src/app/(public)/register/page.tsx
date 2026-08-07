"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Mail, Lock, User, ArrowRight, Check, X, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function sanitizeInput(value: string): string {
    return value
      .trim()
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/&/g, "&amp;");
  }

  function isValidEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  function sanitizeName(value: string): string {
    return value.trim().replace(/[^a-zA-Z\s\-']/g, "");
  }

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const sanitizedName = sanitizeName(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedName || sanitizedName.length < 2) {
      setError("Please enter your full name");
      return;
    }

    if (!isValidEmail(sanitizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizedName,
          email: sanitizedEmail,
          password: sanitizedPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Registration failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        {met ? (
          <Check className="w-3 h-3 text-green-500" />
        ) : (
          <X className="w-3 h-3 text-[#0a0a0a]/30" />
        )}
        <span className={met ? "text-green-600" : "text-[#0a0a0a]/40"}>
          {text}
        </span>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/home.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/90"></div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c4922a]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#554116]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl mx-4 relative z-10 max-h-[90vh] overflow-y-auto p-4 sm:p-5">
        <CardHeader className="space-y-2 text-center p-0 pb-3">
          <div className="flex justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#554116] rounded-2xl flex items-center justify-center shadow-lg shadow-[#554116]/20">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-[#c4922a]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#554116]">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm text-[#0a0a0a]/60">
            Join Protect8 and stay protected
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <Alert className="mb-3 border-[#c4922a] bg-[#c4922a]/10 rounded-lg py-2">
              <AlertDescription className="text-[#c4922a] text-xs">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-[#554116] font-medium text-xs">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#554116]/40" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setName(sanitizeName(name))}
                  required
                  placeholder="John Doe"
                  className="pl-8 border-[#554116]/20 focus-visible:ring-[#c4922a] focus-visible:border-[#c4922a] h-9 rounded-lg bg-[#efe2c7]/20 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-[#554116] font-medium text-xs">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#554116]/40" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmail(sanitizeInput(email))}
                  required
                  placeholder="you@example.com"
                  className="pl-8 border-[#554116]/20 focus-visible:ring-[#c4922a] focus-visible:border-[#c4922a] h-9 rounded-lg bg-[#efe2c7]/20 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-[#554116] font-medium text-xs">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#554116]/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPassword(sanitizeInput(password))}
                  required
                  placeholder="••••••••"
                  className={`pl-8 pr-8 border-[#554116]/20 focus-visible:ring-[#c4922a] focus-visible:border-[#c4922a] h-9 rounded-lg bg-[#efe2c7]/20 text-xs ${
                    password && !isPasswordValid ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5 text-[#554116]/40" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-[#554116]/40" />
                  )}
                </button>
              </div>

              {password && (
                <div className="mt-1.5 space-y-0.5 p-2 bg-[#efe2c7]/30 rounded-lg border border-[#554116]/10">
                  <p className="text-[10px] font-medium text-[#554116] mb-1">Password must have:</p>
                  <PasswordRequirement met={hasMinLength} text="At least 8 characters" />
                  <PasswordRequirement met={hasUpperCase} text="One uppercase letter" />
                  <PasswordRequirement met={hasNumber} text="One number" />
                  <PasswordRequirement met={hasSpecialChar} text="One special character" />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#c4922a] hover:bg-[#c4922a]/80 text-white h-9 rounded-lg font-semibold text-xs transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#c4922a]/25 disabled:opacity-50 disabled:hover:scale-100"
              disabled={loading || (password.length > 0 && !isPasswordValid)}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Create Account <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#554116]/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-[#554116]/40 font-medium">
                Secure Registration
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-9 rounded-lg border-[#554116]/20 hover:bg-[#efe2c7]/30 hover:border-[#c4922a] transition-all duration-200 text-xs"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#4285F4"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </CardContent>

        <CardFooter className="justify-center p-0 pt-3">
          <p className="text-[11px] text-[#0a0a0a]/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#554116] hover:underline font-semibold"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}