'use client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

interface GalleryItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  filename?: string;
  title?: string;
  description?: string;
  animalId?: string;
  animalName?: string;
  category?: string;
  takenAt?: string;
  uploadedAt?: string;
  size?: number;
}

export default function GalleryPage() {
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const { data: images = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ['gallery'],
    queryFn: async () => {
      const res = await api.get('/gallery');
      return Array.isArray(res.data) ? res.data : (res.data?.items || []);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      // Obtenir une URL de pré-signature S3
      const { data: { uploadUrl, fileUrl } } = await api.post('/gallery/upload-url', {
        filename: file.name,
        contentType: file.type,
      });
      // Upload direct vers S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      // Enregistrer dans la BDD
      await api.post('/gallery', { url: fileUrl, filename: file.name, title: file.name.split('.')[0] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    } catch (err) {
      setUploadError('Erreur lors de l\'upload. Veuillez réessayer.');
    } finally {
      setUploading(false);
      e.target.value ='';
    }
  };

  const filtered = images.filter((img) =>
    !filter || img.title?.toLowerCase().includes(filter.toLowerCase()) ||
    img.animalName?.toLowerCase().includes(filter.toLowerCase()) ||
    img.category?.toLowerCase().includes(filter.toLowerCase())
  );

  const formatSize = (bytes?: number) => {
    if (!bytes) return'';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Galerie Photo</h1>
          <p className="text-slate-400 mt-1">{images.length} photo(s) dans la galerie</p>
        </div>
        <label className={`cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors ${uploading ?'opacity-50 cursor-not-allowed':''}`}>{uploading ?'Upload en cours...':' Ajouter une photo'}<input type="file"accept="image/*"className="hidden"onChange={handleFileUpload} disabled={uploading} />
        </label>
      </div>

      {uploadError && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
          <p className="text-red-400">{uploadError}</p>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-3">
        <input
          type="text"placeholder="Rechercher par titre, animal, catégorie..."value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"/>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl w-full bg-slate-800 rounded-xl overflow-hidden"onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img src={selectedImage.url} alt={selectedImage.title ||''} className="w-full max-h-[60vh] object-contain bg-black"/>
              <button onClick={() => setSelectedImage(null)} className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black"></button>
            </div>
            <div className="p-4">
              <h3 className="text-white font-semibold">{selectedImage.title || selectedImage.filename}</h3>
              <div className="flex gap-4 mt-2 text-sm text-slate-400">
                {selectedImage.animalName && <span> {selectedImage.animalName}</span>}
                {selectedImage.category && <span>️ {selectedImage.category}</span>}
                {selectedImage.takenAt && <span> {new Date(selectedImage.takenAt).toLocaleDateString('fr-FR')}</span>}
                {selectedImage.size && <span> {formatSize(selectedImage.size)}</span>}
              </div>
              {selectedImage.description && <p className="text-slate-300 text-sm mt-2">{selectedImage.description}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Grille */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <p className="text-4xl mb-3"></p>
          <p className="text-slate-300 font-semibold">{filter ?'Aucun résultat pour cette recherche':'Aucune photo dans la galerie'}</p>
          <p className="text-slate-400 text-sm mt-1">Ajoutez des photos en cliquant sur le bouton ci-dessus</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className="group relative bg-slate-800 rounded-lg overflow-hidden cursor-pointer border border-slate-700 hover:border-indigo-500 transition-colors aspect-square">
              <img
                src={img.thumbnailUrl || img.url}
                alt={img.title || img.filename ||''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"onError={(e) => {
                  (e.target as HTMLImageElement).src ='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFlMjkzYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+TtyA8L3RleHQ+PC9zdmc+';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                <div className="p-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium truncate">{img.title || img.filename}</p>
                  {img.animalName && <p className="text-slate-300 text-xs truncate">{img.animalName}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
