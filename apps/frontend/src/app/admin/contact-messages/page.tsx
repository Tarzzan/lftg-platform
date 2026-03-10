'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth-store';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ContactReply {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string; email: string };
}

interface ContactMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
  replies: ContactReply[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  READ: 'Lu',
  REPLIED: 'Répondu',
  ARCHIVED: 'Archivé',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  READ: 'bg-blue-100 text-blue-800 border-blue-200',
  REPLIED: 'bg-green-100 text-green-800 border-green-200',
  ARCHIVED: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-border',
};

const SUBJECT_ICONS: Record<string, string> = {
  'Formation CCAND': '🎓',
  'Formation RNCP Soigneur Animalier': '🏅',
  'Formation FPA': '🌾',
  "Adhésion": '🤝',
  'Don / Partenariat': '💚',
  'Visite pédagogique': '🦜',
  'Autre': '💬',
};

// ─── Composant principal ───────────────────────────────────────────────────────
export default function ContactMessagesPage() {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, replied: 0 });

  const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'all'
        ? `${API}/contact-messages`
        : `${API}/contact-messages?status=${filterStatus}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list: ContactMessage[] = Array.isArray(data) ? data : (data.data || []);
        setMessages(list);
        setStats({
          total: list.length,
          pending: list.filter(m => m.status === 'PENDING').length,
          replied: list.filter(m => m.status === 'REPLIED').length,
        });
      }
    } catch (e) {
      console.error('Erreur chargement messages:', e);
    } finally {
      setLoading(false);
    }
  }, [API, token, filterStatus]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (id: string) => {
    await fetch(`${API}/contact-messages/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'READ' }),
    });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'READ' } : m));
    if (selectedMessage?.id === id) setSelectedMessage(prev => prev ? { ...prev, status: 'READ' } : null);
  };

  const archiveMessage = async (id: string) => {
    await fetch(`${API}/contact-messages/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ARCHIVED' }),
    });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'ARCHIVED' } : m));
    if (selectedMessage?.id === id) setSelectedMessage(null);
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`${API}/contact-messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText }),
      });
      if (res.ok) {
        const reply = await res.json();
        setSelectedMessage(prev => prev ? {
          ...prev,
          status: 'REPLIED',
          replies: [...(prev.replies || []), reply],
        } : null);
        setMessages(prev => prev.map(m =>
          m.id === selectedMessage.id ? { ...m, status: 'REPLIED' } : m
        ));
        setReplyText('');
      }
    } finally {
      setReplying(false);
    }
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setReplyText('');
    if (msg.status === 'PENDING') await markAsRead(msg.id);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredMessages = messages.filter(m =>
    filterStatus === 'all' || m.status === filterStatus
  );

  return (
    <div className="flex flex-col h-full">
      {/* ─── En-tête ──────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messages de contact</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Messages reçus depuis la page vitrine publique
            </p>
          </div>
          <button
            onClick={fetchMessages}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            🔄 Actualiser
          </button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted' },
            { label: 'En attente', value: stats.pending, color: 'text-yellow-700', bg: 'bg-yellow-50' },
            { label: 'Répondus', value: stats.replied, color: 'text-green-700', bg: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 border border-border`}>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Corps principal ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Liste des messages */}
        <div className="w-80 flex-shrink-0 border-r border-border flex flex-col">
          {/* Filtres */}
          <div className="p-3 border-b border-border flex gap-1 flex-wrap">
            {[
              { value: 'all', label: 'Tous' },
              { value: 'PENDING', label: 'En attente' },
              { value: 'READ', label: 'Lus' },
              { value: 'REPLIED', label: 'Répondus' },
              { value: 'ARCHIVED', label: 'Archivés' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-3 py-6">{[1,2,3,4].map(i => <div key={i} className="h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg mx-4" />)}</div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
                <span className="text-3xl">📭</span>
                <span>Aucun message</span>
              </div>
            ) : (
              filteredMessages.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                    selectedMessage?.id === msg.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-base flex-shrink-0">
                      {SUBJECT_ICONS[msg.subject] || '💬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-sm font-semibold truncate ${msg.status === 'PENDING' ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {msg.senderName}
                        </span>
                        {msg.status === 'PENDING' && (
                          <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mb-1">{msg.subject}</div>
                      <div className="text-xs text-muted-foreground truncate">{msg.message}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[msg.status]}`}>
                          {STATUS_LABELS[msg.status]}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Détail du message */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedMessage ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <span className="text-6xl">✉️</span>
              <p className="text-lg font-medium">Sélectionnez un message</p>
              <p className="text-sm">Cliquez sur un message dans la liste pour le lire et y répondre.</p>
            </div>
          ) : (
            <>
              {/* Header du message */}
              <div className="flex-shrink-0 p-6 border-b border-border bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                      {SUBJECT_ICONS[selectedMessage.subject] || '💬'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedMessage.subject}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-medium text-foreground">{selectedMessage.senderName}</span>
                        <span className="text-sm text-muted-foreground">{selectedMessage.senderEmail}</span>
                        {selectedMessage.phone && (
                          <span className="text-sm text-muted-foreground">📞 {selectedMessage.phone}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[selectedMessage.status]}`}>
                          {STATUS_LABELS[selectedMessage.status]}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(selectedMessage.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <a
                      href={`mailto:${selectedMessage.senderEmail}?subject=Re: ${selectedMessage.subject}`}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-lg transition-colors"
                    >
                      ✉️ Email direct
                    </a>
                    <button
                      onClick={() => archiveMessage(selectedMessage.id)}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-medium rounded-lg transition-colors"
                    >
                      🗄️ Archiver
                    </button>
                  </div>
                </div>
              </div>

              {/* Corps du message + réponses */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Message original */}
                <div className="bg-muted rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                      {selectedMessage.senderName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm text-foreground">{selectedMessage.senderName}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{formatDate(selectedMessage.createdAt)}</span>
                  </div>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {/* Réponses */}
                {selectedMessage.replies && selectedMessage.replies.map(reply => (
                  <div key={reply.id} className="bg-green-50 border border-green-100 rounded-2xl p-5 ml-8">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {reply.author?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <span className="font-medium text-sm text-green-800">{reply.author?.name || 'Administrateur'}</span>
                      <span className="text-xs text-green-600 ml-auto">{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-green-900 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>

              {/* Zone de réponse */}
              {selectedMessage.status !== 'ARCHIVED' && (
                <div className="flex-shrink-0 p-4 border-t border-border bg-card">
                  <div className="flex gap-3">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Répondre à ${selectedMessage.senderName}...`}
                      rows={3}
                      className="flex-1 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background text-foreground placeholder:text-muted-foreground"
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={sendReply}
                        disabled={!replyText.trim() || replying}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground text-sm font-semibold rounded-xl transition-colors"
                      >
                        {replying ? '⏳' : '📤 Envoyer'}
                      </button>
                      <a
                        href={`mailto:${selectedMessage.senderEmail}?subject=Re: ${selectedMessage.subject}&body=${encodeURIComponent(replyText)}`}
                        className="px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground text-sm font-medium rounded-xl transition-colors text-center"
                      >
                        📧 Email
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    La réponse sera enregistrée dans la plateforme. Utilisez "Email" pour envoyer directement via votre client mail.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
