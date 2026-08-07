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
import { Shield, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // State to store the user's email input
  const [email, setEmail] = useState("");
  // State to store the user's password input
  const [password, setPassword] = useState("");
  // State to store any error message to display to the user
  const [error, setError] = useState("");
  // State to track if a login request is in progress (disables button, shows loading text)
  const [loading, setLoading] = useState(false);

  /**
   * Sanitizes user input by trimming whitespace and removing common XSS characters.
   * This prevents HTML/script injection through input fields.
   */
  function sanitizeInput(value: string): string {
    return value
      .trim() // Remove leading/trailing whitespace
      .replace(/</g, "&lt;") // Replace < with &lt;
      .replace(/>/g, "&gt;") // Replace > with &gt;
      .replace(/"/g, "&quot;") // Replace " with &quot;
      .replace(/'/g, "&#039;") // Replace ' with &#039;
      .replace(/&/g, "&amp;"); // Replace & with &amp;
  }

  /**
   * Validates email format using regex.
   * Returns true if email is valid, false otherwise.
   */
  function isValidEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  // Handles the form submission when the user clicks "Sign In"
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Prevents the browser from refreshing the page

    // Sanitize inputs before processing
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    // Clear any previous error message before starting a new login attempt
    setError("");
    // Show the loading state on the button
    setLoading(true);

    try {
      // Send a POST request to the login API endpoint with the user's sanitized email and password
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
      });

      // Parse the JSON response from the API
      const data = await res.json();

      // If the response status is not OK (e.g., 400, 401, 500), show the error message
      if (!res.ok) {
        setError(data.message ?? "Login failed");
        return;
      }

      // If login is successful, redirect the user to the dashboard page
      router.push("/dashboard");
      // Refresh the page data to reflect the authenticated session
      router.refresh();
    } catch {
      // If an unexpected error occurs (e.g., network failure), show a generic error
      setError("Something went wrong");
    } finally {
      // Turn off the loading state regardless of success or failure
      setLoading(false);
    }
  }

  return (
    // Main container: full viewport height, full width, with background image
    // flex to center the card both horizontally and vertically
    <div 
      className="h-screen w-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/home.jpg')",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/90"></div>

      {/* Decorative background elements - subtle brand accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c4922a]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#554116]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      {/* Card container - responsive for mobile */}
      <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl mx-4 sm:mx-auto relative z-10">
        <CardHeader className="space-y-2 sm:space-y-3 text-center p-4 sm:p-6">
          {/* Brand icon */}
          <div className="flex justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#554116] rounded-2xl flex items-center justify-center shadow-lg shadow-[#554116]/20">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-[#c4922a]" />
            </div>
          </div>
          {/* Heading: dark brown/gold color */}
          <CardTitle className="text-2xl sm:text-3xl font-bold text-[#554116]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-[#0a0a0a]/60">
            Sign in to access your legal protection
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {/* Display error message if there is one */}
          {error && (
            <Alert className="mb-4 border-[#c4922a] bg-[#c4922a]/10 rounded-xl">
              <AlertDescription className="text-[#c4922a] text-sm sm:text-base">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email field */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-[#554116] font-medium text-sm sm:text-base">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#554116]/40" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmail(email.trim())} // Trim whitespace when user leaves the field
                  required
                  placeholder="you@example.com"
                  className="pl-9 sm:pl-10 border-[#554116]/20 focus-visible:ring-[#c4922a] focus-visible:border-[#c4922a] h-11 sm:h-12 rounded-xl text-sm sm:text-base bg-[#efe2c7]/20"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-[#554116] font-medium text-sm sm:text-base">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-[#c4922a] hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#554116]/40" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPassword(password.trim())} // Trim whitespace when user leaves the field
                  required
                  placeholder="••••••••"
                  className="pl-9 sm:pl-10 border-[#554116]/20 focus-visible:ring-[#c4922a] focus-visible:border-[#c4922a] h-11 sm:h-12 rounded-xl text-sm sm:text-base bg-[#efe2c7]/20"
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-[#c4922a] hover:bg-[#c4922a]/80 text-white h-11 sm:h-12 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#c4922a]/25"
              disabled={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#554116]/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[#554116]/40 font-medium text-[10px] sm:text-xs">
                Secure Access
              </span>
            </div>
          </div>

          {/* Google Sign In Button - Placeholder */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 sm:h-12 rounded-xl border-[#554116]/20 hover:bg-[#efe2c7]/30 hover:border-[#c4922a] transition-all duration-200 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
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

        <CardFooter className="justify-center p-4 sm:p-6 pt-0 sm:pt-0">
          <p className="text-xs sm:text-sm text-[#0a0a0a]/60">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#554116] hover:underline font-semibold"
            >
              Create Account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}