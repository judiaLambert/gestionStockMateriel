import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Truck, Package, Calendar, Download, Filter, TrendingUp, Eye, X, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { 
  getApprovisionnements, 
  addApprovisionnement, 
  updateApprovisionnement, 
  deleteApprovisionnement 
} from '../api/approvisionnementAPI';
import { getAcquisitions } from '../api/acquisitionAPI';
import { getDetailApprovisionnements } from '../api/detailapproAPI';

const ApprovisionnementList = () => {
  const [approvisionnements, setApprovisionnements] = useState([]);
  const [acquisitions, setAcquisitions] = useState([]);
  const [details, setDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAcquisition, setSelectedAcquisition] = useState(null);

  const fetchData = async () => {
    try {
      const [appRes, acqRes, detRes] = await Promise.all([
        getApprovisionnements(),
        getAcquisitions(),
        getDetailApprovisionnements()
      ]);
      setApprovisionnements(appRes.data);
      setAcquisitions(acqRes.data);
      setDetails(detRes.data);
    } catch (err) {
      console.error(err);
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
      } else {
        await addApprovisionnement(formData);
      }
      setIsModalOpen(false);
      setFormData({ 
        id: '', 
        id_acquisition: '', 
        date_approvisionnement: '',
        recu: '',
        note_approvisionnement: ''
      });
      setSelectedAcquisition(null);
      setIsEditing(false);
      fetchData();
    } catch (err) {
      console.error(err);
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

  const handleDelete = async (approvisionnement) => {
    if (confirm(`Supprimer l'approvisionnement "${approvisionnement.id}" ?`)) {
      try {
        await deleteApprovisionnement(approvisionnement.id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleViewDetails = (appro) => {
    setSelectedAppro(appro);
    setIsDetailModalOpen(true);
  };

  const filteredApprovisionnements = approvisionnements.filter(approvisionnement => {
    const matchSearch = approvisionnement.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approvisionnement.acquisition?.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approvisionnement.acquisition?.fournisseur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approvisionnement.recu?.toLowerCase().includes(searchTerm.toLowerCase());

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

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Statistiques
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

  // Détails pour un approvisionnement
  const getDetailsForAppro = (approId) => {
    return details.filter(d => d.approvisionnement?.id === approId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
              <Link
                to="/detail-approvisionnement"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-all shadow-sm"
              >
                <List size={18} />
                <span className="text-sm font-medium">Tous les Détails</span>
              </Link>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
                <Download size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Exporter</span>
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
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
                <p className="text-sm text-gray-600 font-medium">Total Approvisionnements</p>
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
                <p className="text-sm text-gray-600 font-medium">Ce mois-ci</p>
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

        {/* Carte de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par ID, acquisition, fournisseur, reçu..."
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Fournisseur</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Matériels</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredApprovisionnements.map((approvisionnement, index) => {
                  const approDetails = getDetailsForAppro(approvisionnement.id);
                  return (
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
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {approvisionnement.acquisition?.fournisseur?.nom || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(approvisionnement.dateApprovisionnement)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-200">
                          <Package size={14} />
                          {approDetails.length} matériel{approDetails.length > 1 ? 's' : ''}
                        </span>
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
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(approvisionnement)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

      {/* Modal Formulaire */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setFormData({ id: '', id_acquisition: '', date_approvisionnement: '', recu: '', note_approvisionnement: '' });
          setSelectedAcquisition(null);
        }}
        title={isEditing ? "Modifier l'Approvisionnement" : "Nouvel Approvisionnement"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Acquisition</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date d'approvisionnement</label>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <span>
                Après avoir créé l'approvisionnement, vous pourrez ajouter les matériels reçus dans la page "Détails Approvisionnement".
              </span>
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium">Annuler</button>
            <button type="submit" className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md font-medium">{isEditing ? 'Mettre à jour' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Détails avec matériels */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Détails de l'Approvisionnement" size="xl">
        {selectedAppro && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">ID Approvisionnement</p>
                <p className="font-semibold text-gray-900">{selectedAppro.id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="font-semibold text-gray-900">{formatDate(selectedAppro.dateApprovisionnement)}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-semibold mb-2">Acquisition</p>
              <p className="font-semibold text-gray-900">{selectedAppro.acquisition?.id}</p>
              <p className="text-sm text-gray-600">Type: {selectedAppro.acquisition?.typeAcquisition}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 font-semibold mb-2">Fournisseur</p>
              <p className="font-semibold text-gray-900">{selectedAppro.acquisition?.fournisseur?.nom}</p>
              <p className="text-sm text-gray-600">{selectedAppro.acquisition?.fournisseur?.adresse}</p>
              <p className="text-sm text-gray-600">{selectedAppro.acquisition?.fournisseur?.contact}</p>
            </div>

            {selectedAppro.recu && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Reçu / Bon de livraison</p>
                <p className="text-gray-900">{selectedAppro.recu}</p>
              </div>
            )}

            {selectedAppro.noteApprovisionnement && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Observations</p>
                <p className="text-gray-900">{selectedAppro.noteApprovisionnement}</p>
              </div>
            )}

            {/* Liste des matériels livrés */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-purple-700 font-bold">Matériels livrés</p>
                <Link
                  to="/detail-approvisionnement"
                  state={{ selectedAppro: selectedAppro.id }}
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
                >
                  <Plus size={14} />
                  Ajouter des matériels
                </Link>
              </div>
              {getDetailsForAppro(selectedAppro.id).length > 0 ? (
                <div className="space-y-2">
                  {getDetailsForAppro(selectedAppro.id).map((detail, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{detail.materiel?.designation}</p>
                        <p className="text-xs text-gray-600">{detail.materiel?.typeMateriel?.designation}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-700">Qté: {detail.quantiteRecu}</p>
                        {detail.prixUnitaire > 0 && (
                          <p className="text-xs text-gray-600">{formatCurrency(detail.prixUnitaire * detail.quantiteRecu)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto text-purple-300 mb-2" size={32} />
                  <p className="text-sm text-purple-600">Aucun matériel ajouté pour cet approvisionnement</p>
                  <Link
                    to="/detail-approvisionnement"
                    state={{ selectedAppro: selectedAppro.id }}
                    className="inline-flex items-center gap-1 mt-3 text-sm text-purple-700 hover:text-purple-900 font-semibold"
                  >
                    <Plus size={16} />
                    Ajouter maintenant
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApprovisionnementList;
