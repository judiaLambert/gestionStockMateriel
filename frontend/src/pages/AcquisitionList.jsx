import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, Building, ShoppingCart, Gift, CreditCard, Home, Wrench, TrendingUp, Filter } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError, showConfirm } from '../alerts.jsx';
import Modal from '../components/Modal';
import { 
  getAcquisitions, 
  addAcquisition, 
  updateAcquisition, 
  deleteAcquisition 
} from '../api/acquisitionAPI';
import { getFournisseurs } from '../api/fournisseurAPI';

const AcquisitionList = () => {
  const [acquisitions, setAcquisitions] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({ 
    id: '', 
    id_fournisseur: '', 
    date_acquisition: new Date().toISOString().split('T')[0],
    type_acquisition: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const [acqRes, fourRes] = await Promise.all([
        getAcquisitions(),
        getFournisseurs()
      ]);
      setAcquisitions(acqRes.data);
      setFournisseurs(fourRes.data);
    } catch (err) {
      console.error(err);
      showError('Impossible de charger les acquisitions');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateAcquisition(formData.id, formData);
        showSuccess(`Acquisition "${formData.id}" modifiée avec succès !`);
      } else {
        await addAcquisition(formData);
        showSuccess('Nouvelle acquisition ajoutée avec succès !');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showError(
        isEditing 
          ? 'Erreur lors de la modification de l\'acquisition' 
          : 'Erreur lors de l\'ajout de l\'acquisition'
      );
    }
  };

  const handleEdit = (acquisition) => {
    setFormData({
      id: acquisition.id,
      id_fournisseur: acquisition.fournisseur?.id || '',
      date_acquisition: acquisition.dateAcquisition.split('T')[0],
      type_acquisition: acquisition.typeAcquisition
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (acquisition) => {
    showConfirm(
      `Voulez-vous vraiment supprimer l'acquisition "${acquisition.id}" ?`,
      async () => {
        try {
          await deleteAcquisition(acquisition.id);
          showSuccess(`Acquisition "${acquisition.id}" supprimée avec succès !`);
          fetchData();
        } catch (err) {
          console.error(err);
          if (err.response?.status === 500 && err.response?.data?.message?.includes('approvisionnement')) {
            showError(
              `Impossible de supprimer cette acquisition car elle est liée à des approvisionnements existants.`
            );
          } else {
            showError('Erreur lors de la suppression de l\'acquisition');
          }
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({ 
      id: '', 
      id_fournisseur: '', 
      date_acquisition: new Date().toISOString().split('T')[0],
      type_acquisition: '' 
    });
    setIsEditing(false);
  };

  const filteredAcquisitions = acquisitions.filter(acquisition => {
    const matchSearch = acquisition.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acquisition.fournisseur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acquisition.typeAcquisition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchType = filterType === 'all' || acquisition.typeAcquisition === filterType;
    
    return matchSearch && matchType;
  });

  const getTypeIcon = (type) => {
    const icons = {
      'Achat': <ShoppingCart size={16} />,
      'Don': <Gift size={16} />,
      'Location': <Home size={16} />,
      'Prêt': <CreditCard size={16} />,
      'Maintenance': <Wrench size={16} />
    };
    return icons[type] || <ShoppingCart size={16} />;
  };

  const getTypeColor = (type) => {
    const colors = {
      'Achat': 'bg-blue-50 text-blue-700 border-blue-200',
      'Don': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Location': 'bg-purple-50 text-purple-700 border-purple-200',
      'Prêt': 'bg-amber-50 text-amber-700 border-amber-200',
      'Maintenance': 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Statistiques
  const stats = {
    total: acquisitions.length,
    achat: acquisitions.filter(a => a.typeAcquisition === 'Achat').length,
    don: acquisitions.filter(a => a.typeAcquisition === 'Don').length,
    moisEnCours: acquisitions.filter(a => {
      const date = new Date(a.dateAcquisition);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Acquisitions</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <ShoppingCart size={18} className="text-indigo-600" />
                Gestion des acquisitions de matériel
              </p>
            </div>
            <button 
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus size={20} />
              Nouveau
            </button>
          </div>
        </div>

        {/* Cards statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <TrendingUp className="text-indigo-600" size={24} />
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
                <ShoppingCart className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.achat}</p>
                <p className="text-sm text-gray-600 font-medium">Achats</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Gift className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.don}</p>
                <p className="text-sm text-gray-600 font-medium">Dons</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.moisEnCours}</p>
                <p className="text-sm text-gray-600 font-medium">Ce mois</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche et filtre */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par ID, fournisseur ou type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none bg-white text-sm font-medium"
              >
                <option value="all">Tous les types</option>
                <option value="Achat">Achat</option>
                <option value="Don">Don</option>
                <option value="Location">Location</option>
                <option value="Prêt">Prêt</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Fournisseur</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAcquisitions.map((acquisition, index) => (
                  <tr 
                    key={acquisition.id} 
                    className={`hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{acquisition.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Building size={16} className="text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{acquisition.fournisseur?.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(acquisition.dateAcquisition)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getTypeColor(acquisition.typeAcquisition)}`}>
                        {getTypeIcon(acquisition.typeAcquisition)}
                        {acquisition.typeAcquisition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(acquisition)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(acquisition)}
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

          {filteredAcquisitions.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune acquisition trouvée</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' ? 'Aucun résultat ne correspond à votre recherche' : 'Commencez par ajouter une acquisition'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditing ? "Modifier l'Acquisition" : "Nouvelle Acquisition"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fournisseur *</label>
            <select
              value={formData.id_fournisseur}
              onChange={(e) => setFormData({ ...formData, id_fournisseur: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              required
            >
              <option value="">Sélectionnez un fournisseur</option>
              {fournisseurs.map(fournisseur => (
                <option key={fournisseur.id} value={fournisseur.id}>{fournisseur.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date d'acquisition *</label>
            <input
              type="date"
              value={formData.date_acquisition}
              onChange={(e) => setFormData({ ...formData, date_acquisition: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type d'acquisition *</label>
            <select
              value={formData.type_acquisition}
              onChange={(e) => setFormData({ ...formData, type_acquisition: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="Achat">🛒 Achat</option>
              <option value="Don">🎁 Don</option>
              <option value="Location">🏠 Location</option>
              <option value="Prêt">💳 Prêt</option>
              <option value="Maintenance">🔧 Maintenance</option>
            </select>
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
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md font-medium"
            >
              {isEditing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcquisitionList;
