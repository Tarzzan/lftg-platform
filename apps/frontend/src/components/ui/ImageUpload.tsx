'use client';
import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  uploadUrl: string; // e.g. /plugins/animaux/species/ID/image
  onSuccess: (imageUrl: string) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({ currentImageUrl, uploadUrl, onSuccess, label = 'Photo', className = '' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFullUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://51.210.15.92';
    return `${base}${url}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
      setError('Format non supporté. Utilisez JPG, PNG, GIF ou WEBP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 Mo).');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrl = response.data?.imageUrl || response.data?.avatarUrl || response.data?.coverImage;
      if (newUrl) {
        onSuccess(newUrl);
        setPreview(getFullUrl(newUrl));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de l'upload.");
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    onSuccess('');
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        {preview ? (
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border group">
            <img
              src={preview}
              alt="Aperçu"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-gray-100"
              >
                <Upload className="w-3.5 h-3.5" />
                Changer
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-red-600"
              >
                <X className="w-3.5 h-3.5" />
                Supprimer
              </button>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-forest-400 hover:bg-forest-50/50 transition-colors text-muted-foreground hover:text-forest-600 disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-6 h-6 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span className="text-xs font-medium">Cliquer pour ajouter une photo</span>
                <span className="text-xs opacity-60">JPG, PNG, WEBP — max 10 Mo</span>
              </>
            )}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
