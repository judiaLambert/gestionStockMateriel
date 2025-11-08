import React from 'react';
import { Package, FileText, AlertTriangle, Wrench } from 'lucide-react';

const Dashboard = ({ stockAlerts }) => {
  const stats = [
    { title: 'Total Matériel', value: '245', icon: <Package size={40} />, color: 'bg-blue-500' },
    { title: 'Demandes en attente', value: '12', icon: <FileText size={40} />, color: 'bg-orange-500' },
    { title: 'Alertes Stock', value: stockAlerts.length, icon: <AlertTriangle size={40} />, color: 'bg-red-500' },
    { title: 'Dépannages actifs', value: '5', icon: <Wrench size={40} />, color: 'bg-green-500' }
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Alertes Stock Critique</h3>
          <div className="space-y-3">
            {stockAlerts.slice(0, 5).map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-orange-500" size={20} />
                  <div>
                    <p className="font-semibold">{alert.materiel}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                </div>
                <span className="font-bold text-orange-600">{alert.quantite}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Activités Récentes</h3>
          <div className="space-y-3">
            {[
              { action: 'Nouvelle demande', user: 'Jean Dupont', time: 'Il y a 5 min' },
              { action: 'Matériel ajouté', user: 'Marie Martin', time: 'Il y a 1 heure' },
              { action: 'Dépannage terminé', user: 'Pierre Durand', time: 'Il y a 2 heures' },
              { action: 'Approvisionnement reçu', user: 'Sophie Bernard', time: 'Il y a 3 heures' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;