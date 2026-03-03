'use client';
import { useState } from 'react';

const mobileScreens = [
  {
    id: 'home',
    name: 'Accueil',
    icon: '🏠',
    content: (
      <div className="bg-gradient-to-b from-green-700 to-green-900 h-full flex flex-col">
        <div className="px-4 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🦜</span>
            <span className="text-white font-bold text-lg">LFTG Mobile</span>
          </div>
          <p className="text-green-200 text-xs">Bonjour, Marie L. · Soigneure</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-t-3xl px-4 pt-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { icon: '🐾', label: 'Mes animaux', count: 24, color: 'bg-blue-50 border-blue-100' },
              { icon: '🍽️', label: 'Repas du jour', count: '3/6', color: 'bg-green-50 border-green-100' },
              { icon: '🔔', label: 'Alertes', count: 2, color: 'bg-red-50 border-red-100' },
              { icon: '📋', label: 'Soins', count: 4, color: 'bg-purple-50 border-purple-100' },
            ].map((item) => (
              <div key={item.label} className={`${item.color} border rounded-xl p-3 text-center`}>
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-bold text-gray-800 text-lg">{item.count}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">PROCHAIN REPAS</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800 text-sm">Psittacidés</p>
                <p className="text-xs text-gray-500">Fruits frais + légumes</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">12:00</span>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-red-500 mb-1">⚠️ ALERTE</p>
            <p className="text-sm font-medium text-gray-800">Température élevée</p>
            <p className="text-xs text-gray-500">Serre Reptiles · 38.2°C</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'scan',
    name: 'Scanner QR',
    icon: '📷',
    content: (
      <div className="bg-gray-900 h-full flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 border-2 border-white rounded-2xl flex items-center justify-center mb-6">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
          <div className="text-4xl">🦜</div>
        </div>
        <p className="text-white text-sm font-medium mb-1">Scanner le QR code de l'animal</p>
        <p className="text-gray-400 text-xs text-center px-8">Pointez la caméra vers le QR code sur l'enclos ou la bague de l'animal</p>
        <div className="mt-6 bg-green-600 text-white px-6 py-2 rounded-full text-sm font-medium">
          Résultat : AM-042 — Ara Macao
        </div>
      </div>
    ),
  },
  {
    id: 'animal',
    name: 'Fiche Animal',
    icon: '🐾',
    content: (
      <div className="bg-white h-full overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl">🦜</div>
            <div>
              <h2 className="text-white font-bold text-lg">Ara Macao AM-042</h2>
              <p className="text-green-200 text-xs">Ara macao · ♂ Mâle · 7 ans</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Poids', value: '1.12 kg', icon: '⚖️' },
              { label: 'Enclos', value: 'Volière A', icon: '🏠' },
              { label: 'Dernier soin', value: 'il y a 2j', icon: '💊' },
              { label: 'Prochain repas', value: '12:00', icon: '🍽️' },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="font-bold text-gray-800 text-sm">{item.value}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-blue-600 mb-1">NOTE VÉTÉRINAIRE</p>
            <p className="text-xs text-gray-700">Comportement nuptial observé depuis 3 semaines. Surveiller la prise alimentaire.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-green-600 text-white py-2 rounded-xl text-sm font-medium">
              ✓ Repas effectué
            </button>
            <button className="bg-blue-600 text-white py-2 rounded-xl text-sm font-medium">
              + Ajouter soin
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: '🔔',
    content: (
      <div className="bg-gray-50 h-full overflow-y-auto">
        <div className="px-4 pt-8 pb-4">
          <h2 className="font-bold text-gray-900 text-lg">Notifications</h2>
        </div>
        <div className="space-y-2 px-4">
          {[
            { icon: '🔴', title: 'Température critique', desc: 'Serre Reptiles : 38.2°C (max 35°C)', time: 'il y a 30min', read: false },
            { icon: '🍽️', title: 'Repas en attente', desc: 'Dendrobatidés — 08:30 non effectué', time: 'il y a 2h', read: false },
            { icon: '💊', title: 'Traitement à administrer', desc: 'BC-001 — Antiparasitaire mensuel', time: 'il y a 4h', read: true },
            { icon: '🐣', title: 'Nouvelle naissance', desc: 'Dendrobates azureus — 3 têtards', time: 'il y a 1j', read: true },
            { icon: '📋', title: 'Rapport hebdomadaire', desc: 'Rapport de la semaine disponible', time: 'il y a 2j', read: true },
          ].map((notif, i) => (
            <div key={i} className={`rounded-xl p-3 ${notif.read ? 'bg-white border border-gray-100' : 'bg-white border-l-4 border-l-green-500 border border-gray-100'}`}>
              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">{notif.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notif.read ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>{notif.title}</p>
                  <p className="text-xs text-gray-500 truncate">{notif.desc}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function MobileAppPage() {
  const [activeScreen, setActiveScreen] = useState('home');
  const currentScreen = mobileScreens.find(s => s.id === activeScreen) || mobileScreens[0];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Mobile LFTG</h1>
          <p className="text-gray-500 text-sm mt-1">Simulateur Expo / React Native — iOS & Android</p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full border">
            📱 Expo SDK 50 · React Native 0.73
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Phone Simulator */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Phone frame */}
            <div className="w-72 h-[580px] bg-gray-900 rounded-[3rem] border-4 border-gray-800 shadow-2xl overflow-hidden relative">
              {/* Status bar */}
              <div className="bg-black h-8 flex items-center justify-between px-6">
                <span className="text-white text-xs font-medium">9:41</span>
                <div className="w-20 h-4 bg-black rounded-full border border-gray-700 flex items-center justify-center">
                  <div className="w-10 h-2 bg-gray-800 rounded-full"></div>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-white text-xs">●●●</span>
                  <span className="text-white text-xs">📶</span>
                  <span className="text-white text-xs">🔋</span>
                </div>
              </div>

              {/* Screen content */}
              <div className="h-[calc(100%-8rem)] overflow-hidden">
                {currentScreen.content}
              </div>

              {/* Bottom nav */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center">
                {mobileScreens.map((screen) => (
                  <button
                    key={screen.id}
                    onClick={() => setActiveScreen(screen.id)}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-2 ${activeScreen === screen.id ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <span className="text-lg">{screen.icon}</span>
                    <span className="text-[9px] font-medium">{screen.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Home indicator */}
            <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto mt-3"></div>
          </div>
        </div>

        {/* Features & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">📱 Fonctionnalités de l'app</h3>
            <div className="space-y-3">
              {[
                { icon: '📷', title: 'Scanner QR Code', desc: 'Identification instantanée des animaux par QR code ou NFC', status: 'done' },
                { icon: '🔔', title: 'Notifications push', desc: 'Alertes temps réel : repas, soins, alertes critiques', status: 'done' },
                { icon: '📋', title: 'Fiches animaux', desc: 'Consultation et mise à jour des données depuis le terrain', status: 'done' },
                { icon: '🌐', title: 'Mode hors-ligne', desc: 'Synchronisation différée — fonctionne sans connexion', status: 'done' },
                { icon: '🗺️', title: 'Carte GPS', desc: 'Visualisation des balises GPS sur carte interactive', status: 'in-progress' },
                { icon: '📸', title: 'Photos & vidéos', desc: 'Capture et annotation directe depuis l\'app', status: 'planned' },
              ].map((feat) => (
                <div key={feat.title} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{feat.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800 text-sm">{feat.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        feat.status === 'done' ? 'bg-green-100 text-green-700' :
                        feat.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {feat.status === 'done' ? '✓ Disponible' : feat.status === 'in-progress' ? '⏳ En cours' : '📅 Planifié'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">🛠️ Stack technique</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Framework', value: 'Expo SDK 50' },
                { label: 'UI', value: 'React Native 0.73' },
                { label: 'Navigation', value: 'Expo Router' },
                { label: 'State', value: 'Zustand' },
                { label: 'Offline', value: 'WatermelonDB' },
                { label: 'Push', value: 'Expo Notifications' },
                { label: 'QR Code', value: 'expo-barcode-scanner' },
                { label: 'Carte', value: 'react-native-maps' },
              ].map((tech) => (
                <div key={tech.label} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">{tech.label}</p>
                  <p className="text-sm font-medium text-gray-800">{tech.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-green-800 mb-2">📥 Téléchargement</h3>
            <div className="flex gap-3">
              <button className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                🍎 App Store
              </button>
              <button className="flex-1 bg-green-700 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                🤖 Google Play
              </button>
            </div>
            <p className="text-xs text-green-600 mt-2 text-center">Version 1.0.0 — Bêta privée</p>
          </div>
        </div>
      </div>
    </div>
  );
}
