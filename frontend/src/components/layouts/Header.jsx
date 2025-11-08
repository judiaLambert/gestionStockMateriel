import React, { useState } from 'react';
import { Bell, Menu, AlertTriangle } from 'lucide-react';

const Header = ({ sidebarOpen, setSidebarOpen, stockAlerts }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} >
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-bold text-green-700">Gestion de Stock - ENI</h1>
      </div>
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-full hover:bg-gray-100"
        >
          <Bell size={24} className="text-green-700" />
          {stockAlerts.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {stockAlerts.length}
            </span>
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg">Alertes Stock</h3>
            </div>
            {stockAlerts.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">Aucune alerte</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {stockAlerts.map((alert, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-orange-500 mt-1" size={20} />
                      <div>
                        <p className="font-semibold">{alert.materiel}</p>
                        <p className="text-sm text-gray-600">Stock: {alert.quantite} unités</p>
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
    </header>
  );
};

export default Header;