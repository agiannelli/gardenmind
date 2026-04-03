import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="text-7xl mb-6">🌿</div>
        <h1 className="font-serif text-5xl text-sage-700 mb-4">
          GardenMind
        </h1>
        <p className="text-xl text-sage-600 mb-8 max-w-2xl mx-auto">
          Plan, plot and manage your garden with AI-powered advice.
          Track your plants, journal your progress, and grow with confidence.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button variant="primary" size="md">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="md">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl text-sage-700 mb-10 text-center">
          Everything you need to succeed
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Garden Planner */}
          <Card>
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="font-serif text-xl text-sage-700 mb-2">
              Garden Planner
            </h3>
            <p className="text-sage-600 text-sm">
              Visual bed planning with companion planting suggestions
              and spacing calculations.
            </p>
          </Card>

          {/* Plant Library */}
          <Card>
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-serif text-xl text-sage-700 mb-2">
              Plant Library
            </h3>
            <p className="text-sage-600 text-sm">
              Browse detailed plant profiles with growing requirements,
              companion plants, and harvest timelines.
            </p>
          </Card>

          {/* Garden Journal */}
          <Card>
            <div className="text-4xl mb-3">📔</div>
            <h3 className="font-serif text-xl text-sage-700 mb-2">
              Garden Journal
            </h3>
            <p className="text-sage-600 text-sm">
              Track observations, harvest yields, and lessons learned
              throughout the season.
            </p>
          </Card>

          {/* Planting Calendar */}
          <Card>
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-serif text-xl text-sage-700 mb-2">
              Planting Calendar
            </h3>
            <p className="text-sage-600 text-sm">
              Know exactly when to plant, transplant, and harvest
              based on your growing zone.
            </p>
          </Card>

          {/* AI Advisor */}
          <Card>
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-serif text-xl text-sage-700 mb-2">
              AI Advisor
            </h3>
            <p className="text-sage-600 text-sm">
              Get personalized recommendations from Claude AI
              for plant selection, troubleshooting, and care tips.
            </p>
          </Card>

          {/* Care Tracking */}
          <Card>
            <div className="text-4xl mb-3">💧</div>
            <h3 className="font-serif text-xl text-sage-700 mb-2">
              Care Tracking
            </h3>
            <p className="text-sage-600 text-sm">
              Set reminders for watering, fertilizing, and pruning
              to keep your garden thriving.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-200 py-8 mt-20">
        <p className="text-center text-sage-500 text-sm">
          © 2026 GardenMind · Built with Next.js & Claude AI
        </p>
      </footer>
    </div>
  );
}
