import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingUp, BarChart3, Loader, Filter } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError, showConfirm } from '../alerts.jsx';
import Modal from '../components/Modal';
import { 
  getInventaires, 
  addInventaire, 
  updateInventaire, 
  deleteInventaire,
  getAlertesStockBas,
  getInventaireStats
} from '../api/inventaireAPI';
import { getMateriels } from '../api/materielAPI';

const InventaireList = () => {
  const [inventaires, setInventaires] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    id_materiel: '', 
    quantite_stock: '',
    seuil_alerte: '',
    emplacement: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alertesStockBas, setAlertesStockBas] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('inventaire');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventairesRes, materielsRes, alertesRes, statsRes] = await Promise.all([
        getInventaires(),
        getMateriels(),
        getAlertesStockBas(),
        getInventaireStats()
      ]);
      setInventaires(inventairesRes.data);
      setMateriels(materielsRes.data);
      setAlertesStockBas(alertesRes.data);
      setStats(statsRes.data);
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
        await updateInventaire(editingId, {
          quantite_stock: parseInt(formData.quantite_stock),
          seuil_alerte: parseInt(formData.seuil_alerte),
          emplacement: formData.emplacement
        });
        showSuccess('Inventaire modifié avec succès !');
      } else {
        await addInventaire({
          id_materiel: formData.id_materiel,
          quantite_stock: parseInt(formData.quantite_stock),
          seuil_alerte: parseInt(formData.seuil_alerte),
          emplacement: formData.emplacement
        });
        showSuccess('Inventaire créé avec succès !');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (inventaire) => {
    setFormData({
      id_materiel: inventaire.materiel?.id || '',
      quantite_stock: inventaire.quantite_stock,
      seuil_alerte: inventaire.seuil_alerte,
      emplacement: inventaire.emplacement
    });
    setIsEditing(true);
    setEditingId(inventaire.id);
    setIsModalOpen(true);
  };

  const handleDelete = (inventaire) => {
    showConfirm(
      `Voulez-vous vraiment supprimer l'inventaire "${inventaire.materiel?.designation}" ?`,
      async () => {
        try {
          await deleteInventaire(inventaire.id);
          showSuccess('Inventaire supprimé avec succès !');
          fetchData();
        } catch (err) {
          console.error(err);
          if (err.response?.status === 500) {
            showError('Impossible de supprimer cet inventaire car il est lié à d\'autres enregistrements.');
          } else {
            showError('Erreur lors de la suppression');
          }
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({ 
      id_materiel: '', 
      quantite_stock: '',
      seuil_alerte: '',
      emplacement: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const getStockStatus = (inventaire) => {
    if (inventaire.quantite_disponible === 0) {
      return { color: 'bg-red-50 text-red-700 border-red-200', text: 'Rupture', icon: '🔴' };
    } else if (inventaire.quantite_disponible <= inventaire.seuil_alerte) {
      return { color: 'bg-orange-50 text-orange-700 border-orange-200', text: 'Stock bas', icon: '🟠' };
    } else {
      return { color: 'bg-green-50 text-green-700 border-green-200', text: 'Disponible', icon: '🟢' };
    }
  };

  const filteredInventaires = inventaires.filter(inventaire => {
    const matchSearch = inventaire.materiel?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventaire.materiel?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventaire.emplacement?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchSearch;
    if (filterStatus === 'rupture') return matchSearch && inventaire.quantite_disponible === 0;
    if (filterStatus === 'bas') return matchSearch && inventaire.quantite_disponible > 0 && inventaire.quantite_disponible <= inventaire.seuil_alerte;
    if (filterStatus === 'ok') return matchSearch && inventaire.quantite_disponible > inventaire.seuil_alerte;
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventaire</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Package size={18} className="text-purple-600" />
                Suivi des stocks et alertes
              </p>
            </div>
            <button 
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus size={20} />
              Nouveau
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMateriels}</p>
                  <p className="text-sm text-gray-600 font-medium">Matériels</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertTriangle className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.stockBas}</p>
                  <p className="text-sm text-gray-600 font-medium">Stock Bas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingUp className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.stockZero}</p>
                  <p className="text-sm text-gray-600 font-medium">Rupture</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.totalStock}</p>
                  <p className="text-sm text-gray-600 font-medium">Total Stock</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('inventaire')}
                className={`flex-1 py-4 px-6 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'inventaire'
                    ? 'border-purple-600 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                📦 Inventaire Complet
              </button>
              <button
                onClick={() => setActiveTab('alertes')}
                className={`flex-1 py-4 px-6 text-sm font-semibold border-b-2 transition-all relative ${
                  activeTab === 'alertes'
                    ? 'border-orange-600 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                ⚠️ Alertes Stock
                {alertesStockBas.length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {alertesStockBas.length}
                  </span>
                )}
              </button>
            </nav>
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
                  placeholder="Rechercher par matériel, ID ou emplacement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {activeTab === 'inventaire' && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none bg-white text-sm font-medium"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="ok">🟢 Disponible</option>
                  <option value="bas">🟠 Stock bas</option>
                  <option value="rupture">🔴 Rupture</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Contenu des Tabs */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <Loader className="animate-spin mx-auto text-purple-600 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Chargement des données...</p>
          </div>
        ) : activeTab === 'inventaire' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Matériel</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Réservé</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Disponible</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Seuil</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Emplacement</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredInventaires.map((inventaire, index) => {
                    const status = getStockStatus(inventaire);
                    return (
                      <tr key={inventaire.id} className={`hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">#{inventaire.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{inventaire.materiel?.designation}</div>
                            <div className="text-sm text-gray-500">{inventaire.materiel?.typeMateriel?.designation}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">{inventaire.quantite_stock}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-orange-600">{inventaire.quantite_reservee}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-green-600">{inventaire.quantite_disponible}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{inventaire.seuil_alerte}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${status.color}`}>
                            <span>{status.icon}</span>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{inventaire.emplacement}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEdit(inventaire)} 
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Modifier"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(inventaire)} 
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

            {filteredInventaires.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Package size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun inventaire trouvé</h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== 'all' ? 'Aucun résultat ne correspond à vos critères' : 'Commencez par créer un inventaire'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-orange-600 to-red-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Matériel</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Disponible</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Seuil</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Emplacement</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {alertesStockBas.map((inventaire, index) => {
                    const status = getStockStatus(inventaire);
                    return (
                      <tr key={inventaire.id} className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{inventaire.materiel?.designation}</div>
                            <div className="text-sm text-gray-500">{inventaire.materiel?.typeMateriel?.designation}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-orange-600">{inventaire.quantite_disponible}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{inventaire.seuil_alerte}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${status.color}`}>
                            <span>{status.icon}</span>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{inventaire.emplacement}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => handleEdit(inventaire)} 
                            className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all font-medium text-sm"
                            title="Réapprovisionner"
                          >
                            <Edit size={16} />
                            Modifier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {alertesStockBas.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <AlertTriangle size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">✅ Aucune alerte</h3>
                <p className="text-gray-500">Tous les stocks sont au-dessus des seuils d'alerte</p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }} 
          title={isEditing ? "Modifier l'Inventaire" : "Nouvel Inventaire"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isEditing && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Matériel *</label>
                <select
                  value={formData.id_materiel}
                  onChange={(e) => setFormData({ ...formData, id_materiel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  required
                >
                  <option value="">Choisir un matériel</option>
                  {materiels.map(materiel => (
                    <option key={materiel.id} value={materiel.id}>
                      {materiel.designation} - {materiel.typeMateriel?.designation}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantité Stock *</label>
                <input
                  type="number"
                  value={formData.quantite_stock}
                  onChange={(e) => setFormData({ ...formData, quantite_stock: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  min="0"
                  placeholder="Ex: 50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Seuil Alerte *</label>
                <input
                  type="number"
                  value={formData.seuil_alerte}
                  onChange={(e) => setFormData({ ...formData, seuil_alerte: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  min="0"
                  placeholder="Ex: 10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Emplacement *</label>
              <input
                type="text"
                value={formData.emplacement}
                onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="Ex: Rayon A3, Salle serveurs..."
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
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all shadow-md font-medium"
              >
                {isEditing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default InventaireList;
