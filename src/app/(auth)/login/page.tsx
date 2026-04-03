"use client";

import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const handleLogin = () => {
    window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-sage-100">
        {/* Brand Icon */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🌿</div>
          <h1 className="font-serif text-3xl text-sage-700 mb-2">
            Welcome to GardenMind
          </h1>
          <p className="text-sage-500 text-sm">
            Plan, plot and manage your garden with AI-powered advice.
          </p>
        </div>

        {/* Login Button */}
        <div className="mt-8">
          <Button
            variant="primary"
            size="md"
            onClick={handleLogin}
            className="w-full"
          >
            Continue with Auth0
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-sage-400 text-center mt-4">
          New to GardenMind? Auth0 will help you create an account.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-sage-500">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
