'use client';
import { toast } from 'sonner';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Leaf, Edit, Trash2, Bird } from 'lucide-react';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';

interface Species {
  id: string;
  name: string;
  scientificName?: string;
  category?: string;
  description?: string;
  _count?: { animals: number };
}

export default function EspecesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editSpecies, setEditSpecies] = useState<Species | null>(null);
  const [form, setForm] = useState({ name: '', scientificName: '', category: 'OISEAU', description: '' });

  const { data: species = [], isLoading, isError, error } = useQuery<Species[]>({
    queryKey: ['species'],
    queryFn: () => api.get('/plugins/animaux/species').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => editSpecies
      ? api.put(`/plugins/animaux/species/${editSpecies.id}`, data)
      : api.post('/plugins/animaux/species', data),
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['species'] });
      setShowModal(false);
      setEditSpecies(null);
      setForm({ name: '', scientificName: '', category: 'OISEAU', description: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/plugins/animaux/species/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['species'] }),
  });

  const filtered = species.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.scientificName?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (s: Species) => {
    setEditSpecies(s);
    setForm({ name: s.name, scientificName: s.scientificName || '', category: s.category || 'OISEAU', description: s.description || '' });
    setShowModal(true);
  };

  const categories = ['OISEAU', 'REPTILE', 'MAMMIFERE', 'AMPHIBIEN', 'POISSON', 'INSECTE', 'AUTRE'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Espèces</h1>
          <p className="text-muted-foreground text-sm mt-1">{species.length} espèce{species.length !== 1 ? 's' : ''} référencée{species.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditSpecies(null); setForm({ name: '', scientificName: '', category: 'OISEAU', description: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle espèce
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une espèce..."
          className="input pl-9 w-full max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 card">
          <Leaf className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune espèce trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="card p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
                  <Bird className="w-5 h-5 text-forest-600" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{s.name}</h3>
              {s.scientificName && <p className="text-xs text-muted-foreground italic mt-0.5">{s.scientificName}</p>}
              <div className="flex items-center justify-between mt-3">
                {s.category && (
                  <span className="text-xs bg-forest-50 text-forest-700 px-2 py-0.5 rounded-full border border-forest-200">{s.category}</span>
                )}
                {s._count && (
                  <span className="text-xs text-muted-foreground">{s._count.animals} animal{s._count.animals !== 1 ? 'x' : ''}</span>
                )}
              </div>
              {s.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editSpecies ? 'Modifier l\'espèce' : 'Nouvelle espèce'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom commun *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Amazone à front bleu" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom scientifique</label>
            <input type="text" value={form.scientificName} onChange={e => setForm(f => ({ ...f, scientificName: e.target.value }))} placeholder="Amazona aestiva" className="input w-full italic" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Catégorie</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input w-full">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input w-full resize-none" placeholder="Caractéristiques, habitat, régime alimentaire..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
            <button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Enregistrement...' : editSpecies ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
