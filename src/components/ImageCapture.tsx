/**
 * ImageCapture component using react-dropzone.
 * Handles drag-and-drop, file selection, and mobile camera.
 */

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Camera, X } from "lucide-react";
import { cn } from "../lib/utils";

interface Props {
  onImageCapture: (base64: string) => void;
  disabled?: boolean;
}

export function ImageCapture({ onImageCapture, disabled }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      onImageCapture(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageCapture]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    disabled,
    onDrop: (files) => {
      if (files[0]) processFile(files[0]);
    },
  });

  const clearImage = () => {
    setPreview(null);
  };

  if (preview) {
    return (
      <div className="relative border border-[var(--color-border)]">
        <img src={preview} alt="Preview" className="w-full block" />
        <button
          type="button"
          onClick={clearImage}
          disabled={disabled}
          className={cn(
            "absolute top-2 right-2 p-1.5",
            "bg-white/90 hover:bg-white",
            "border border-[var(--color-border)]",
            "text-[var(--color-ink)] transition-colors",
            "disabled:opacity-50"
          )}
        >
          <X className="w-4 h-4" />
        </button>
        <figcaption className="text-center py-2 text-sm text-[var(--color-ink-muted)] italic border-t border-[var(--color-border)]">
          Input image for classification
        </figcaption>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed p-12 text-center cursor-pointer transition-all",
        "bg-[var(--color-figure-bg)]",
        isDragActive
          ? "border-[var(--color-accent)] bg-[var(--color-paper-dark)]"
          : "border-[var(--color-border)] hover:border-[var(--color-ink-muted)]"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-4 text-[var(--color-ink-muted)]">
          <Upload className="w-8 h-8" />
          <Camera className="w-8 h-8" />
        </div>
        <p className="text-[var(--color-ink-light)]">
          {isDragActive ? "Drop image here..." : "Drop an image or click to select"}
        </p>
        <p className="text-sm text-[var(--color-ink-muted)] italic">
          Camera capture supported on mobile devices
        </p>
      </div>
    </div>
  );
}
