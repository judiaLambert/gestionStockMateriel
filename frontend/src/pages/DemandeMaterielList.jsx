import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Check, X, Package } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError, showConfirm } from '../alerts.jsx';
import Modal from '../components/Modal';
import { 
  getDemandes, 
  addDemande, 
  updateDemande, 
  deleteDemande,
  updateStatut,
} from '../api/demandematerielAPI';
import {addDetailDemande,
  updateDetailDemande,
  deleteDetailDemande} from '../api/detaildemandeAPI'
import { getDemandeurs } from '../api/demandeurAPI';
import { getMateriels } from '../api/materielAPI';

const DemandeMaterielList = () => {
  const [demandes, setDemandes] = useState([]);
  const [demandeurs, setDemandeurs] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isDetailFormModalOpen, setIsDetailFormModalOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    id_demandeur: '', 
    date_demande: new Date().toISOString().split('T')[0],
    raison_demande: '' 
  });
  const [detailFormData, setDetailFormData] = useState({
    id_detail: '',
    id_materiel: '',
    quantite_demander: 1
  });
  const [approvalData, setApprovalData] = useState({
    statut: '',
    motif_refus: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [demandesRes, demandeursRes, materielsRes] = await Promise.all([
        getDemandes(),
        getDemandeurs(),
        getMateriels()
      ]);
      setDemandes(demandesRes.data);
      setDemandeurs(demandeursRes.data);
      setMateriels(materielsRes.data);
    } catch (err) {
      console.error(err);
      showError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDemande(selectedDemande.id_demande, formData);
        showSuccess('Demande modifiée avec succès !');
      } else {
        await addDemande(formData);
        showSuccess('Demande créée avec succès !');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showError('Erreur lors de l\'enregistrement');
    }
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateStatut(selectedDemande.id_demande, approvalData);
      showSuccess(
        approvalData.statut === 'approuvee' 
          ? 'Demande approuvée !' 
          : 'Demande refusée !'
      );
      setIsApprovalModalOpen(false);
      setApprovalData({ statut: '', motif_refus: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      showError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingDetail) {
        await updateDetailDemande(detailFormData.id_detail, {
          quantite_demander: detailFormData.quantite_demander
        });
        showSuccess('Détail modifié avec succès !');
      } else {
        await addDetailDemande(selectedDemande.id_demande, {
          id_materiel: detailFormData.id_materiel,
          quantite_demander: detailFormData.quantite_demander
        });
        showSuccess('Matériel ajouté avec succès !');
      }
      setIsDetailFormModalOpen(false);
      resetDetailForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showError('Erreur lors de l\'enregistrement du détail');
    }
  };

  const handleEdit = (demande) => {
    setFormData({
      id_demandeur: demande.demandeur?.id_demandeur || '',
      date_demande: demande.date_demande.split('T')[0],
      raison_demande: demande.raison_demande
    });
    setSelectedDemande(demande);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (demande) => {
    showConfirm(
      `Voulez-vous vraiment supprimer la demande "${demande.id_demande}" ?`,
      async () => {
        try {
          await deleteDemande(demande.id_demande);
          showSuccess('Demande supprimée avec succès !');
          fetchData();
        } catch (err) {
          console.error(err);
          showError('Erreur lors de la suppression');
        }
      }
    );
  };

  const handleViewDetails = (demande) => {
    setSelectedDemande(demande);
    setIsDetailModalOpen(true);
  };

  const handleApprove = (demande) => {
    setSelectedDemande(demande);
    setApprovalData({ statut: 'approuvee', motif_refus: '' });
    setIsApprovalModalOpen(true);
  };

  const handleReject = (demande) => {
    setSelectedDemande(demande);
    setApprovalData({ statut: 'refusee', motif_refus: '' });
    setIsApprovalModalOpen(true);
  };

  const handleAddDetail = () => {
    resetDetailForm();
    setIsDetailFormModalOpen(true);
  };

  const handleEditDetail = (detail) => {
    setDetailFormData({
      id_detail: detail.id_detail,
      id_materiel: detail.materiel?.id || '',
      quantite_demander: detail.quantite_demander
    });
    setIsEditingDetail(true);
    setIsDetailFormModalOpen(true);
  };

  const handleDeleteDetail = (detail) => {
    showConfirm(
      `Voulez-vous vraiment supprimer "${detail.materiel?.designation}" ?`,
      async () => {
        try {
          await deleteDetailDemande(detail.id_detail);
          showSuccess('Matériel supprimé avec succès !');
          fetchData();
        } catch (err) {
          console.error(err);
          showError('Erreur lors de la suppression');
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({ 
      id_demandeur: '', 
      date_demande: new Date().toISOString().split('T')[0],
      raison_demande: '' 
    });
    setIsEditing(false);
    setSelectedDemande(null);
  };

  const resetDetailForm = () => {
    setDetailFormData({
      id_detail: '',
      id_materiel: '',
      quantite_demander: 1
    });
    setIsEditingDetail(false);
  };

  const filteredDemandes = demandes.filter(demande =>
    demande.id_demande?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.demandeur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.raison_demande?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusConfig = (statut) => {
    const configs = {
      'en_attente': { color: 'bg-orange-50 text-orange-700 border-orange-200', text: 'En attente' },
      'approuvee': { color: 'bg-green-50 text-green-700 border-green-200', text: 'Approuvée' },
      'refusee': { color: 'bg-red-50 text-red-700 border-red-200', text: 'Refusée' }
    };
    return configs[statut] || configs.en_attente;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Demandes de Matériel</h1>
              <p className="text-gray-600">Gestion et validation des demandes</p>
            </div>
            <button 
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all font-medium"
            >
              <Plus size={20} />
              Nouvelle Demande
            </button>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par ID, demandeur ou raison..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin mx-auto w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Demandeur</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Raison</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredDemandes.map((demande, index) => {
                    const status = getStatusConfig(demande.statut);
                    return (
                      <tr key={demande.id_demande} className={`hover:bg-emerald-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-200">
                            {demande.id_demande}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{demande.demandeur?.nom}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">{formatDate(demande.date_demande)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">{demande.raison_demande}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewDetails(demande)} 
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Voir les détails"
                            >
                              <Eye size={18} />
                            </button>
                            {demande.statut === 'en_attente' && (
                              <>
                                <button 
                                  onClick={() => handleApprove(demande)} 
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                  title="Approuver"
                                >
                                  <Check size={18} />
                                </button>
                                <button 
                                  onClick={() => handleReject(demande)} 
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Refuser"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => handleEdit(demande)} 
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Modifier"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(demande)} 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredDemandes.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun résultat ne correspond à votre recherche' : 'Aucune demande enregistrée'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Formulaire Demande */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }} 
        title={isEditing ? "Modifier la Demande" : "Nouvelle Demande"} 
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Demandeur *</label>
            <select 
              value={formData.id_demandeur} 
              onChange={(e) => setFormData({ ...formData, id_demandeur: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
              required
            >
              <option value="">Sélectionnez un demandeur</option>
              {demandeurs.map(demandeur => (
                <option key={demandeur.id_demandeur} value={demandeur.id_demandeur}>
                  {demandeur.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
            <input 
              type="date" 
              value={formData.date_demande} 
              onChange={(e) => setFormData({ ...formData, date_demande: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Raison *</label>
            <textarea 
              value={formData.raison_demande} 
              onChange={(e) => setFormData({ ...formData, raison_demande: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none" 
              rows="4" 
              placeholder="Expliquez la raison de la demande..."
              required 
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button 
              type="button" 
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }} 
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-md font-medium"
            >
              {isEditing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Détails */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        title="Détails de la Demande" 
        size="lg"
      >
        {selectedDemande && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">ID Demande</p>
                <p className="font-semibold text-gray-900">{selectedDemande.id_demande}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="font-semibold text-gray-900">{formatDate(selectedDemande.date_demande)}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Demandeur</p>
              <p className="font-semibold text-gray-900">{selectedDemande.demandeur?.nom}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Raison</p>
              <p className="text-gray-900">{selectedDemande.raison_demande}</p>
            </div>
            
            {/* Matériels demandés */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-900">Matériels demandés</h3>
                {selectedDemande.statut === 'en_attente' && (
                  <button
                    onClick={handleAddDetail}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all text-sm font-medium"
                  >
                    <Plus size={16} />
                    Ajouter
                  </button>
                )}
              </div>
              
              {selectedDemande.detailDemandes && selectedDemande.detailDemandes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Matériel</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Quantité</th>
                        {selectedDemande.statut === 'en_attente' && (
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedDemande.detailDemandes.map((detail, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-900">{detail.materiel?.designation}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                              x{detail.quantite_demander}
                            </span>
                          </td>
                          {selectedDemande.statut === 'en_attente' && (
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditDetail(detail)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Modifier"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteDetail(detail)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-600 mb-4">Aucun matériel ajouté</p>
                  {selectedDemande.statut === 'en_attente' && (
                    <button
                      onClick={handleAddDetail}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all text-sm font-medium"
                    >
                      <Plus size={16} />
                      Ajouter un matériel
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Approbation/Refus */}
      <Modal 
        isOpen={isApprovalModalOpen} 
        onClose={() => {
          setIsApprovalModalOpen(false);
          setApprovalData({ statut: '', motif_refus: '' });
        }} 
        title={approvalData.statut === 'approuvee' ? "Approuver la Demande" : "Refuser la Demande"} 
        size="md"
      >
        <form onSubmit={handleApprovalSubmit} className="space-y-5">
          {approvalData.statut === 'refusee' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Motif du refus *</label>
              <textarea 
                value={approvalData.motif_refus} 
                onChange={(e) => setApprovalData({ ...approvalData, motif_refus: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none" 
                rows="4" 
                placeholder="Expliquez la raison du refus..."
                required 
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button 
              type="button" 
              onClick={() => {
                setIsApprovalModalOpen(false);
                setApprovalData({ statut: '', motif_refus: '' });
              }} 
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className={`px-6 py-2.5 text-white rounded-lg transition-all shadow-md font-medium ${
                approvalData.statut === 'approuvee' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {approvalData.statut === 'approuvee' ? 'Approuver' : 'Refuser'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ajout/Modification Détail */}
      <Modal 
        isOpen={isDetailFormModalOpen} 
        onClose={() => {
          setIsDetailFormModalOpen(false);
          resetDetailForm();
        }} 
        title={isEditingDetail ? "Modifier le matériel" : "Ajouter un matériel"} 
        size="md"
      >
        <form onSubmit={handleDetailSubmit} className="space-y-5">
          {!isEditingDetail && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Matériel *</label>
              <select 
                value={detailFormData.id_materiel} 
                onChange={(e) => setDetailFormData({ ...detailFormData, id_materiel: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                required
              >
                <option value="">Sélectionnez un matériel</option>
                {materiels.map(materiel => (
                  <option key={materiel.id} value={materiel.id}>
                    {materiel.designation}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantité *</label>
            <input 
              type="number" 
              min="1"
              value={detailFormData.quantite_demander} 
              onChange={(e) => setDetailFormData({ ...detailFormData, quantite_demander: parseInt(e.target.value) })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
              placeholder="Ex: 10"
              required 
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button 
              type="button" 
              onClick={() => {
                setIsDetailFormModalOpen(false);
                resetDetailForm();
              }} 
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-md font-medium"
            >
              {isEditingDetail ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DemandeMaterielList;
