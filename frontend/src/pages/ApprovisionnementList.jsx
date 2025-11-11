import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Truck, Package, Calendar, Download, Filter, TrendingUp, Eye } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError, showConfirm } from '../alerts.jsx';
import Modal from '../components/Modal';
import { 
  getApprovisionnements, 
  addApprovisionnement, 
  updateApprovisionnement, 
  deleteApprovisionnement 
} from '../api/approvisionnementAPI';
import { getAcquisitions } from '../api/acquisitionAPI';
import { 
  getDetailApprovisionnements, 
  addDetailApprovisionnement,
  updateDetailApprovisionnement,
  deleteDetailApprovisionnement 
} from '../api/detailapproAPI';
import { getMateriels } from '../api/materielAPI';

const ApprovisionnementList = () => {
  const [approvisionnements, setApprovisionnements] = useState([]);
  const [acquisitions, setAcquisitions] = useState([]);
  const [details, setDetails] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddDetailModalOpen, setIsAddDetailModalOpen] = useState(false);
  const [isEditDetailModalOpen, setIsEditDetailModalOpen] = useState(false);
  const [selectedAppro, setSelectedAppro] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [formData, setFormData] = useState({ 
    id: '', 
    id_acquisition: '', 
    date_approvisionnement: '',
    recu: '',
    note_approvisionnement: ''
  });
  const [detailFormData, setDetailFormData] = useState({
    id: '',
    id_materiel: '',
    id_appro: '',
    quantite_recu: '',
    prix_unitaire: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [selectedAcquisition, setSelectedAcquisition] = useState(null);

  const fetchData = async () => {
    try {
      const [appRes, acqRes, detRes, matRes] = await Promise.all([
        getApprovisionnements(),
        getAcquisitions(),
        getDetailApprovisionnements(),
        getMateriels()
      ]);
      setApprovisionnements(appRes.data);
      setAcquisitions(acqRes.data);
      setDetails(detRes.data);
      setMateriels(matRes.data);
    } catch (err) {
      console.error(err);
      showError('Impossible de charger les données');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcquisitionChange = (acquisitionId) => {
    const acquisition = acquisitions.find(a => a.id === acquisitionId);
    setSelectedAcquisition(acquisition);
    setFormData({ 
      ...formData, 
      id_acquisition: acquisitionId,
      recu: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateApprovisionnement(formData.id, formData);
        showSuccess(`Approvisionnement "${formData.id}" modifié avec succès !`);
      } else {
        await addApprovisionnement(formData);
        showSuccess('Nouvel approvisionnement ajouté avec succès !');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showError(
        isEditing 
          ? 'Erreur lors de la modification de l\'approvisionnement' 
          : 'Erreur lors de l\'ajout de l\'approvisionnement'
      );
    }
  };

  const handleEdit = (approvisionnement) => {
    const acquisition = acquisitions.find(a => a.id === approvisionnement.acquisition?.id);
    setFormData({
      id: approvisionnement.id,
      id_acquisition: approvisionnement.acquisition?.id || '',
      date_approvisionnement: approvisionnement.dateApprovisionnement.split('T')[0],
      recu: approvisionnement.recu || '',
      note_approvisionnement: approvisionnement.noteApprovisionnement || ''
    });
    setSelectedAcquisition(acquisition);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (approvisionnement) => {
    showConfirm(
      `Voulez-vous vraiment supprimer l'approvisionnement "${approvisionnement.id}" ?`,
      async () => {
        try {
          await deleteApprovisionnement(approvisionnement.id);
          showSuccess(`Approvisionnement "${approvisionnement.id}" supprimé avec succès !`);
          fetchData();
        } catch (err) {
          console.error(err);
          if (err.response?.status === 500) {
            showError(
              'Impossible de supprimer cet approvisionnement car il est lié à d\'autres enregistrements.'
            );
          } else {
            showError('Erreur lors de la suppression de l\'approvisionnement');
          }
        }
      }
    );
  };

  const handleViewDetails = (appro) => {
    setSelectedAppro(appro);
    setIsDetailModalOpen(true);
  };

  const handleAddDetail = () => {
    setDetailFormData({
      id: '',
      id_materiel: '',
      id_appro: selectedAppro.id,
      quantite_recu: '',
      prix_unitaire: ''
    });
    setIsEditingDetail(false);
    setIsAddDetailModalOpen(true);
  };

  const handleEditDetail = (detail) => {
    setDetailFormData({
      id: detail.id,
      id_materiel: detail.materiel?.id || '',
      id_appro: detail.approvisionnement?.id || '',
      quantite_recu: detail.quantiteRecu,
      prix_unitaire: detail.prixUnitaire || ''
    });
    setIsEditingDetail(true);
    setIsEditDetailModalOpen(true);
  };

  const handleDeleteDetail = (detail) => {
    showConfirm(
      `Voulez-vous vraiment supprimer "${detail.materiel?.designation}" de cet approvisionnement ?`,
      async () => {
        try {
          await deleteDetailApprovisionnement(detail.id);
          showSuccess(`Matériel "${detail.materiel?.designation}" supprimé avec succès !`);
          fetchData();
        } catch (err) {
          console.error(err);
          showError('Erreur lors de la suppression du matériel');
        }
      }
    );
  };

  const handleSubmitDetail = async (e) => {
    e.preventDefault();
    try {
      const prixFinal = selectedAppro?.acquisition?.typeAcquisition === 'Don' 
        ? (detailFormData.prix_unitaire || 0)
        : detailFormData.prix_unitaire;

      if (isEditingDetail) {
        await updateDetailApprovisionnement(detailFormData.id, {
          id_materiel: detailFormData.id_materiel,
          id_appro: detailFormData.id_appro,
          quantite_recu: detailFormData.quantite_recu,
          prix_unitaire: prixFinal,
        });
        showSuccess('Matériel modifié avec succès !');
      } else {
        await addDetailApprovisionnement({
          id_materiel: detailFormData.id_materiel,
          id_appro: detailFormData.id_appro,
          quantite_recu: detailFormData.quantite_recu,
          prix_unitaire: prixFinal,
        });
        showSuccess('Matériel ajouté avec succès !');
      }
      
      setIsAddDetailModalOpen(false);
      setIsEditDetailModalOpen(false);
      resetDetailForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showError(
        isEditingDetail 
          ? 'Erreur lors de la modification du matériel' 
          : 'Erreur lors de l\'ajout du matériel'
      );
    }
  };

  const resetForm = () => {
    setFormData({ 
      id: '', 
      id_acquisition: '', 
      date_approvisionnement: '',
      recu: '',
      note_approvisionnement: ''
    });
    setSelectedAcquisition(null);
    setIsEditing(false);
  };

  const resetDetailForm = () => {
    setDetailFormData({ 
      id: '', 
      id_materiel: '', 
      id_appro: '', 
      quantite_recu: '', 
      prix_unitaire: '' 
    });
    setIsEditingDetail(false);
  };

  const filteredApprovisionnements = approvisionnements.filter(approvisionnement => {
    const matchSearch = approvisionnement.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approvisionnement.acquisition?.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approvisionnement.recu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approvisionnement.noteApprovisionnement?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchPeriod = true;
    if (filterPeriod !== 'all') {
      const date = new Date(approvisionnement.dateApprovisionnement);
      const now = new Date();
      if (filterPeriod === 'month') {
        matchPeriod = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      } else if (filterPeriod === 'year') {
        matchPeriod = date.getFullYear() === now.getFullYear();
      }
    }

    return matchSearch && matchPeriod;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA'
    }).format(amount);
  };

  const truncateText = (text, maxLength = 40) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const stats = {
    total: approvisionnements.length,
    moisEnCours: approvisionnements.filter(a => {
      const date = new Date(a.dateApprovisionnement);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    anneeEnCours: approvisionnements.filter(a => {
      const date = new Date(a.dateApprovisionnement);
      return date.getFullYear() === new Date().getFullYear();
    }).length
  };

  const getDetailsForAppro = (approId) => {
    return details.filter(d => d.approvisionnement?.id === approId);
  };

  const calculateTotal = (approDetails) => {
    return approDetails.reduce((sum, detail) => {
      return sum + ((detail.prixUnitaire || 0) * detail.quantiteRecu);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Approvisionnements
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Truck size={18} className="text-green-600" />
                Suivi des réceptions de matériel
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
                <Download size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Exporter</span>
              </button>
              <button 
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
              >
                <Plus size={20} />
                Nouveau
              </button>
            </div>
          </div>
        </div>

        {/* Cards statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Truck className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600 font-medium">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.moisEnCours}</p>
                <p className="text-sm text-gray-600 font-medium">Ce mois</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.anneeEnCours}</p>
                <p className="text-sm text-gray-600 font-medium">Cette année</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par ID, acquisition, reçu, observation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all appearance-none bg-white text-sm font-medium"
              >
                <option value="all">Toutes périodes</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Acquisition</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Reçu</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Observation</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredApprovisionnements.map((approvisionnement, index) => (
                  <tr 
                    key={approvisionnement.id} 
                    className={`hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{approvisionnement.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                        <Package size={14} />
                        {approvisionnement.acquisition?.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(approvisionnement.dateApprovisionnement)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{truncateText(approvisionnement.recu, 25)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{truncateText(approvisionnement.noteApprovisionnement, 35)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(approvisionnement)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Voir les détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(approvisionnement)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(approvisionnement)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApprovisionnements.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun approvisionnement trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun résultat ne correspond à votre recherche' : 'Commencez par ajouter un approvisionnement'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Formulaire Approvisionnement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditing ? "Modifier l'Approvisionnement" : "Nouvel Approvisionnement"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Acquisition *</label>
            <select
              value={formData.id_acquisition}
              onChange={(e) => handleAcquisitionChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              required
            >
              <option value="">Sélectionnez une acquisition</option>
              {acquisitions.map(acquisition => (
                <option key={acquisition.id} value={acquisition.id}>
                  {acquisition.id} - {acquisition.fournisseur?.nom} ({acquisition.typeAcquisition})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date d'approvisionnement *</label>
            <input
              type="date"
              value={formData.date_approvisionnement}
              onChange={(e) => setFormData({ ...formData, date_approvisionnement: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              required
            />
          </div>

          {selectedAcquisition && selectedAcquisition.typeAcquisition !== 'Don' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reçu (Bon de livraison) *</label>
              <input
                type="text"
                value={formData.recu}
                onChange={(e) => setFormData({ ...formData, recu: e.target.value })}
                placeholder="Ex: BL-2024-001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              />
            </div>
          )}

          {selectedAcquisition && selectedAcquisition.typeAcquisition === 'Don' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reçu (Optionnel)</label>
              <input
                type="text"
                value={formData.recu}
                onChange={(e) => setFormData({ ...formData, recu: e.target.value })}
                placeholder="Ex: Reçu donation"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Observations</label>
            <textarea
              value={formData.note_approvisionnement}
              onChange={(e) => setFormData({ ...formData, note_approvisionnement: e.target.value })}
              placeholder="Notes sur la livraison..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all"
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
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md font-medium"
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
        title="Détails de l'Approvisionnement" 
        size="xl"
      >
        {selectedAppro && (
          <div className="space-y-4">
            {selectedAppro.noteApprovisionnement && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700 font-semibold mb-1">Observations</p>
                <p className="text-sm text-gray-900">{selectedAppro.noteApprovisionnement}</p>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-900">Matériels livrés</h3>
                <button
                  onClick={handleAddDetail}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm font-medium"
                >
                  <Plus size={16} />
                  Ajouter
                </button>
              </div>
              
              {getDetailsForAppro(selectedAppro.id).length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Matériel</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Qté</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">P.U.</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {getDetailsForAppro(selectedAppro.id).map((detail, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-gray-900">{detail.materiel?.designation}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                {detail.materiel?.typeMateriel?.designation}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-bold text-purple-700">{detail.quantiteRecu}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm text-gray-700">
                                {detail.prixUnitaire > 0 ? formatCurrency(detail.prixUnitaire) : <span className="text-gray-400 italic">Gratuit</span>}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-bold text-green-700">
                                {formatCurrency((detail.prixUnitaire || 0) * detail.quantiteRecu)}
                              </span>
                            </td>
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
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-green-50 border-t-2 border-green-200">
                        <tr>
                          <td colSpan="4" className="px-4 py-3 text-right">
                            <span className="text-sm font-bold text-gray-900">Total :</span>
                          </td>
                          <td colSpan="2" className="px-4 py-3 text-right">
                            <span className="text-lg font-bold text-green-700">
                              {formatCurrency(calculateTotal(getDetailsForAppro(selectedAppro.id)))}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-600 mb-4">Aucun matériel ajouté</p>
                  <button
                    onClick={handleAddDetail}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm font-medium"
                  >
                    <Plus size={16} />
                    Ajouter un matériel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Ajout/Modification Détail */}
      <Modal
        isOpen={isAddDetailModalOpen || isEditDetailModalOpen}
        onClose={() => {
          setIsAddDetailModalOpen(false);
          setIsEditDetailModalOpen(false);
          resetDetailForm();
        }}
        title={isEditingDetail ? "Modifier le matériel" : "Ajouter un matériel"}
        size="md"
      >
        <form onSubmit={handleSubmitDetail} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Matériel *</label>
            <select
              value={detailFormData.id_materiel}
              onChange={(e) => setDetailFormData({ ...detailFormData, id_materiel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              required
            >
              <option value="">Sélectionnez un matériel</option>
              {materiels.map(materiel => (
                <option key={materiel.id} value={materiel.id}>
                  {materiel.designation} - {materiel.typeMateriel?.designation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantité reçue *</label>
            <input
              type="number"
              min="1"
              value={detailFormData.quantite_recu}
              onChange={(e) => setDetailFormData({ ...detailFormData, quantite_recu: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              placeholder="Ex: 10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Prix unitaire (MGA) {selectedAppro?.acquisition?.typeAcquisition === 'Don' && '(Optionnel)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={detailFormData.prix_unitaire}
              onChange={(e) => setDetailFormData({ ...detailFormData, prix_unitaire: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              placeholder={selectedAppro?.acquisition?.typeAcquisition === 'Don' ? "Laisser vide pour gratuit" : "Ex: 500000"}
              required={selectedAppro?.acquisition?.typeAcquisition !== 'Don'}
            />
            {selectedAppro?.acquisition?.typeAcquisition === 'Don' && (
              <p className="text-xs text-gray-500 mt-1.5">Pour les dons, ce champ est optionnel</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button 
              type="button" 
              onClick={() => {
                setIsAddDetailModalOpen(false);
                setIsEditDetailModalOpen(false);
                resetDetailForm();
              }} 
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md font-medium"
            >
              {isEditingDetail ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ApprovisionnementList;
