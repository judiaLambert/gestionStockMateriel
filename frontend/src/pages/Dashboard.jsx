import React from 'react';
import { 
  Package, FileText, AlertTriangle, Wrench, 
  TrendingUp, Clock, CheckCircle, Activity 
} from 'lucide-react';

const Dashboard = ({ stockAlerts }) => {
  const stats = [
    { 
      title: 'Total Matériel', 
      value: '245', 
      icon: Package, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      change: '+12%'
    },
    { 
      title: 'Demandes en attente', 
      value: '12', 
      icon: FileText, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      change: '+3'
    },
    { 
      title: 'Alertes Stock', 
      value: stockAlerts.length, 
      icon: AlertTriangle, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      change: 'Urgent'
    },
    { 
      title: 'Dépannages actifs', 
      value: '5', 
      icon: Wrench, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      change: '-2'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600 text-sm">Vue d'ensemble de la comptabilité matière</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Dernière mise à jour</p>
          <p className="text-sm font-semibold text-gray-900">
            {new Date().toLocaleString('fr-FR', { 
              day: '2-digit', 
              month: 'long', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>

      {/* Statistiques Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={stat.textColor} size={24} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 ${stat.bgColor} ${stat.textColor} rounded-full`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alertes Stock (2 colonnes) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Alertes Stock Critique</h3>
                <p className="text-xs text-gray-500">Matériels nécessitant un réapprovisionnement</p>
              </div>
            </div>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
              {stockAlerts.length} alertes
            </span>
          </div>
          
          <div className="space-y-3">
            {stockAlerts.slice(0, 5).map((alert, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="text-red-600" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{alert.materiel}</p>
                    <p className="text-sm text-gray-600 truncate">{alert.message}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-red-600">{alert.quantite}</p>
                  <p className="text-xs text-gray-500">unités</p>
                </div>
              </div>
            ))}
          </div>

          {stockAlerts.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
              <p className="text-gray-500">Aucune alerte stock</p>
              <p className="text-sm text-gray-400">Tous les stocks sont au niveau optimal</p>
            </div>
          )}
        </div>

        {/* Activités Récentes (1 colonne) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Activités</h3>
              <p className="text-xs text-gray-500">En temps réel</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { 
                action: 'Nouvelle demande', 
                user: 'Jean Dupont', 
                time: 'Il y a 5 min',
                icon: FileText,
                color: 'blue'
              },
              { 
                action: 'Matériel ajouté', 
                user: 'Marie Martin', 
                time: 'Il y a 1h',
                icon: Package,
                color: 'green'
              },
              { 
                action: 'Dépannage terminé', 
                user: 'Pierre Durand', 
                time: 'Il y a 2h',
                icon: Wrench,
                color: 'purple'
              },
              { 
                action: 'Approvisionnement', 
                user: 'Sophie Bernard', 
                time: 'Il y a 3h',
                icon: TrendingUp,
                color: 'orange'
              }
            ].map((activity, index) => {
              const Icon = activity.icon;
              const colors = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600'
              };
              
              return (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-9 h-9 ${colors[activity.color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.user}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                    <Clock size={12} />
                    {activity.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
