"use client";

import { useState } from "react";
import { Modal, Button } from "@/components/ui";
import { ENTRY_TYPE_CONFIG } from "./EntryTypeConfig";
import type { JournalEntry } from "@/types";

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  open: boolean;
  gardenName?: string;
  bedName?: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
  isAuthor: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function EntryDetailModal({
  entry,
  open,
  gardenName,
  bedName,
  onClose,
  onEdit,
  onDelete,
  isAuthor,
}: EntryDetailModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!entry) return null;

  const config = ENTRY_TYPE_CONFIG[entry.type];

  const handleDelete = async () => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await onDelete(entry.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium mb-2 ${config.color}`}
            >
              {config.icon} {config.label}
            </span>
            <h2 className="text-2xl font-serif text-sage-700 leading-snug">
              {entry.title}
            </h2>
            <p className="text-sm text-sage-500 mt-1">
              {formatDate(entry.date)}
              {gardenName && (
                <>
                  {" · "}
                  {gardenName}
                  {bedName && ` › ${bedName}`}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Photos */}
        {entry.photos.length > 0 && (
          <div className="mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.photos[photoIndex]}
              alt=""
              className="w-full rounded-lg object-cover max-h-64"
            />
            {entry.photos.length > 1 && (
              <div className="flex gap-2 mt-2">
                {entry.photos.map((url, i) => (
                  <button key={url} onClick={() => setPhotoIndex(i)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className={`w-12 h-12 rounded-md object-cover border-2 transition-all ${
                        i === photoIndex ? "border-sage-600" : "border-transparent"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <p className="text-sage-700 text-sm whitespace-pre-wrap mb-4">
            {entry.notes}
          </p>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-sage-100 text-sage-600 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-sage-100">
          <div className="flex gap-2">
            {isAuthor && (
              <>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-red-500 hover:border-red-300"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
