import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
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
import { showSuccess, showError, showConfirm } from '../alerts';

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

  const fetchData = async () => {
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
      showError('Impossible de charger les données');
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
        showSuccess('Inventaire modifié avec succès');
      } else {
        await addInventaire({
          id_materiel: formData.id_materiel,
          quantite_stock: parseInt(formData.quantite_stock),
          seuil_alerte: parseInt(formData.seuil_alerte),
          emplacement: formData.emplacement
        });
        showSuccess('Inventaire créé avec succès');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
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

  const handleDelete = async (inventaire) => {
    const result = await showConfirm(`Supprimer l'inventaire #${inventaire.id}?`);
    
    if (result.isConfirmed) {
      try {
        await deleteInventaire(inventaire.id);
        showSuccess('Inventaire supprimé');
        fetchData();
      } catch (err) {
        showError(err.response?.data?.message || 'Impossible de supprimer');
      }
    }
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
      return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Rupture' };
    } else if (inventaire.quantite_disponible <= inventaire.seuil_alerte) {
      return { color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'Stock bas' };
    } else {
      return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Disponible' };
    }
  };

  const filteredInventaires = inventaires.filter(inventaire =>
    inventaire.materiel?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inventaire.materiel?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inventaire.emplacement?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion de l'Inventaire</h1>
            <p className="text-gray-600">Suivi du stock et alertes</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Nouvel Inventaire
          </button>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Matériels</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMateriels}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stock Bas</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.stockBas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingUp className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rupture</p>
                  <p className="text-2xl font-bold text-red-600">{stats.stockZero}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Stock</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalStock}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('inventaire')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'inventaire'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Inventaire Complet
              </button>
              <button
                onClick={() => setActiveTab('alertes')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'alertes'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Alertes Stock Bas
                {alertesStockBas.length > 0 && (
                  <span className="ml-2 bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                    {alertesStockBas.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par matériel, ID ou emplacement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contenu des Tabs */}
        {activeTab === 'inventaire' && (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matériel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réservé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seuil</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emplacement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventaires.map((inventaire) => {
                  const status = getStockStatus(inventaire);
                  return (
                    <tr key={inventaire.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-blue-600" />
                          <span className="font-medium">{inventaire.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {inventaire.materiel?.designation}
                        </div>
                        <div className="text-sm text-gray-500">
                          {inventaire.materiel?.typeMateriel?.designation}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{inventaire.quantite_stock}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-orange-600 font-medium">{inventaire.quantite_reservee}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-medium">{inventaire.quantite_disponible}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{inventaire.seuil_alerte}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{inventaire.emplacement}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(inventaire)} 
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(inventaire)} 
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredInventaires.length === 0 && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun inventaire trouvé</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Aucun inventaire ne correspond à votre recherche' : 'Commencez par créer votre premier inventaire'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alertes' && (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Matériel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Stock Actuel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Seuil Alerte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Emplacement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {alertesStockBas.map((inventaire) => {
                  const status = getStockStatus(inventaire);
                  return (
                    <tr key={inventaire.id} className="hover:bg-orange-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {inventaire.materiel?.designation}
                        </div>
                        <div className="text-sm text-gray-500">
                          {inventaire.materiel?.typeMateriel?.designation}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-orange-600">{inventaire.quantite_disponible}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{inventaire.seuil_alerte}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{inventaire.emplacement}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleEdit(inventaire)} 
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Réapprovisionner"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {alertesStockBas.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle size={48} className="mx-auto text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte</h3>
                <p className="text-gray-500">Tous les stocks sont au-dessus des seuils d'alerte</p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={isEditing ? "Modifier l'Inventaire" : "Nouvel Inventaire"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matériel *</label>
                <select
                  value={formData.id_materiel}
                  onChange={(e) => setFormData({ ...formData, id_materiel: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Stock *</label>
                <input
                  type="number"
                  value={formData.quantite_stock}
                  onChange={(e) => setFormData({ ...formData, quantite_stock: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil Alerte *</label>
                <input
                  type="number"
                  value={formData.seuil_alerte}
                  onChange={(e) => setFormData({ ...formData, seuil_alerte: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement *</label>
              <input
                type="text"
                value={formData.emplacement}
                onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Rayon A3, Salle serveurs..."
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditing ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default InventaireList;