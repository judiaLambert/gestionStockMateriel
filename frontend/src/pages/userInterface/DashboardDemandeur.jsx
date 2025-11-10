import React, { useState, useEffect } from 'react';
import { Package, FileText, Clock, CheckCircle, XCircle, Plus, Wrench, X } from 'lucide-react';
import { getDemandesByDemandeur, addDemande } from '../../api/demandematerielAPI';
import { getMateriels } from '../../api/materielAPI';

const DashboardDemandeur = () => {
  const [user, setUser] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDemandeModal, setShowDemandeModal] = useState(false);
  const [showDepannageModal, setShowDepannageModal] = useState(false);
  const [formData, setFormData] = useState({
    raison_demande: '',
    details: [{ id_materiel: '', quantite_demander: 1 }]
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchDemandes(userObj.id);
      fetchMateriels();
    }
  }, []);

  const fetchDemandes = async (userId) => {
    try {
      const response = await getDemandesByDemandeur(userId);
      console.log('Réponse API:', response.data);
      
      const demandesData = response.data.data || response.data || [];
      setDemandes(demandesData);
      calculateStats(demandesData);
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMateriels = async () => {
    try {
      const response = await getMateriels();
      setMateriels(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur chargement matériels:', error);
    }
  };

  const calculateStats = (demandesData) => {
    const stats = {
      total: demandesData.length,
      enAttente: demandesData.filter(d => d.statut === 'en_attente').length,
      approuvees: demandesData.filter(d => d.statut === 'approuvee').length,
      refusees: demandesData.filter(d => d.statut === 'refusee').length
    };
    setStats(stats);
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'approuvee':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'refusee':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-orange-500" size={20} />;
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'approuvee':
        return 'bg-green-100 text-green-800';
      case 'refusee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case 'approuvee':
        return 'Approuvée';
      case 'refusee':
        return 'Refusée';
      default:
        return 'En attente';
    }
  };

  const handleAddMaterial = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { id_materiel: '', quantite_demander: 1 }]
    }));
  };

  const handleRemoveMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  };

  const handleMaterialChange = (index, field, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index][field] = value;
    setFormData(prev => ({ ...prev, details: updatedDetails }));
  };

  const handleSubmitDemande = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Utilisateur non connecté');
      return;
    }

    try {
      const demandeData = {
        id_demandeur: user.id,
        raison_demande: formData.raison_demande,
        details: formData.details.filter(detail => detail.id_materiel && detail.quantite_demander > 0)
      };

      await addDemande(demandeData);
      
      setFormData({
        raison_demande: '',
        details: [{ id_materiel: '', quantite_demander: 1 }]
      });
      
      setShowDemandeModal(false);
      fetchDemandes(user.id);
      
      alert('Demande créée avec succès!');
    } catch (error) {
      console.error('Erreur création demande:', error);
      alert('Erreur lors de la création de la demande');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord Demandeur</h1>
          <p className="text-gray-600">Bienvenue, {user?.nom}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDepannageModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors"
          >
            <Wrench size={20} />
            Signalement Dépannage
          </button>
          <button
            onClick={() => setShowDemandeModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Nouvelle Demande
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Demandes</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">En Attente</p>
              <p className="text-3xl font-bold mt-2">{stats.enAttente}</p>
            </div>
            <div className="bg-orange-500 text-white p-3 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Approuvées</p>
              <p className="text-3xl font-bold mt-2">{stats.approuvees}</p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Refusées</p>
              <p className="text-3xl font-bold mt-2">{stats.refusees}</p>
            </div>
            <div className="bg-red-500 text-white p-3 rounded-lg">
              <XCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Demandes récentes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Mes Demandes Récentes</h3>
        </div>

        {demandes.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400" size={48} />
            <p className="text-gray-500 mt-4">Aucune demande pour le moment</p>
            <button
              onClick={() => setShowDemandeModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Faire une première demande
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {demandes.slice(0, 5).map((demande) => (
              <div key={demande.id_demande} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(demande.statut)}
                      <h4 className="font-semibold text-lg">{demande.raison_demande}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(demande.statut)}`}>
                        {getStatusText(demande.statut)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(demande.date_demande).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span> {demande.id_demande}
                      </div>
                    </div>

                    {demande.detailDemandes && demande.detailDemandes.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Matériels demandés:</p>
                        <div className="space-y-1">
                          {demande.detailDemandes.slice(0, 3).map((detail) => (
                            <div key={detail.id_detail} className="flex justify-between text-sm">
                              <span>{detail.materiel?.nom_materiel}</span>
                              <span className="text-gray-500">Qty: {detail.quantite_demander}</span>
                            </div>
                          ))}
                          {demande.detailDemandes.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{demande.detailDemandes.length - 3} autre(s) matériel(s)
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Nouvelle Demande */}
      {showDemandeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Nouvelle Demande de Matériel</h3>
              <button
                onClick={() => setShowDemandeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitDemande}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raison de la demande *
                  </label>
                  <textarea
                    value={formData.raison_demande}
                    onChange={(e) => setFormData(prev => ({ ...prev, raison_demande: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Décrivez pourquoi vous avez besoin de ce matériel..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matériels demandés
                  </label>
                  <div className="space-y-3">
                    {formData.details.map((detail, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <select 
                          value={detail.id_materiel}
                          onChange={(e) => handleMaterialChange(index, 'id_materiel', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Sélectionnez un matériel</option>
                          {materiels.map(materiel => (
                            <option key={materiel.id} value={materiel.id}>
                              {materiel.designation}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={detail.quantite_demander}
                          onChange={(e) => handleMaterialChange(index, 'quantite_demander', parseInt(e.target.value))}
                          placeholder="Qty"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                          min="1"
                          required
                        />
                        {formData.details.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddMaterial}
                    className="mt-2 text-blue-600 text-sm flex items-center gap-1 hover:text-blue-800"
                  >
                    <Plus size={16} />
                    Ajouter un autre matériel
                  </button>
                </div>
                
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowDemandeModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Soumettre la demande
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dépannage */}
      {showDepannageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Signalement de Dépannage</h3>
              <button
                onClick={() => setShowDepannageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matériel à réparer *
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="">Sélectionnez le matériel</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description du problème *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows="3"
                  placeholder="Décrivez le problème rencontré..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgence
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="faible">Faible</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="elevee">Élevée</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowDepannageModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Envoyer le signalement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardDemandeur;