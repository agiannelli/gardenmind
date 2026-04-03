"use client";

import { useState } from "react";
import { Modal, Button, Input } from "@/components/ui";
import type { Garden, GardenMember } from "@/types";

interface GardenMembersModalProps {
  open: boolean;
  onClose: () => void;
  garden: Garden;
  currentUserId: string;
  onInvite: (
    gardenId: string,
    email: string,
    role: "editor" | "viewer"
  ) => Promise<{ member: GardenMember; inviteToken: string }>;
  onRemoveMember: (gardenId: string, memberId: string) => Promise<void>;
}

export function GardenMembersModal({
  open,
  onClose,
  garden,
  currentUserId,
  onInvite,
  onRemoveMember,
}: GardenMembersModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isOwner = garden.userId === currentUserId;

  const handleInvite = async () => {
    if (!email.trim()) {
      setInviteError("Email is required");
      return;
    }
    setInviting(true);
    setInviteError("");
    setInviteLink(null);
    try {
      const { inviteToken } = await onInvite(garden.id, email.trim(), role);
      const origin = window.location.origin;
      setInviteLink(`${origin}/invite/${inviteToken}`);
      setEmail("");
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Failed to create invite"
      );
    } finally {
      setInviting(false);
    }
  };

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      await onRemoveMember(garden.id, memberId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 max-w-lg w-full">
        <h2 className="text-2xl font-serif text-sage-700 mb-1">
          Team — {garden.name}
        </h2>
        <p className="text-sm text-sage-600 mb-6">
          Invite collaborators to view or edit this garden.
        </p>

        {/* Current members */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-sage-700 mb-2">Members</h3>
          <div className="space-y-2">
            {/* Owner row */}
            <div className="flex items-center justify-between py-2 px-3 bg-sage-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-sage-800">You</p>
                <p className="text-xs text-sage-500">Owner</p>
              </div>
            </div>

            {garden.members.length === 0 && (
              <p className="text-sm text-sage-400 px-1">
                No team members yet. Invite someone below.
              </p>
            )}

            {garden.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-2 px-3 border border-sage-100 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-sage-800">
                    {member.email}
                  </p>
                  <p className="text-xs text-sage-500 capitalize">
                    {member.role} ·{" "}
                    {member.status === "pending" ? (
                      <span className="text-amber-600">Invite pending</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    disabled={removingId === member.id}
                    className="text-xs text-sage-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {removingId === member.id ? "Removing..." : "Remove"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invite form (owner only) */}
        {isOwner && (
          <div className="border-t border-sage-100 pt-5">
            <h3 className="text-sm font-medium text-sage-700 mb-3">
              Invite someone
            </h3>
            <div className="flex gap-2 mb-2">
              <Input
                type="email"
                placeholder="their@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setInviteError("");
                }}
                className={`flex-1 ${inviteError ? "border-red-500" : ""}`}
              />
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "editor" | "viewer")
                }
                className="px-3 py-2 border border-sage-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            {inviteError && (
              <p className="text-red-500 text-xs mb-2">{inviteError}</p>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleInvite}
              disabled={inviting}
            >
              {inviting ? "Creating invite..." : "Create Invite Link"}
            </Button>

            {inviteLink && (
              <div className="mt-4 p-3 bg-sage-50 rounded-lg border border-sage-200">
                <p className="text-xs text-sage-600 mb-2 font-medium">
                  Share this link with your collaborator:
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-sage-700 truncate flex-1 bg-white border border-sage-200 rounded px-2 py-1">
                    {inviteLink}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-sage-600 hover:text-sage-800 font-medium shrink-0"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
