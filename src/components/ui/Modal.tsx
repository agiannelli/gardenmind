"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={cn(
          "bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-7",
          className
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl text-sage-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-sage-400 hover:text-sage-600 transition-colors p-1 rounded-md hover:bg-sage-50"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
