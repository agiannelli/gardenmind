"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { PhotoUpload } from "./PhotoUpload";
import { ENTRY_TYPE_CONFIG } from "./EntryTypeConfig";
import type { Garden, Bed, JournalEntry, EntryType } from "@/types";

interface CreateEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    gardenId: string;
    bedId?: string;
    type: EntryType;
    title: string;
    notes: string;
    tags: string[];
    photos: string[];
    date: string;
  }) => Promise<void>;
  gardens: Garden[];
  beds: Bed[];
  defaultGardenId?: string;
  entry?: JournalEntry; // present when editing
}

function toDateInputValue(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export function CreateEntryModal({
  open,
  onClose,
  onSave,
  gardens,
  beds,
  defaultGardenId,
  entry,
}: CreateEntryModalProps) {
  const [gardenId, setGardenId] = useState("");
  const [bedId, setBedId] = useState("");
  const [type, setType] = useState<EntryType>("observation");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [date, setDate] = useState(toDateInputValue(new Date().toISOString()));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const prevOpenRef = useRef(false);

  useEffect(() => {
    // Only reset form state when the modal transitions from closed → open
    if (!open || prevOpenRef.current === open) {
      prevOpenRef.current = open;
      return;
    }
    prevOpenRef.current = open;

    if (entry) {
      setGardenId(entry.gardenId);
      setBedId(entry.bedId || "");
      setType(entry.type);
      setTitle(entry.title);
      setNotes(entry.notes);
      setTags(entry.tags);
      setPhotos(entry.photos);
      setDate(toDateInputValue(entry.date));
    } else {
      setGardenId(defaultGardenId || gardens[0]?.id || "");
      setBedId("");
      setType("observation");
      setTitle("");
      setNotes("");
      setTags([]);
      setPhotos([]);
      setDate(toDateInputValue(new Date().toISOString()));
    }
    setErrors({});
    setTagInput("");
  }, [entry, open, defaultGardenId, gardens]);

  const bedsForGarden = beds.filter((b) => b.gardenId === gardenId);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!gardenId) e.gardenId = "Please select a garden";
    if (!title.trim()) e.title = "Title is required";
    else if (title.length > 100) e.title = "Title must be 100 characters or less";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        gardenId,
        bedId: bedId || undefined,
        type,
        title: title.trim(),
        notes: notes.trim(),
        tags,
        photos,
        date: new Date(date).toISOString(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-serif text-sage-700 mb-5">
          {entry ? "Edit Entry" : "New Journal Entry"}
        </h2>

        <div className="space-y-4">
          {/* Entry type */}
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(ENTRY_TYPE_CONFIG) as [EntryType, typeof ENTRY_TYPE_CONFIG[EntryType]][]).map(
                ([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      type === key
                        ? `${cfg.color} border-current`
                        : "bg-white border-sage-200 text-sage-600 hover:border-sage-400"
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    {cfg.label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="entry-title" className="block text-sm font-medium text-sage-700 mb-1">
              Title
            </label>
            <Input
              id="entry-title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: "" })); }}
              placeholder="e.g., Spotted aphids on tomatoes"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Garden + Bed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="entry-garden" className="block text-sm font-medium text-sage-700 mb-1">
                Garden
              </label>
              <select
                id="entry-garden"
                value={gardenId}
                onChange={(e) => { setGardenId(e.target.value); setBedId(""); setErrors((prev) => ({ ...prev, gardenId: "" })); }}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 ${errors.gardenId ? "border-red-500" : "border-sage-300"}`}
              >
                <option value="">Select garden…</option>
                {gardens.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              {errors.gardenId && <p className="text-red-500 text-xs mt-1">{errors.gardenId}</p>}
            </div>

            <div>
              <label htmlFor="entry-bed" className="block text-sm font-medium text-sage-700 mb-1">
                Bed <span className="text-sage-400 font-normal">(optional)</span>
              </label>
              <select
                id="entry-bed"
                value={bedId}
                onChange={(e) => setBedId(e.target.value)}
                disabled={bedsForGarden.length === 0}
                className="w-full px-3 py-2 border border-sage-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 disabled:opacity-50"
              >
                <option value="">All beds</option>
                {bedsForGarden.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="entry-date" className="block text-sm font-medium text-sage-700 mb-1">
              Date
            </label>
            <input
              id="entry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-sage-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="entry-notes" className="block text-sm font-medium text-sage-700 mb-1">
              Notes <span className="text-sage-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="entry-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Describe what you observed, what action you took, quantities harvested…"
              className="w-full px-3 py-2 border border-sage-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">
              Tags <span className="text-sage-400 font-normal">(optional)</span>
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full"
                >
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag…"
                className="flex-1 text-sm"
              />
              <Button variant="outline" size="sm" onClick={addTag}>Add</Button>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">
              Photos <span className="text-sage-400 font-normal">(optional)</span>
            </label>
            <PhotoUpload photos={photos} onChange={setPhotos} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : entry ? "Save Changes" : "Add Entry"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
