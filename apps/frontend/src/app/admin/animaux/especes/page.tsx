'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Leaf, Edit, Trash2, Bird } from 'lucide-react';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface Species {
  id: string;
  name: string;
  scientificName?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  conservationStatus?: string;
  citesAppendix?: string;
  habitat?: string;
  diet?: string;
  lifespan?: number;
  _count?: { animals: number };
}

const CATEGORY_COLORS: Record<string, string> = {
  OISEAU: 'bg-sky-50 text-sky-700 border-sky-200',
  REPTILE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MAMMIFERE: 'bg-amber-50 text-amber-700 border-amber-200',
  AMPHIBIEN: 'bg-teal-50 text-teal-700 border-teal-200',
  POISSON: 'bg-blue-50 text-blue-700 border-blue-200',
  INSECTE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  AUTRE: 'bg-gray-50 text-gray-700 border-gray-200',
};

const CONSERVATION_COLORS: Record<string, string> = {
  LC: 'bg-green-100 text-green-700',
  NT: 'bg-yellow-100 text-yellow-700',
  VU: 'bg-orange-100 text-orange-700',
  EN: 'bg-red-100 text-red-700',
  CR: 'bg-red-200 text-red-800',
};


function getAnimalIcon(species?: any): string {
  const name = (species?.name ?? species?.commonName ?? '').toLowerCase();
  const sci = (species?.scientificName ?? '').toLowerCase();
  if (name.includes('ara') || name.includes('perroquet') || name.includes('toucan') || sci.includes('ara ')) return '/icons/animal-ara.png';
  if (name.includes('amazone') || sci.includes('amazona')) return '/icons/animal-amazone.png';
  if (name.includes('tinamou') || sci.includes('tinamus') || sci.includes('crypturellus')) return '/icons/animal-tinamou.png';
  if (name.includes('hocco') || name.includes('crax') || sci.includes('crax')) return '/icons/animal-hocco.png';
  if (name.includes('tocro') || sci.includes('odontophorus')) return '/icons/animal-tocro.png';
  if (name.includes('caïman') || name.includes('crocodil') || sci.includes('caiman') || sci.includes('crocodylus')) return '/icons/animal-caiman.png';
  if (name.includes('iguane') || sci.includes('iguana')) return '/icons/animal-iguane.png';
  if (name.includes('matamata') || sci.includes('chelus')) return '/icons/animal-matamata.png';
  if (name.includes('tortue') || sci.includes('testudo') || sci.includes('chelonoidis') || sci.includes('podocnemis')) return '/icons/animal-tortue.png';
  if (name.includes('anaconda') || sci.includes('eunectes')) return '/icons/animal-serpent.png';
  if (name.includes('boa bordé') || sci.includes('corallus')) return '/icons/animal-boa-borde.png';
  if (name.includes('boa constricteur') || sci.includes('boa constrictor')) return '/icons/animal-boa-constricteur.png';
  if (name.includes('serpent') || name.includes('boa') || name.includes('python')) return '/icons/animal-serpent.png';
  if (name.includes('agouti') || sci.includes('dasyprocta')) return '/icons/animal-agouti.png';
  if (name.includes('capybara') || name.includes('cabiai') || sci.includes('hydrochoerus')) return '/icons/animal-capybara.png';
  if (name.includes('pécari') || name.includes('pecari') || sci.includes('tayassu') || sci.includes('pecari')) return '/icons/animal-pecari.png';
  if (name.includes('tapir') || sci.includes('tapirus')) return '/icons/animal-tapir.png';
  if (name.includes('paresseux') || sci.includes('bradypus') || sci.includes('choloepus')) return '/icons/animal-paresseux.png';
  if (name.includes('loutre') || sci.includes('pteronura') || sci.includes('lontra')) return '/icons/animal-loutre.png';
  if (name.includes('singe') || name.includes('primate') || sci.includes('alouatta') || sci.includes('ateles') || sci.includes('cebus') || sci.includes('saimiri')) return '/icons/animal-singe.png';
  return '/icons/animal-lezard.png';
}

export default function EspecesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editSpecies, setEditSpecies] = useState<Species | null>(null);
  const [form, setForm] = useState({ name: '', scientificName: '', category: 'OISEAU', description: '', imageUrl: '' });
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
      setForm({ name: '', scientificName: '', category: 'OISEAU', description: '', imageUrl: '' });
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
    setForm({ name: s.name, scientificName: s.scientificName || '', category: s.category || 'OISEAU', description: s.description || '', imageUrl: s.imageUrl || '' });
    setShowModal(true);
  };
  const categories = ['OISEAU', 'REPTILE', 'MAMMIFERE', 'AMPHIBIEN', 'POISSON', 'INSECTE', 'AUTRE'];

  const getImageSrc = (s: Species) => {
    if (s.imageUrl) {
      return s.imageUrl.startsWith('http') ? s.imageUrl : `http://51.210.15.92${s.imageUrl}`;
    }
    // Fallback : illustration aquarelle de l'espèce
    return getAnimalIcon(s);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Espèces</h1>
          <p className="text-muted-foreground text-sm mt-1">{species.length} espèce{species.length !== 1 ? 's' : ''} référencée{species.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditSpecies(null); setForm({ name: '', scientificName: '', category: 'OISEAU', description: '', imageUrl: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
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
          {filtered.map(s => {
            const imgSrc = getImageSrc(s);
            const catColor = CATEGORY_COLORS[s.category || 'AUTRE'] || CATEGORY_COLORS.AUTRE;
            const consColor = s.conservationStatus ? (CONSERVATION_COLORS[s.conservationStatus] || 'bg-gray-100 text-gray-600') : null;
            return (
              <div key={s.id} className="card overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Image de l'espèce */}
                <div className="relative h-44 bg-forest-50 overflow-hidden">
                  <img
                    src={imgSrc || getAnimalIcon(s)}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = getAnimalIcon(s); }}
                  />
                  {/* Badges superposés */}
                  <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    {s.conservationStatus && consColor && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${consColor}`}>
                        {s.conservationStatus}
                      </span>
                    )}
                    {s.citesAppendix && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                        CITES {s.citesAppendix}
                      </span>
                    )}
                  </div>
                  {/* Boutons d'action */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-600 hover:text-foreground shadow transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(s.id)} className="p-1.5 rounded-lg bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-600 shadow transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Contenu de la carte */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-base">{s.name}</h3>
                  {s.scientificName && <p className="text-xs text-muted-foreground italic mt-0.5">{s.scientificName}</p>}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {s.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${catColor}`}>{s.category}</span>
                    )}
                    {s.lifespan && (
                      <span className="text-xs text-muted-foreground">⏱ {s.lifespan} ans</span>
                    )}
                    {s._count && (
                      <span className="text-xs text-muted-foreground ml-auto">{s._count.animals} animal{s._count.animals !== 1 ? 'x' : ''}</span>
                    )}
                  </div>
                  {s.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.description}</p>}
                </div>
              </div>
            );
          })}
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
          {editSpecies && (
            <ImageUpload
              currentImageUrl={form.imageUrl || editSpecies.imageUrl}
              uploadUrl={`/plugins/animaux/species/${editSpecies.id}/image`}
              onSuccess={(url) => {
                setForm(f => ({ ...f, imageUrl: url }));
              }}
              label="Photo de l'espèce"
            />
          )}
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
