'use client';

import { useState, useRef, useEffect } from 'react';

const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    name: 'Équipe Soins',
    type: 'GROUP',
    zone: 'Volière A+B',
    avatar: '🦜',
    participants: ['William MERI', 'Marie Dupont', 'Sophie Bernard'],
    lastMessage: 'Le perroquet Amazona a été nourri à 8h30',
    lastSender: 'Marie Dupont',
    lastTime: '08:30',
    unread: 2,
  },
  {
    id: 'conv-2',
    name: 'Urgences Médicales',
    type: 'GROUP',
    zone: 'Infirmerie',
    avatar: '🏥',
    participants: ['William MERI', 'Dr. Rousseau'],
    lastMessage: '⚠️ Dendrobate en observation — fièvre légère',
    lastSender: 'Dr. Rousseau',
    lastTime: '09:15',
    unread: 1,
  },
  {
    id: 'conv-3',
    name: 'Marie Dupont',
    type: 'DIRECT',
    zone: null,
    avatar: '👩‍🔬',
    participants: ['William MERI', 'Marie Dupont'],
    lastMessage: 'Rapport de la semaine envoyé',
    lastSender: 'Vous',
    lastTime: 'Hier',
    unread: 0,
  },
  {
    id: 'conv-4',
    name: 'Logistique & Stock',
    type: 'GROUP',
    zone: 'Entrepôt',
    avatar: '📦',
    participants: ['William MERI', 'Jean Martin'],
    lastMessage: 'Stock de graines de tournesol critique — commande urgente',
    lastSender: 'Jean Martin',
    lastTime: '07:45',
    unread: 3,
  },
  {
    id: 'conv-5',
    name: 'Dr. Rousseau',
    type: 'DIRECT',
    zone: null,
    avatar: '👨‍⚕️',
    participants: ['William MERI', 'Dr. Rousseau'],
    lastMessage: 'Prochain bilan de santé prévu vendredi',
    lastSender: 'Dr. Rousseau',
    lastTime: 'Lun',
    unread: 0,
  },
];

const MOCK_MESSAGES: Record<string, any[]> = {
  'conv-1': [
    { id: 'm-1', sender: 'Marie Dupont', avatar: '👩‍🔬', content: 'Bonjour ! Soins du matin terminés pour la Volière A', time: '07:00', isMe: false, type: 'TEXT' },
    { id: 'm-2', sender: 'Sophie Bernard', avatar: '👩‍🎓', content: 'Parfait ! Je prends en charge la Volière B', time: '07:05', isMe: false, type: 'TEXT' },
    { id: 'm-3', sender: 'Vous', avatar: '👨‍💼', content: 'Merci à tous. N\'oubliez pas la pesée mensuelle cet après-midi à 14h', time: '07:30', isMe: true, type: 'TEXT' },
    { id: 'm-4', sender: 'Marie Dupont', avatar: '👩‍🔬', content: 'Noté ! On sera là', time: '07:32', isMe: false, type: 'TEXT' },
    { id: 'm-5', sender: 'Sophie Bernard', avatar: '👩‍🎓', content: 'Présente aussi 👍', time: '07:35', isMe: false, type: 'TEXT' },
    { id: 'm-6', sender: 'Marie Dupont', avatar: '👩‍🔬', content: 'Le perroquet Amazona a été nourri à 8h30', time: '08:30', isMe: false, type: 'TEXT' },
  ],
  'conv-2': [
    { id: 'm-7', sender: 'Dr. Rousseau', avatar: '👨‍⚕️', content: 'Visite de routine terminée. Tous les animaux en bonne santé.', time: '06:00', isMe: false, type: 'TEXT' },
    { id: 'm-8', sender: 'Vous', avatar: '👨‍💼', content: 'Merci Docteur, bon rapport !', time: '06:15', isMe: true, type: 'TEXT' },
    { id: 'm-9', sender: 'Dr. Rousseau', avatar: '👨‍⚕️', content: '⚠️ Dendrobate en observation — fièvre légère', time: '09:15', isMe: false, type: 'ALERT' },
  ],
  'conv-3': [
    { id: 'm-10', sender: 'Marie Dupont', avatar: '👩‍🔬', content: 'Bonjour William, voici le rapport de la semaine', time: 'Hier 16:00', isMe: false, type: 'TEXT' },
    { id: 'm-11', sender: 'Vous', avatar: '👨‍💼', content: 'Rapport de la semaine envoyé', time: 'Hier 16:30', isMe: true, type: 'TEXT' },
  ],
  'conv-4': [
    { id: 'm-12', sender: 'Jean Martin', avatar: '📦', content: 'Inventaire du matin effectué', time: '07:00', isMe: false, type: 'TEXT' },
    { id: 'm-13', sender: 'Jean Martin', avatar: '📦', content: 'Stock de graines de tournesol critique — commande urgente', time: '07:45', isMe: false, type: 'ALERT' },
    { id: 'm-14', sender: 'Vous', avatar: '👨‍💼', content: 'Je m\'en occupe, commande passée', time: '08:00', isMe: true, type: 'TEXT' },
  ],
};

const typeColors: Record<string, string> = {
  GROUP: 'bg-forest-100 text-forest-700',
  DIRECT: 'bg-maroni-100 text-maroni-700',
};

export default function MessagingPage() {
  const [selectedConv, setSelectedConv] = useState(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES['conv-1']);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConvs = MOCK_CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (conv: typeof MOCK_CONVERSATIONS[0]) => {
    setSelectedConv(conv);
    setMessages(MOCK_MESSAGES[conv.id] || []);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: `m-${Date.now()}`,
      sender: 'Vous',
      avatar: '👨‍💼',
      content: newMessage,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'TEXT',
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-wood-900">Messagerie Interne</h1>
          <p className="text-sm text-wood-500 mt-1">Communication en temps réel entre les équipes</p>
        </div>
        <div className="flex items-center gap-3">
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {totalUnread} non lus
            </span>
          )}
          <button className="btn-primary text-sm px-4 py-2">
            + Nouvelle conversation
          </button>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex flex-1 gap-0 rounded-2xl overflow-hidden border border-wood-200 shadow-sm min-h-0">
        {/* Sidebar conversations */}
        <div className="w-80 bg-white border-r border-wood-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-wood-100">
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-wood-50 transition-colors border-b border-wood-50 text-left ${selectedConv.id === conv.id ? 'bg-forest-50 border-l-4 border-l-forest-500' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-xl">
                    {conv.avatar}
                  </div>
                  {conv.unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold truncate ${conv.unread > 0 ? 'text-wood-900' : 'text-wood-700'}`}>
                      {conv.name}
                    </span>
                    <span className="text-xs text-wood-400 flex-shrink-0 ml-2">{conv.lastTime}</span>
                  </div>
                  {conv.zone && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeColors[conv.type]} mb-1 inline-block`}>
                      {conv.zone}
                    </span>
                  )}
                  <p className={`text-xs truncate ${conv.unread > 0 ? 'text-wood-700 font-medium' : 'text-wood-400'}`}>
                    {conv.lastSender !== 'Vous' ? `${conv.lastSender}: ` : ''}{conv.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat header */}
          <div className="bg-white border-b border-wood-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-xl">
                {selectedConv.avatar}
              </div>
              <div>
                <h2 className="font-semibold text-wood-900">{selectedConv.name}</h2>
                <p className="text-xs text-wood-500">
                  {selectedConv.type === 'GROUP'
                    ? `${selectedConv.participants.length} participants · ${selectedConv.zone || 'Groupe'}`
                    : 'Message direct'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-wood-100 text-wood-500 transition-colors" title="Appel">
                📞
              </button>
              <button className="p-2 rounded-lg hover:bg-wood-100 text-wood-500 transition-colors" title="Participants">
                👥
              </button>
              <button className="p-2 rounded-lg hover:bg-wood-100 text-wood-500 transition-colors" title="Paramètres">
                ⚙️
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Date separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-wood-200" />
              <span className="text-xs text-wood-400 px-3 py-1 bg-wood-100 rounded-full">Aujourd'hui</span>
              <div className="flex-1 h-px bg-wood-200" />
            </div>

            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                {!msg.isMe && (
                  <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-sm flex-shrink-0">
                    {msg.avatar}
                  </div>
                )}
                <div className={`max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!msg.isMe && (
                    <span className="text-xs text-wood-500 ml-1">{msg.sender}</span>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.type === 'ALERT'
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : msg.isMe
                        ? 'bg-forest-600 text-white rounded-br-sm'
                        : 'bg-white text-wood-800 shadow-sm rounded-bl-sm'
                  }`}>
                    {msg.type === 'ALERT' && <span className="mr-1">⚠️</span>}
                    {msg.content}
                  </div>
                  <span className="text-xs text-wood-400 mx-1">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="bg-white border-t border-wood-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-wood-100 text-wood-500 transition-colors" title="Joindre un fichier">
                📎
              </button>
              <button className="p-2 rounded-lg hover:bg-wood-100 text-wood-500 transition-colors" title="Emoji">
                😊
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`Message à ${selectedConv.name}...`}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  className="w-full px-4 py-2.5 text-sm border border-wood-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 bg-wood-50"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="p-2.5 rounded-xl bg-forest-600 text-white hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ➤
              </button>
            </div>
            <p className="text-xs text-wood-400 mt-2 ml-1">Appuyez sur Entrée pour envoyer · Maj+Entrée pour un saut de ligne</p>
          </div>
        </div>

        {/* Right panel — participants */}
        <div className="w-64 bg-white border-l border-wood-200 p-4 hidden xl:block">
          <h3 className="font-semibold text-wood-700 text-sm mb-4">Participants ({selectedConv.participants.length})</h3>
          <div className="space-y-3">
            {selectedConv.participants.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-sm">
                  {['👨‍💼', '👩‍🔬', '👩‍🎓', '📦', '👨‍⚕️'][i] || '👤'}
                </div>
                <div>
                  <p className="text-sm font-medium text-wood-800">{p}</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-wood-400">En ligne</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-wood-100">
            <h3 className="font-semibold text-wood-700 text-sm mb-3">Fichiers partagés</h3>
            <div className="space-y-2">
              {['Rapport_semaine.pdf', 'Planning_Mars.xlsx', 'Protocole_soins.docx'].map((f, i) => (
                <button key={i} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-wood-50 text-left transition-colors">
                  <span className="text-lg">{['📄', '📊', '📝'][i]}</span>
                  <span className="text-xs text-wood-600 truncate">{f}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
