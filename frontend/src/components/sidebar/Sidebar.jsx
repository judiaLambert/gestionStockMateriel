import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Truck, Package, Archive,
  User, FileText, Target, Wrench, TrendingUp, LogOut, Bell,
  Factory, Building2
} from 'lucide-react';
import logoENI from '../../assets/IMG-20250925-WA0000.jpg';

const Sidebar = ({ isOpen, setIsOpen, user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuSections = [
    {
      title: 'Vue d\'ensemble',
      items: [
        { path: '/dashboard', label: 'Tableau de Bord', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Entrées Matières',
      items: [
        { path: '/fournisseur', label: 'Fournisseurs', icon: Factory },
        { path: '/acquisition', label: 'Acquisitions', icon: ShoppingCart },
        { path: '/approvisionnement', label: 'Approvisionnements', icon: Truck }
      ]
    },
    {
      title: 'Patrimoine',
      items: [
        { path: '/materiel', label: 'Matériels', icon: Package },
        { path: '/inventaire', label: 'Inventaire', icon: Archive },
        { path: '/mouvement-stock', label: 'Mouvements Stock', icon: TrendingUp }
      ]
    },
    {
      title: 'Organisation',
      items: [
        { path: '/departement', label: 'Départements', icon: Building2 }
      ]
    },
    {
      title: 'Gestion des demandes',
      items: [
        { path: '/demandeur', label: 'Demandeurs', icon: User },
        { path: '/demande-materiel', label: 'Demandes Matériel', icon: FileText },
        { path: '/attribution', label: 'Attributions', icon: Target }
      ]
    },
    {
      title: 'Maintenance',
      items: [
        { path: '/depannage', label: 'Dépannages', icon: Wrench }
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    if (setUser) setUser(null);
    navigate('/login-admin');
    setIsOpen(false);
  };

  const demandesInscription = 3;

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-gradient-to-b from-gray-50 via-white to-gray-50 w-72 fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out flex flex-col shadow-2xl z-40 border-r border-gray-200`}
      >
        
        {/* Logo ENI + Titre */}
        <div className="flex-shrink-0 p-6 bg-gradient-to-r from-green-600 to-emerald-700 border-b border-green-800 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-xl p-2 shadow-xl">
              <img 
                src={logoENI} 
                alt="Logo ENI" 
                className="w-full h-full object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Comptabilité</h2>
              <p className="text-sm text-green-100">Matière - ENI</p>
            </div>
          </div>
        </div>

        {/* Bannière notification inscriptions */}
        {demandesInscription > 0 && (
          <Link
            to="/demandes-inscription"
            className="mx-3 mt-3 p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-white" />
                <span className="text-sm font-semibold text-white">Demandes d'inscription</span>
              </div>
              <span className="bg-white text-green-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                {demandesInscription}
              </span>
            </div>
          </Link>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg transform scale-105' 
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-800'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={20} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bouton déconnexion */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
