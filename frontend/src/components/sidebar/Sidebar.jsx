import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen, user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/materiel', label: 'Matériels', icon: '💻' },
    { path: '/type-materiel', label: 'Types Matériel', icon: '📋' },
    { path: '/etat-materiel', label: 'États Matériel', icon: '🔧' },
    { path: '/demande-materiel', label: 'Demandes', icon: '📝' },
    { path: '/detail-demande', label: 'Détails Demandes', icon: '📄' },
    { path: '/departement', label: 'Départements', icon: '🏢' },
    { path: '/type-departement', label: 'Types Département', icon: '🏛️' },
    { path: '/demandeur', label: 'Demandeurs', icon: '👤' },
    { path: '/depannage', label: 'Dépannages', icon: '🔧' },
    { path: '/fournisseur', label: 'Fournisseurs', icon: '🏭' },
    { path: '/acquisition', label: 'Acquisitions', icon: '💰' },
    { path: '/approvisionnement', label: 'Approvisionnements', icon: '📦' },
    { path: '/detail-approvisionnement', label: 'Détails Appro', icon: '📑' },
    { path: '/inventaire', label: 'Inventaire', icon: '📋' },
    { path: '/mouvement-stock', label: 'Mouvements Stock', icon: '🔄' },
    { path: '/attribution', label: 'Attributions', icon: '🎯' },
    
    { path: '/demandes-inscription', label: 'Demandes Inscription', icon: '📨' }
  ];

  const handleLogout = () => {
    // 1. Supprimer les données de session
    localStorage.removeItem('user');
    
    // 2. Mettre à jour l'état global
    if (setUser) {
      setUser(null);
    }
    
    // 3. Rediriger vers la page de login
    navigate('/login');
    
    // 4. Fermer la sidebar sur mobile
    setIsOpen(false);
    
    console.log('✅ Déconnexion réussie');
  };

  return (
    <div className={`bg-gray-800 text-white w-64 absolute inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out flex flex-col`}>
      
      {/* En-tête fixe */}
      <div className="flex-shrink-0 py-7 px-4 border-b border-gray-700">
        <div className="text-white flex items-center space-x-2">
          <span className="text-2xl font-bold">StockMateriel</span>
        </div>
      </div>

      {/* Navigation avec scroll */}
      <div className="flex-1 overflow-y-auto">
        <nav className="py-4 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white mb-1 ${
                location.pathname === item.path ? 'bg-gray-900 text-white' : 'text-gray-300'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Pied de page fixe */}
      <div className="flex-shrink-0 border-t border-gray-700 pt-4">
        {/* Info utilisateur */}
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-300 font-medium truncate">{user?.prenom} {user?.nom}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>

        {/* Bouton de déconnexion */}
        <div className="px-2 pb-4">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200 flex items-center justify-center"
          >
            <span className="mr-2">🚪</span>
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;