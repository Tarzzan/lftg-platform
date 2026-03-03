'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, FormField, Input, Select, ModalFooter, BtnPrimary, BtnSecondary } from '../ui/Modal';
import { usersApi, rolesApi } from '@/lib/api';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const qc = useQueryClient();
  const isEdit = !!user;

  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list });

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    roleIds: [] as string[],
    isActive: 'true',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        email: user.email ?? '',
        password: '',
        roleIds: (user.roles ?? []).map((r: any) => r.id),
        isActive: String(user.isActive ?? true),
      });
    } else {
      setForm({ name: '', email: '', password: '', roleIds: [], isActive: 'true' });
    }
    setErrors({});
  }, [user, isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom est requis';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email invalide';
    if (!isEdit && !form.password) e.password = 'Le mot de passe est requis';
    if (!isEdit && form.password.length < 8) e.password = 'Minimum 8 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? usersApi.update(user.id, data) : usersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: any = {
      name: form.name,
      email: form.email,
      roleIds: form.roleIds,
      isActive: form.isActive === 'true',
    };
    if (!isEdit || form.password) payload.password = form.password;
    mutation.mutate(payload);
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleRole = (roleId: string) => {
    setForm((f) => ({
      ...f,
      roleIds: f.roleIds.includes(roleId)
        ? f.roleIds.filter((id) => id !== roleId)
        : [...f.roleIds, roleId],
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nom complet *" error={errors.name}>
            <Input value={form.name} onChange={set('name')} placeholder="Ex: Jean Dupont" autoFocus />
          </FormField>
          <FormField label="Email *" error={errors.email}>
            <Input type="email" value={form.email} onChange={set('email')} placeholder="jean.dupont@lftg.fr" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={isEdit ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'} error={errors.password}>
            <Input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder={isEdit ? 'Laisser vide pour ne pas changer' : 'Min. 8 caractères'}
            />
          </FormField>
          <FormField label="Statut">
            <Select value={form.isActive} onChange={set('isActive')}>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Rôles">
          <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg min-h-[48px]">
            {(roles as any[]).map((role: any) => (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleRole(role.id)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  form.roleIds.includes(role.id)
                    ? 'bg-forest-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {role.name}
              </button>
            ))}
            {(roles as any[]).length === 0 && (
              <span className="text-xs text-muted-foreground">Chargement des rôles...</span>
            )}
          </div>
        </FormField>

        {mutation.isError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            Une erreur est survenue. Vérifiez que l'email n'est pas déjà utilisé.
          </p>
        )}

        <ModalFooter>
          <BtnSecondary type="button" onClick={onClose}>Annuler</BtnSecondary>
          <BtnPrimary type="submit" loading={mutation.isPending}>
            {isEdit ? 'Enregistrer' : 'Créer l\'utilisateur'}
          </BtnPrimary>
        </ModalFooter>
      </form>
    </Modal>
  );
}
