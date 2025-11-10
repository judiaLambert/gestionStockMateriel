import React, { useState } from 'react';
import { Bell, Menu, X, AlertTriangle, User, ChevronDown } from 'lucide-react';

const Header = ({ sidebarOpen, setSidebarOpen, stockAlerts, user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 shadow-lg p-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Bouton Menu Toggle - Visible tout le temps */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/10"
          title={sidebarOpen ? "Masquer le menu" : "Afficher le menu"}
        >
          {sidebarOpen ? (
            <X size={24} className="text-white" />
          ) : (
            <Menu size={24} className="text-white" />
          )}
        </button>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-white leading-tight">
              Comptabilité Matière
            </h1>
            <p className="text-green-100 text-xs">École Nationale d'Informatique</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Info utilisateur */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/10"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-md">
              <User size={18} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-white text-sm font-semibold">{user?.nom}</p>
              <p className="text-green-100 text-xs capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={16} className="text-white" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slideIn">
              <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <p className="text-sm font-bold text-gray-900">{user?.nom}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-2">
                <User size={16} />
                Mon profil
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/10"
          >
            <Bell size={20} className="text-white" />
            {stockAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse shadow-lg">
                {stockAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-hidden animate-slideIn">
              <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="font-bold text-green-900 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-600" />
                  Alertes Stock
                </h3>
              </div>
              {stockAlerts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-3">✓</div>
                  <p className="text-gray-500">Aucune alerte</p>
                </div>
              ) : (
                <div className="divide-y max-h-80 overflow-y-auto">
                  {stockAlerts.map((alert, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <AlertTriangle className="text-orange-600" size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{alert.materiel}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Stock: <span className="font-bold text-orange-600">{alert.quantite}</span> unités
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
