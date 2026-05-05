"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { uploadAdminFile } from "@/lib/api/admin-client";

interface ImageUploadButtonProps {
  tenantId: string;
  folder?: string;
  onUploadSuccess: (url: string) => void;
  className?: string;
}

export function ImageUploadButton({ tenantId, folder = "general", onUploadSuccess, className = "" }: ImageUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadAdminFile(file, tenantId, folder);
      if (result?.url) {
        onUploadSuccess(result.url);
      } else {
        alert("Error al subir la imagen. Intenta de nuevo.");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al subir la imagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 disabled:opacity-50 transition-colors ${className}`}
        title="Subir desde PC o Cámara"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
        ) : (
          <UploadCloud className="h-4 w-4 text-neutral-500" />
        )}
        <span className="hidden sm:inline">{uploading ? "Subiendo..." : "Subir"}</span>
      </button>
    </>
  );
}
