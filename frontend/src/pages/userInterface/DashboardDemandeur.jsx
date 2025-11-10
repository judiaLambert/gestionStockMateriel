import React, { useState, useEffect } from 'react';
import { 
  Plus, Clock, CheckCircle, XCircle, X, LogOut, User, 
  Calendar, Package, FileText, Wrench, ChevronRight, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDemandesByDemandeur, addDemande } from '../../api/demandematerielAPI';
import { getMateriels } from '../../api/materielAPI';
import { getDemandeurByUserId } from '../../api/demandeurAPI';

const DashboardDemandeur = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home'); // home, demandes, stats
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('demande'); // demande ou signalement
  
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    approuvees: 0,
    refusees: 0
  });
  
  const [formData, setFormData] = useState({
    raison_demande: '',
    details: [{ id_materiel: '', quantite_demander: 1 }]
  });
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchDemandes(userObj.id_utilisateur || userObj.id);
      fetchMateriels();
    }
  }, []);

  const fetchDemandes = async (userId) => {
    try {
      const demandeurResponse = await getDemandeurByUserId(userId);
      const response = await getDemandesByDemandeur(demandeurResponse.data.id_demandeur);
      const demandesData = response.data.data || response.data || [];
      setDemandes(demandesData);
      calculateStats(demandesData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMateriels = async () => {
    try {
      const response = await getMateriels();
      setMateriels(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      enAttente: data.filter(d => d.statut === 'en_attente').length,
      approuvees: data.filter(d => d.statut === 'approuvee').length,
      refusees: data.filter(d => d.statut === 'refusee').length
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login-demandeur');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = user.id_utilisateur || user.id;
      const demandeurResponse = await getDemandeurByUserId(userId);
      
      await addDemande({
        id_demandeur: demandeurResponse.data.id_demandeur,
        raison_demande: formData.raison_demande,
        details: formData.details.filter(d => d.id_materiel && d.quantite_demander > 0)
      });
      
      setFormData({ raison_demande: '', details: [{ id_materiel: '', quantite_demander: 1 }] });
      setShowModal(false);
      fetchDemandes(userId);
      alert('✅ Demande créée avec succès');
    } catch (error) {
      alert('❌ Erreur lors de la création');
    }
  };

  const getStatusConfig = (statut) => {
    const configs = {
      approuvee: { icon: CheckCircle, text: 'Approuvée', color: 'text-green-600' },
      refusee: { icon: XCircle, text: 'Refusée', color: 'text-gray-600' },
      en_attente: { icon: Clock, text: 'En attente', color: 'text-blue-600' }
    };
    return configs[statut] || configs.en_attente;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      
      {/* HEADER UNIQUE */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">ENI</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Comptabilité Matière</h1>
                <p className="text-xs text-gray-500">École Nationale d'Informatique</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">{user?.nom}</p>
                <p className="text-xs text-gray-500">Demandeur</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* VUE ACCUEIL */}
        {currentView === 'home' && (
          <div className="space-y-6">
            
            {/* Message de bienvenue */}
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bonjour {user?.nom} ! 👋
              </h2>
              <p className="text-gray-600">
                Que souhaitez-vous faire aujourd'hui ?
              </p>
            </div>

            {/* Actions principales */}
            <div className="grid md:grid-cols-2 gap-4">
              
              {/* Faire une demande */}
              <button
                onClick={() => {
                  setModalType('demande');
                  setShowModal(true);
                }}
                className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <Package size={24} className="text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <ChevronRight size={24} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Demande de Matériel</h3>
                <p className="text-sm text-gray-600">Faire une nouvelle demande de matériel informatique</p>
              </button>

              {/* Signaler une panne */}
              <button
                onClick={() => {
                  setModalType('signalement');
                  setShowModal(true);
                }}
                className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Wrench size={24} className="text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <ChevronRight size={24} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Signaler une Panne</h3>
                <p className="text-sm text-gray-600">Signaler un problème ou une panne de matériel</p>
              </button>
            </div>

            {/* Accès rapide */}
            <div className="grid md:grid-cols-2 gap-4">
              
              <button
                onClick={() => setCurrentView('demandes')}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={20} className="text-gray-600" />
                      <h4 className="font-semibold text-gray-900">Mes Demandes</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </button>

              <button
                onClick={() => setCurrentView('stats')}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 size={20} className="text-gray-600" />
                      <h4 className="font-semibold text-gray-900">Statistiques</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.enAttente}</p>
                    <p className="text-xs text-gray-500">en attente</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* VUE DEMANDES */}
        {currentView === 'demandes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('home')}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                ← Retour
              </button>
              <h2 className="text-xl font-bold text-gray-900">Mes Demandes</h2>
              <div className="w-20"></div>
            </div>

            {demandes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucune demande pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {demandes.map((demande) => {
                  const status = getStatusConfig(demande.statut);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={demande.id_demande} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">{demande.raison_demande}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{new Date(demande.date_demande).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                          <StatusIcon size={14} />
                          {status.text}
                        </span>
                      </div>

                      {demande.detailDemandes?.length > 0 && (
                        <div className="bg-gray-50 rounded p-2 mt-2">
                          <p className="text-xs text-gray-600 mb-1">Matériels:</p>
                          {demande.detailDemandes.map((detail) => (
                            <div key={detail.id_detail} className="flex justify-between text-xs">
                              <span className="text-gray-700">{detail.materiel?.designation}</span>
                              <span className="text-gray-500">x{detail.quantite_demander}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VUE STATS */}
        {currentView === 'stats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('home')}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                ← Retour
              </button>
              <h2 className="text-xl font-bold text-gray-900">Statistiques</h2>
              <div className="w-20"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">En attente</p>
                <p className="text-3xl font-bold text-blue-600">{stats.enAttente}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Approuvées</p>
                <p className="text-3xl font-bold text-green-600">{stats.approuvees}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Refusées</p>
                <p className="text-3xl font-bold text-gray-600">{stats.refusees}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            
            <div className="p-5 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {modalType === 'demande' ? 'Nouvelle Demande' : 'Signaler une Panne'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {modalType === 'demande' ? 'Raison' : 'Description du problème'}
                </label>
                <textarea
                  value={formData.raison_demande}
                  onChange={(e) => setFormData(prev => ({ ...prev, raison_demande: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
                  rows="3"
                  required
                />
              </div>
              
              {modalType === 'demande' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Matériels</label>
                  {formData.details.map((detail, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select 
                        value={detail.id_materiel}
                        onChange={(e) => {
                          const updated = [...formData.details];
                          updated[index].id_materiel = e.target.value;
                          setFormData(prev => ({ ...prev, details: updated }));
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        required
                      >
                        <option value="">Sélectionner...</option>
                        {materiels.map(m => (
                          <option key={m.id} value={m.id}>{m.designation}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={detail.quantite_demander}
                        onChange={(e) => {
                          const updated = [...formData.details];
                          updated[index].quantite_demander = parseInt(e.target.value) || 1;
                          setFormData(prev => ({ ...prev, details: updated }));
                        }}
                        className="w-16 px-2 py-2 border rounded-lg text-sm text-center outline-none"
                        min="1"
                        required
                      />
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      details: [...prev.details, { id_materiel: '', quantite_demander: 1 }]
                    }))}
                    className="text-green-600 text-xs font-semibold"
                  >
                    + Ajouter
                  </button>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardDemandeur;
