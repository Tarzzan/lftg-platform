'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Conversation {
  id: string;
  name?: string;
  type: 'DIRECT' | 'GROUP';
  zone?: string;
  participants: Participant[];
  lastMessage?: { content: string; createdAt: string; sender?: { name: string } };
  unreadCount?: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string };
  type?: string;
}

export default function MessagingPage() {
  const queryClient = useQueryClient();
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const { data: conversations = [], isLoading, isError } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/messaging/conversations');
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 10000,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['messages', selectedConv],
    queryFn: async () => {
      const res = await api.get(`/messaging/conversations/${selectedConv}/messages`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!selectedConv,
    refetchInterval: 5000,
  });

  const { data: unread } = useQuery<{ count: number }>({
    queryKey: ['unread-messages'],
    queryFn: async () => {
      const res = await api.get('/messaging/unread');
      return res.data;
    },
    refetchInterval: 15000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post('/messaging/messages', {
        conversationId: selectedConv,
        content,
        type: 'TEXT',
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConv] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (convId: string) => {
      const res = await api.post(`/messaging/conversations/${convId}/read`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Opération réussie avec succès');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
    },
  });

  const handleSelectConv = (id: string) => {
    setSelectedConv(id);
    markReadMutation.mutate(id);
  };

  const selectedConvData = conversations.find((c) => c.id === selectedConv);

  return (
    <div className="p-6 h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Messagerie interne</h1>
          <p className="text-slate-400 mt-1">
            {unread?.count ? `${unread.count} message${unread.count > 1 ? 's' : ''} non lu${unread.count > 1 ? 's' : ''}` : 'Tous les messages lus'}
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Liste des conversations */}
        <div className="w-72 flex-shrink-0 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-700">
            <p className="text-white font-semibold text-sm">Conversations</p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            </div>
          ) : isError ? (
            <p className="text-red-400 text-sm p-4 text-center">Erreur de chargement</p>
          ) : conversations.length === 0 ? (
            <p className="text-slate-500 text-sm p-4 text-center">Aucune conversation</p>
          ) : (
            <div className="overflow-y-auto flex-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={`w-full text-left p-3 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors ${
                    selectedConv === conv.id ? 'bg-indigo-900/30 border-l-2 border-l-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium truncate">
                      {conv.name || conv.participants.map((p) => p.name).join(', ')}
                    </p>
                    {conv.unreadCount ? (
                      <span className="ml-2 px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${conv.type === 'GROUP' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'}`}>
                      {conv.type === 'GROUP' ? 'Groupe' : 'Direct'}
                    </span>
                    {conv.zone && <span className="text-slate-500 text-xs truncate">{conv.zone}</span>}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-slate-500 text-xs mt-1 truncate">{conv.lastMessage.content}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zone de messages */}
        <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col min-h-0">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-slate-300 font-semibold">Sélectionnez une conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-700 flex-shrink-0">
                <p className="text-white font-semibold">
                  {selectedConvData?.name || selectedConvData?.participants.map((p) => p.name).join(', ')}
                </p>
                <p className="text-slate-400 text-xs">
                  {selectedConvData?.participants.length} participant{(selectedConvData?.participants.length || 0) > 1 ? 's' : ''}
                  {selectedConvData?.zone ? ` · ${selectedConvData.zone}` : ''}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-slate-500 text-center text-sm py-8">Aucun message dans cette conversation</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                        {msg.sender.avatar || msg.sender.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-white text-sm font-semibold">{msg.sender.name}</span>
                          <span className="text-slate-500 text-xs">
                            {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm mt-0.5">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t border-slate-700 flex-shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && newMessage.trim() && sendMutation.mutate(newMessage.trim())}
                    placeholder="Écrire un message..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => newMessage.trim() && sendMutation.mutate(newMessage.trim())}
                    disabled={!newMessage.trim() || sendMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
