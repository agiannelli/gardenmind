"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");

    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/journals/upload",
        });
        newUrls.push(blob.url);
      }
      onChange([...photos, ...newUrls]);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removePhoto = (url: string) => {
    onChange(photos.filter((p) => p !== url));
  };

  return (
    <div>
      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {photos.map((url) => (
            <div key={url} className="relative group w-16 h-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover rounded-md border border-sage-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-3 py-2 border border-dashed border-sage-300 rounded-md text-sm text-sage-500 hover:border-sage-400 hover:text-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <span className="animate-spin">⏳</span> Uploading...
          </>
        ) : (
          <>
            📷 {photos.length > 0 ? "Add more photos" : "Add photos"}
          </>
        )}
      </button>

      {uploadError && (
        <p className="text-red-500 text-xs mt-1">{uploadError}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
