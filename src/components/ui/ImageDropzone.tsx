'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, UploadCloud, X } from 'lucide-react';
import { uploadImageFileToServer } from '@/lib/imageUpload';

interface ImageDropzoneProps {
  value?: string;
  onChange?: (imageUrl: string, storagePath?: string) => void;
  onMultipleUpload?: (items: Array<{ imageUrl: string; storagePath: string; fileName: string }>) => void;
  multiple?: boolean;
  folder?: string;
  label?: string;
  helperText?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  value,
  onChange,
  onMultipleUpload,
  multiple = false,
  folder = 'photographs',
  label,
  helperText,
  className = '',
  aspectRatio = 'auto',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type.startsWith('image/')) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setError('Please select valid image files (JPEG, PNG, WebP, AVIF).');
      setIsUploading(false);
      return;
    }

    try {
      if (multiple && onMultipleUpload) {
        const uploadedResults: Array<{ imageUrl: string; storagePath: string; fileName: string }> = [];
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          setUploadProgress(`Uploading ${i + 1} of ${validFiles.length}...`);
          const res = await uploadImageFileToServer(file, folder);
          uploadedResults.push({
            imageUrl: res.imageUrl,
            storagePath: res.storagePath,
            fileName: file.name,
          });
        }
        setUploadProgress('');
        onMultipleUpload(uploadedResults);
      } else {
        const singleFile = validFiles[0];
        setUploadProgress('Uploading to Supabase Storage...');
        const res = await uploadImageFileToServer(singleFile, folder);
        setUploadProgress('');
        if (onChange) {
          onChange(res.imageUrl, res.storagePath);
        }
      }
    } catch (err) {
      console.error('[ImageDropzone] Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please check network or credentials.');
    } finally {
      setIsUploading(false);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange('', '');
    }
    setError(null);
  };

  const getAspectClass = () => {
    if (aspectRatio === 'square') return 'aspect-square';
    if (aspectRatio === 'video') return 'aspect-video';
    if (aspectRatio === 'portrait') return 'aspect-[3/4]';
    return 'min-h-[160px]';
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative group rounded-md border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-6 text-center ${getAspectClass()} ${
          isDragging
            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
            : error
            ? 'border-destructive/60 bg-destructive/5'
            : value
            ? 'border-border bg-card'
            : 'border-border hover:border-primary/50 hover:bg-secondary/40 bg-card'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        {/* Existing Image Preview (Single Mode) */}
        {!multiple && value && !isUploading ? (
          <div className="absolute inset-0 w-full h-full group/preview">
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
              <span className="text-xs font-medium text-white bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-sm">
                Click or Drop to Replace
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                title="Remove Image"
                aria-label="Remove Image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-3 py-4 text-foreground">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wide">{uploadProgress || 'Uploading to Storage...'}</p>
              <p className="text-[11px] text-muted-foreground">Optimizing WebP &amp; caching on Supabase CDN</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 py-4 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
              {multiple ? <ImagePlus className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium text-foreground">
                <span className="text-primary font-semibold underline underline-offset-2">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-muted-foreground">
                {multiple ? 'Select multiple high-res wildlife photos (JPEG, PNG, WebP)' : 'High-resolution wildlife photo (JPEG, PNG, WebP up to 25MB)'}
              </p>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-destructive font-medium mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

