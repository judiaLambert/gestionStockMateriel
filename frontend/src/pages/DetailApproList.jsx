import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, BarChart3, X } from 'lucide-react';
import { 
  getDetailApprovisionnements, 
  addDetailApprovisionnement, 
  updateDetailApprovisionnement, 
  deleteDetailApprovisionnement,
  getStatsByApprovisionnement 
} from '../api/detailapproAPI';
import { getMateriels } from '../api/materielAPI';
import { getApprovisionnements } from '../api/approvisionnementAPI';

const DetailApprovisionnementList = () => {
  const [details, setDetails] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [approvisionnements, setApprovisionnements] = useState([]);
  const [stats, setStats] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppro, setSelectedAppro] = useState('');
  const [selectedApprovisionnement, setSelectedApprovisionnement] = useState(null);
  const [formData, setFormData] = useState({ 
    id: '', 
    id_materiel: '', 
    id_appro: '', 
    quantite_recu: '',
    prix_unitaire: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const [detRes, matRes, appRes] = await Promise.all([
        getDetailApprovisionnements(),
        getMateriels(),
        getApprovisionnements()
      ]);
      setDetails(detRes.data);
      setMateriels(matRes.data);
      setApprovisionnements(appRes.data);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAppro) {
      fetchStats(selectedAppro);
      const appro = approvisionnements.find(a => a.id === selectedAppro);
      setSelectedApprovisionnement(appro);
    } else {
      setStats(null);
    }
  }, [selectedAppro, approvisionnements]);

  const fetchStats = async (approId) => {
    try {
      const res = await getStatsByApprovisionnement(approId);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproChange = (approId) => {
    setSelectedAppro(approId);
    const appro = approvisionnements.find(a => a.id === approId);
    setSelectedApprovisionnement(appro);
    setFormData(prev => ({ ...prev, id_appro: approId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const prixFinal = selectedApprovisionnement?.acquisition?.typeAcquisition === 'Don' 
        ? (formData.prix_unitaire || 0)
        : formData.prix_unitaire;

      if (isEditing) {
        await updateDetailApprovisionnement(formData.id, {
          ...formData,
          prix_unitaire: prixFinal,
        });
      } else {
        await addDetailApprovisionnement({
          ...formData,
          prix_unitaire: prixFinal,
        });
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (detail) => {
    const appro = approvisionnements.find(a => a.id === detail.approvisionnement?.id);
    setFormData({
      id: detail.id,
      id_materiel: detail.materiel?.id || '',
      id_appro: detail.approvisionnement?.id || '',
      quantite_recu: detail.quantiteRecu,
      prix_unitaire: detail.prixUnitaire || ''
    });
    setSelectedAppro(detail.approvisionnement?.id);
    setSelectedApprovisionnement(appro);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (detail) => {
    if (confirm(`Supprimer le détail "${detail.id}" ?`)) {
      try {
        await deleteDetailApprovisionnement(detail.id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ id: '', id_materiel: '', id_appro: '', quantite_recu: '', prix_unitaire: '' });
    setSelectedApprovisionnement(null);
    setIsEditing(false);
  };

  const filteredDetails = details.filter(detail =>
    detail.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.materiel?.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.materiel?.typeMateriel?.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.approvisionnement?.id.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(detail => 
    !selectedAppro || detail.approvisionnement?.id === selectedAppro
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Détails Approvisionnements
              </h1>
            </div>
            <p className="text-gray-600 ml-14">listes des quantités et stocks</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium"
          >
            <Plus size={20} />
            Nouveau Détail
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par ID, matériel, approvisionnement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              />
            </div>
            
            <div>
              <select
                value={selectedAppro}
                onChange={(e) => handleApproChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-all bg-gray-50 cursor-pointer text-gray-700"
              >
                <option value="">Tous les approvisionnements</option>
                {approvisionnements.map(appro => (
                  <option key={appro.id} value={appro.id}>
                    {appro.id} - {appro.acquisition?.fournisseur?.nom}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1.5 ml-1">Filtrer par approvisionnement spécifique</p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {stats && selectedAppro && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white border border-emerald-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedAppro}</h3>
                    <p className="text-emerald-100 text-sm">
                      {selectedApprovisionnement?.acquisition?.typeAcquisition || 'Approvisionnement'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAppro('')}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-sm font-medium text-emerald-100">Quantité totale</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalQuantiteRecu}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-sm font-medium text-teal-100">Valeur totale</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalValeur)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tableau */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Matériel</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Appro.</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Qté Reçue</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Prix Unit.</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Valeur</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredDetails.map((detail, index) => (
                  <tr 
                    key={detail.id} 
                    className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        
                        <span className="text-sm font-semibold text-gray-900">{detail.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{detail.materiel?.designation}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{detail.approvisionnement?.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{detail.quantiteRecu}</span>
                    </td>
                    <td className="px-6 py-4">
                      {detail.prixUnitaire ? (
                        <span className="text-sm text-gray-700">{formatCurrency(detail.prixUnitaire)}</span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Gratuit</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-emerald-600">
                        {formatCurrency((detail.prixUnitaire || 0) * detail.quantiteRecu)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(detail)} 
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-150 font-medium"
                        >
                          <Edit size={16} />
                          {/* Modifier */}
                        </button>
                        <button 
                          onClick={() => handleDelete(detail)} 
                          className="text-red-600 hover:text-red-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-150 font-medium"
                        >
                          <Trash2 size={16} />
                         {/* supprimer */}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDetails.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
                <Package size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun détail trouvé</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || selectedAppro ? 'Aucun résultat pour cette recherche' : 'Commencez par ajouter votre premier détail'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Modifier le Détail" : "Nouveau Détail"}
              </h2>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Approvisionnement *</label>
                  <select
                    value={formData.id_appro}
                    onChange={(e) => handleApproChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                    required
                  >
                    <option value="">Sélectionnez un approvisionnement</option>
                    {approvisionnements.map(appro => (
                      <option key={appro.id} value={appro.id}>
                        {appro.id} - {appro.acquisition?.fournisseur?.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Matériel *</label>
                  <select
                    value={formData.id_materiel}
                    onChange={(e) => setFormData({ ...formData, id_materiel: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                    required
                  >
                    <option value="">Sélectionnez un matériel</option>
                    {materiels.map(materiel => (
                      <option key={materiel.id} value={materiel.id}>
                        {materiel.id} - {materiel.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantité reçue *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantite_recu}
                    onChange={(e) => setFormData({ ...formData, quantite_recu: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prix unitaire (MGA) {selectedApprovisionnement?.acquisition?.typeAcquisition === 'Don' && '(Optionnel)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.prix_unitaire}
                    onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                    placeholder={selectedApprovisionnement?.acquisition?.typeAcquisition === 'Don' ? "Laisser vide pour gratuit" : "Entrez le prix unitaire"}
                    required={selectedApprovisionnement?.acquisition?.typeAcquisition !== 'Don'}
                  />
                  {selectedApprovisionnement?.acquisition?.typeAcquisition === 'Don' && (
                    <p className="text-xs text-gray-500 mt-1.5">Pour les dons, ce champ est optionnel</p>
                  )}
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button 
                type="button" 
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-white transition-all font-medium"
              >
                Annuler
              </button>
              <button 
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                {isEditing ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailApprovisionnementList;