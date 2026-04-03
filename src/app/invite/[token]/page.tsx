"use client";

import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface InviteDetails {
  gardenName: string;
  gardenColor: string;
  role: string;
  status: string;
}

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ token: t }) => setToken(t));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/invites/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setFetchError(data.error);
        else setInvite(data);
      })
      .catch(() => setFetchError("Failed to load invite details"));
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setAccepting(true);
    setAcceptError(null);
    try {
      const res = await fetch(`/api/invites/${token}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setAcceptError(data.error || "Failed to accept invite");
      } else {
        setAccepted(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch {
      setAcceptError("Something went wrong");
    } finally {
      setAccepting(false);
    }
  };

  if (userLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <p className="text-sage-600">Loading...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🌿</div>
          <h1 className="text-2xl font-serif text-sage-700 mb-2">
            Invite not found
          </h1>
          <p className="text-sage-600 mb-6">{fetchError}</p>
          <Button variant="primary" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <p className="text-sage-600">Loading invite details...</p>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-serif text-sage-700 mb-2">
            You&apos;re in!
          </h1>
          <p className="text-sage-600">
            Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div className="bg-white border border-sage-200 rounded-xl p-8 max-w-sm w-full shadow-sm text-center">
        <div
          className="w-12 h-12 rounded-full mx-auto mb-4"
          style={{ backgroundColor: invite.gardenColor }}
        />
        <h1 className="text-2xl font-serif text-sage-700 mb-1">
          You&apos;ve been invited
        </h1>
        <p className="text-sage-600 mb-1">
          to join <span className="font-medium">{invite.gardenName}</span>
        </p>
        <p className="text-sm text-sage-500 mb-6 capitalize">
          Role: {invite.role}
        </p>

        {invite.status === "accepted" ? (
          <div>
            <p className="text-sage-600 mb-4">
              This invite has already been accepted.
            </p>
            <Button variant="primary" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        ) : !user ? (
          <div>
            <p className="text-sage-600 mb-4 text-sm">
              You need to be logged in to accept this invite.
            </p>
            <Button
              variant="primary"
              onClick={() =>
                router.push(
                  `/api/auth/login?returnTo=/invite/${token}`
                )
              }
            >
              Log in to Accept
            </Button>
          </div>
        ) : (
          <div>
            {acceptError && (
              <p className="text-red-600 text-sm mb-3">{acceptError}</p>
            )}
            <Button
              variant="primary"
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? "Accepting..." : "Accept Invite"}
            </Button>
            <button
              onClick={() => router.push("/dashboard")}
              className="block mt-3 text-sm text-sage-500 hover:text-sage-700 mx-auto"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
