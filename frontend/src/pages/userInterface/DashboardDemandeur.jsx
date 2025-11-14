import React, { useState, useEffect } from 'react';
import { 
  Plus, Clock, CheckCircle, XCircle, X, LogOut, User, 
  Calendar, Package, FileText, Wrench, ChevronRight, BarChart3,
  TrendingUp, Bell, Sparkles, Activity, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { showSuccess, showError, showConfirm } from '../../alerts.jsx';
import { getDemandesByDemandeur, addDemande } from '../../api/demandematerielAPI';
import { getMateriels } from '../../api/materielAPI';
import { getDemandeurByUserId } from '../../api/demandeurAPI';
import { signalerPanne, getDepannagesByDemandeur } from '../../api/depannageAPI';
import Loading from '../../components/Loading.jsx';
import logoENI from '../../assets/IMG-20250925-WA0000.jpg';

const DashboardDemandeur = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [depannages, setDepannages] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('demande');
  
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    approuvees: 0,
    refusees: 0
  });

  const [statsDepannages, setStatsDepannages] = useState({
    total: 0,
    signale: 0,
    enCours: 0,
    resolu: 0
  });
  
  const [formData, setFormData] = useState({
    raison_demande: '',
    type_possession: 'temporaire',
    date_retour: '',
    details: [{ id_materiel: '', quantite_demander: 1 }]
  });

  const [formSignalement, setFormSignalement] = useState({
    id_materiel: '',
    description_panne: ''
  });
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchDemandes(userObj.id_utilisateur || userObj.id);
      fetchDepannages(userObj.id_utilisateur || userObj.id);
      fetchMateriels();
      
      // Vérifier les notifications toutes les 30 secondes
      const interval = setInterval(() => {
        checkNotifications(userObj.id_utilisateur || userObj.id);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, []);

  const checkNotifications = async (userId) => {
    try {
      const demandeurResponse = await getDemandeurByUserId(userId);
      const demandeurId = demandeurResponse.data.id_demandeur;
      
      // Notifications pour les demandes
      const demandesResponse = await getDemandesByDemandeur(demandeurId);
      const demandesData = demandesResponse.data.data || demandesResponse.data || [];
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      demandesData.forEach(demande => {
        const demandeDate = new Date(demande.date_demande);
        if (demandeDate > yesterday) {
          if (demande.statut === 'approuvee') {
            toast.success(
              <div>
                <p className="font-bold">Demande approuvée ! ✅</p>
                <p className="text-sm">{demande.raison_demande}</p>
              </div>,
              { duration: 5000, icon: '🎉' }
            );
          } else if (demande.statut === 'refusee') {
            toast.error(
              <div>
                <p className="font-bold">Demande refusée ❌</p>
                <p className="text-sm">{demande.raison_demande}</p>
                {demande.motif_refus && (
                  <p className="text-xs mt-1">Motif: {demande.motif_refus}</p>
                )}
              </div>,
              { duration: 5000 }
            );
          }
        }
      });

      // Notifications pour les dépannages
      const depannagesResponse = await getDepannagesByDemandeur(demandeurId);
      const depannagesData = depannagesResponse.data || [];
      
      depannagesData.forEach(depannage => {
        const depannageDate = new Date(depannage.date_signalement);
        if (depannageDate > yesterday) {
          if (depannage.statut_depannage === 'Résolu') {
            toast.success(
              <div>
                <p className="font-bold">🎉 Matériel réparé !</p>
                <p className="text-sm">{depannage.materiel?.designation}</p>
                <p className="text-xs text-gray-600 mt-1">Votre matériel est prêt</p>
              </div>,
              { duration: 6000, icon: '🔧' }
            );
          } else if (depannage.statut_depannage === 'En cours') {
            toast(
              <div>
                <p className="font-bold">⚙️ Réparation en cours</p>
                <p className="text-sm">{depannage.materiel?.designation}</p>
                <p className="text-xs text-gray-600 mt-1">Nous travaillons dessus</p>
              </div>,
              { duration: 4000, icon: '🔧' }
            );
          } else if (depannage.statut_depannage === 'Irréparable') {
            toast.error(
              <div>
                <p className="font-bold">❌ Matériel irréparable</p>
                <p className="text-sm">{depannage.materiel?.designation}</p>
                <p className="text-xs text-gray-600 mt-1">Contactez le service</p>
              </div>,
              { duration: 6000 }
            );
          }
        }
      });
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  };

  const fetchDemandes = async (userId) => {
    try {
      const demandeurResponse = await getDemandeurByUserId(userId);
      const response = await getDemandesByDemandeur(demandeurResponse.data.id_demandeur);
      const demandesData = response.data.data || response.data || [];
      setDemandes(demandesData);
      calculateStats(demandesData);
    } catch (error) {
      console.error(error);
      showError('Impossible de charger les demandes');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepannages = async (userId) => {
    try {
      const demandeurResponse = await getDemandeurByUserId(userId);
      const response = await getDepannagesByDemandeur(demandeurResponse.data.id_demandeur);
      const depannagesData = response.data || [];
      setDepannages(depannagesData);
      calculateStatsDepannages(depannagesData);
    } catch (error) {
      console.error('Erreur chargement dépannages:', error);
    }
  };

  const fetchMateriels = async () => {
    try {
      const response = await getMateriels();
      setMateriels(response.data.data || response.data || []);
    } catch (error) {
      console.error(error);
      showError('Impossible de charger les matériels');
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

  const calculateStatsDepannages = (data) => {
    setStatsDepannages({
      total: data.length,
      signale: data.filter(d => d.statut_depannage === 'Signalé').length,
      enCours: data.filter(d => d.statut_depannage === 'En cours').length,
      resolu: data.filter(d => d.statut_depannage === 'Résolu').length
    });
  };

  const handleLogout = () => {
    showConfirm(
      'Voulez-vous vraiment vous déconnecter ?',
      () => {
        localStorage.removeItem('user');
        navigate('/login-demandeur');
        showSuccess('Déconnexion réussie !');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (modalType === 'signalement') {
      // Gestion du signalement de panne
      try {
        const userId = user.id_utilisateur || user.id;
        const demandeurResponse = await getDemandeurByUserId(userId);
        
        await signalerPanne({
          id_materiel: formSignalement.id_materiel,
          id_demandeur: demandeurResponse.data.id_demandeur,
          description_panne: formSignalement.description_panne
        });
        
        setFormSignalement({ id_materiel: '', description_panne: '' });
        setShowModal(false);
        fetchDepannages(userId);
        
        toast.success(
          <div>
            <p className="font-bold">🔧 Panne signalée !</p>
            <p className="text-sm">Notre équipe va examiner votre demande</p>
          </div>,
          { duration: 4000 }
        );
      } catch (error) {
        console.error(error);
        showError('Erreur lors du signalement');
      }
    } else {
      // Gestion de la demande de matériel
      if (formData.type_possession === 'temporaire' && !formData.date_retour) {
        showError('Veuillez indiquer une date de retour pour une possession temporaire');
        return;
      }
      
      try {
        const userId = user.id_utilisateur || user.id;
        const demandeurResponse = await getDemandeurByUserId(userId);
        
        await addDemande({
          id_demandeur: demandeurResponse.data.id_demandeur,
          raison_demande: formData.raison_demande,
          type_possession: formData.type_possession,
          date_retour: formData.type_possession === 'definitive' ? null : formData.date_retour,
          details: formData.details.filter(d => d.id_materiel && d.quantite_demander > 0)
        });
        
        setFormData({ 
          raison_demande: '', 
          type_possession: 'temporaire',
          date_retour: '',
          details: [{ id_materiel: '', quantite_demander: 1 }] 
        });
        setShowModal(false);
        fetchDemandes(userId);
        showSuccess('Demande créée avec succès !');
      } catch (error) {
        console.error(error);
        showError('Erreur lors de l\'envoi de la demande');
      }
    }
  };

  const getStatusConfig = (statut) => {
    const configs = {
      approuvee: { icon: CheckCircle, text: 'Approuvée', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      refusee: { icon: XCircle, text: 'Refusée', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
      en_attente: { icon: Clock, text: 'En attente', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
    };
    return configs[statut] || configs.en_attente;
  };

  const getDepannageStatusConfig = (statut) => {
    const configs = {
      'Signalé': { icon: AlertTriangle, text: 'Signalé', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
      'En cours': { icon: Wrench, text: 'En cours', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      'Résolu': { icon: CheckCircle, text: 'Résolu', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
      'Irréparable': { icon: XCircle, text: 'Irréparable', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    };
    return configs[statut] || configs['Signalé'];
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-sm opacity-50"></div>
                <div className="relative w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2">
                  <img src={logoENI} alt="ENI Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Comptabilité Matière
                </h1>
                <p className="text-xs text-gray-600">École Nationale d'Informatique</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                {(stats.enAttente + statsDepannages.signale) > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {stats.enAttente + statsDepannages.signale}
                  </span>
                )}
              </button>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.nom?.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{user?.nom}</p>
                  <p className="text-xs text-gray-600">Demandeur</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-xl transition-colors group"
                title="Déconnexion"
              >
                <LogOut size={20} className="text-gray-600 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* VUE ACCUEIL */}
        {currentView === 'home' && (
          <div className="space-y-6">
            
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
              
              <div className="relative px-8 py-12">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                      <h2 className="text-4xl font-bold text-white">
                        Bonjour {user?.nom} ! 👋
                      </h2>
                    </div>
                    <p className="text-xl text-green-50 mb-6">
                      Bienvenue sur votre espace personnel
                    </p>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-white">{stats.total}</p>
                          <p className="text-sm text-green-100">Demandes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-white">{statsDepannages.total}</p>
                          <p className="text-sm text-green-100">Signalements</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden lg:block">
                    <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <User className="w-24 h-24 text-white/60" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Principales */}
            <div className="grid sm:grid-cols-2 gap-6">
              
              <button
                onClick={() => {
                  setModalType('demande');
                  setShowModal(true);
                }}
                className="group relative overflow-hidden bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-green-400 hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Package size={32} className="text-white" />
                    </div>
                    <ChevronRight size={28} className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Demande de Matériel</h3>
                  <p className="text-gray-600">Demandez du matériel informatique en quelques clics</p>
                  
                  <div className="mt-6 flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">Rapide</span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">Simple</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setModalType('signalement');
                  setShowModal(true);
                }}
                className="group relative overflow-hidden bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-orange-400 hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Wrench size={32} className="text-white" />
                    </div>
                    <ChevronRight size={28} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Signaler une Panne</h3>
                  <p className="text-gray-600">Déclarez un problème ou une panne de matériel</p>
                  
                  <div className="mt-6 flex items-center gap-2">
                    <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-semibold">24/7</span>
                    <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-semibold">Prioritaire</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Navigation Rapide */}
            <div className="grid sm:grid-cols-3 gap-4">
              <button
                onClick={() => setCurrentView('demandes')}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText size={28} className="text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">Mes Demandes</h4>
                      <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setCurrentView('depannages')}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wrench size={28} className="text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">Dépannages</h4>
                      <p className="text-3xl font-bold text-orange-600">{statsDepannages.total}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-400 group-hover:text-orange-600 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setCurrentView('stats')}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BarChart3 size={28} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">Stats</h4>
                      <p className="text-2xl font-bold text-blue-600">{stats.approuvees} OK</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* VUE DEPANNAGES */}
        {currentView === 'depannages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">Retour</span>
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Mes Signalements</h2>
              <div className="w-24"></div>
            </div>

            {depannages.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wrench className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun signalement</h3>
                <p className="text-gray-600 mb-6">Signalez une panne de matériel</p>
                <button
                  onClick={() => {
                    setModalType('signalement');
                    setShowModal(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Signaler une panne
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {depannages.map((depannage) => {
                  const status = getDepannageStatusConfig(depannage.statut_depannage);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={depannage.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Wrench className="text-orange-600" size={20} />
                            <h3 className="text-lg font-bold text-gray-900">{depannage.materiel?.designation}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{new Date(depannage.date_signalement).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{depannage.description_panne}</p>
                        </div>
                        <span className={`flex items-center gap-2 px-4 py-2 ${status.bg} ${status.color} rounded-xl font-semibold border ${status.border}`}>
                          <StatusIcon size={16} />
                          {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VUE DEMANDES */}
        {currentView === 'demandes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">Retour</span>
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Mes Demandes</h2>
              <div className="w-24"></div>
            </div>

            {demandes.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucune demande</h3>
                <p className="text-gray-600 mb-6">Commencez par créer votre première demande</p>
                <button
                  onClick={() => {
                    setModalType('demande');
                    setShowModal(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Créer une demande
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {demandes.map((demande) => {
                  const status = getStatusConfig(demande.statut);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={demande.id_demande} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{demande.raison_demande}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{new Date(demande.date_demande).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              demande.type_possession === 'definitive' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {demande.type_possession === 'definitive' ? '🔒 Définitive' : '⏱️ Temporaire'}
                            </span>
                          </div>
                          {demande.date_retour && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <Clock size={12} />
                              <span>Retour prévu: {new Date(demande.date_retour).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}
                        </div>
                        <span className={`flex items-center gap-2 px-4 py-2 ${status.bg} ${status.color} rounded-xl font-semibold border ${status.border}`}>
                          <StatusIcon size={16} />
                          {status.text}
                        </span>
                      </div>

                      {demande.motif_refus && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs font-semibold text-red-700 mb-1">Motif du refus:</p>
                          <p className="text-sm text-red-600">{demande.motif_refus}</p>
                        </div>
                      )}

                      {demande.detailDemandes?.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Matériels demandés:</p>
                          <div className="space-y-2">
                            {demande.detailDemandes.map((detail) => (
                              <div key={detail.id_detail} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                <span className="text-sm text-gray-900 font-medium">{detail.materiel?.designation}</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                  x{detail.quantite_demander}
                                </span>
                              </div>
                            ))}
                          </div>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">Retour</span>
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Statistiques</h2>
              <div className="w-24"></div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <FileText size={40} className="opacity-80" />
                  <TrendingUp size={32} className="opacity-60" />
                </div>
                <p className="text-purple-100 text-sm font-medium mb-2">Total Demandes</p>
                <p className="text-6xl font-bold mb-2">{stats.total}</p>
                <p className="text-purple-200 text-sm">Depuis le début</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <Clock size={40} className="opacity-80" />
                  <Activity size={32} className="opacity-60" />
                </div>
                <p className="text-blue-100 text-sm font-medium mb-2">En Attente</p>
                <p className="text-6xl font-bold mb-2">{stats.enAttente}</p>
                <p className="text-blue-200 text-sm">En cours de traitement</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <CheckCircle size={40} className="opacity-80" />
                  <Sparkles size={32} className="opacity-60" />
                </div>
                <p className="text-green-100 text-sm font-medium mb-2">Approuvées</p>
                <p className="text-6xl font-bold mb-2">{stats.approuvees}</p>
                <p className="text-green-200 text-sm">Demandes validées</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <XCircle size={40} className="opacity-80" />
                  <Activity size={32} className="opacity-60" />
                </div>
                <p className="text-red-100 text-sm font-medium mb-2">Refusées</p>
                <p className="text-6xl font-bold mb-2">{stats.refusees}</p>
                <p className="text-red-200 text-sm">Demandes non validées</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <Wrench size={40} className="opacity-80" />
                  <AlertTriangle size={32} className="opacity-60" />
                </div>
                <p className="text-orange-100 text-sm font-medium mb-2">Pannes signalées</p>
                <p className="text-6xl font-bold mb-2">{statsDepannages.signale}</p>
                <p className="text-orange-200 text-sm">En attente de réparation</p>
              </div>

              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <CheckCircle size={40} className="opacity-80" />
                  <Wrench size={32} className="opacity-60" />
                </div>
                <p className="text-teal-100 text-sm font-medium mb-2">Réparations</p>
                <p className="text-6xl font-bold mb-2">{statsDepannages.resolu}</p>
                <p className="text-teal-200 text-sm">Matériels réparés</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="px-8 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {modalType === 'demande' ? '📦 Nouvelle Demande' : '🔧 Signaler une Panne'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
              {modalType === 'signalement' ? (
                <>
                  {/* FORMULAIRE DE SIGNALEMENT */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Matériel concerné *
                    </label>
                    <select
                      value={formSignalement.id_materiel}
                      onChange={(e) => setFormSignalement(prev => ({ ...prev, id_materiel: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Choisir un matériel</option>
                      {materiels.map((materiel) => (
                        <option key={materiel.id} value={materiel.id}>
                          {materiel.designation} - {materiel.marque}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Description du problème *
                    </label>
                    <textarea
                      value={formSignalement.description_panne}
                      onChange={(e) => setFormSignalement(prev => ({ ...prev, description_panne: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                      rows="5"
                      placeholder="Décrivez le problème rencontré en détail..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Plus votre description est précise, plus vite nous pourrons intervenir
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-sm font-semibold text-orange-900 mb-1">
                          Information importante
                        </p>
                        <p className="text-xs text-orange-800">
                          Notre équipe technique sera notifiée immédiatement. Vous recevrez une notification 
                          lorsque le statut de votre signalement évoluera.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* FORMULAIRE DE DEMANDE */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Raison de la demande *
                    </label>
                    <textarea
                      value={formData.raison_demande}
                      onChange={(e) => setFormData(prev => ({ ...prev, raison_demande: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                      rows="4"
                      placeholder="Décrivez votre besoin..."
                      required
                    />
                  </div>
                  
                  {/* TYPE DE POSSESSION */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Type de possession *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type_possession: 'temporaire' }))}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.type_possession === 'temporaire'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Clock className={formData.type_possession === 'temporaire' ? 'text-blue-600' : 'text-gray-400'} size={24} />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.type_possession === 'temporaire' ? 'border-blue-500' : 'border-gray-300'
                          }`}>
                            {formData.type_possession === 'temporaire' && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 text-left">Temporaire</p>
                        <p className="text-xs text-gray-600 text-left mt-1">À retourner après usage</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type_possession: 'definitive', date_retour: '' }))}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.type_possession === 'definitive'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Package className={formData.type_possession === 'definitive' ? 'text-purple-600' : 'text-gray-400'} size={24} />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.type_possession === 'definitive' ? 'border-purple-500' : 'border-gray-300'
                          }`}>
                            {formData.type_possession === 'definitive' && (
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 text-left">Définitive</p>
                        <p className="text-xs text-gray-600 text-left mt-1">Pas de retour prévu</p>
                      </button>
                    </div>
                  </div>

                  {/* DATE DE RETOUR */}
                  {formData.type_possession === 'temporaire' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Date de retour prévue *
                      </label>
                      <input
                        type="date"
                        value={formData.date_retour}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_retour: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        ℹ️ Indiquez la date à laquelle vous prévoyez de retourner le matériel
                      </p>
                    </div>
                  )}

                  {/* MATÉRIELS */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Matériels souhaités</label>
                    <div className="space-y-3">
                      {formData.details.map((detail, index) => (
                        <div key={index} className="flex gap-3">
                          <select 
                            value={detail.id_materiel}
                            onChange={(e) => {
                              const updated = [...formData.details];
                              updated[index].id_materiel = e.target.value;
                              setFormData(prev => ({ ...prev, details: updated }));
                            }}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            required
                          >
                            <option value="">Choisir un matériel</option>
                            {materiels.map((materiel) => (
                              <option key={materiel.id} value={materiel.id}>
                                {materiel.designation}
                              </option>
                            ))}
                          </select>
                          
                          <input
                            type="number"
                            min="1"
                            value={detail.quantite_demander}
                            onChange={(e) => {
                              const updated = [...formData.details];
                              updated[index].quantite_demander = parseInt(e.target.value);
                              setFormData(prev => ({ ...prev, details: updated }));
                            }}
                            className="w-24 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-center font-semibold"
                            placeholder="Qté"
                            required
                          />
                          
                          {formData.details.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.details.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, details: updated }));
                              }}
                              className="p-3 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            details: [...prev.details, { id_materiel: '', quantite_demander: 1 }]
                          }));
                        }}
                        className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all font-semibold text-sm"
                      >
                        + Ajouter un matériel
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all ${
                    modalType === 'signalement' 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-600'
                  }`}
                >
                  {modalType === 'demande' ? 'Envoyer' : 'Signaler'}
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