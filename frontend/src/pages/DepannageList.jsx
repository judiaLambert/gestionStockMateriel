import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Wrench, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { 
  getDepannages, 
  addDepannage, 
  updateDepannage, 
  deleteDepannage,
  updateDepannageStatut 
} from '../api/depannageAPI';
import { getMateriels } from '../api/materielAPI';
import { getDemandeurs } from '../api/demandeurAPI';
import { showSuccess, showError, showConfirm } from '../alerts';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const DepannageList = () => {
  const [depannages, setDepannages] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [demandeurs, setDemandeurs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    id_materiel: '', 
    id_demandeur: '', 
    date_signalement: new Date().toISOString().split('T')[0],
    description_panne: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const statuts = [
    { value: 'Signalé', label: 'Signalé', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'En cours', label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'Résolu', label: 'Résolu', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'Irréparable', label: 'Irréparable', color: 'bg-red-100 text-red-800 border-red-200' },
  ];

  const fetchData = async () => {
    try {
      const [depannagesRes, materielsRes, demandeursRes] = await Promise.all([
        getDepannages(),
        getMateriels(),
        getDemandeurs()
      ]);
      setDepannages(depannagesRes.data);
      setMateriels(materielsRes.data);
      setDemandeurs(demandeursRes.data);
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
        await updateDepannage(editingId, formData);
        showSuccess('Dépannage modifié avec succès');
      } else {
        await addDepannage({
          ...formData,
          statut_depannage: 'Signalé' // Toujours Signalé pour les nouveaux
        });
        showSuccess('Dépannage créé avec succès');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (depannage) => {
    setFormData({
      id_materiel: depannage.materiel?.id || '',
      id_demandeur: depannage.demandeur?.id || '',
      date_signalement: depannage.date_signalement?.split('T')[0] || new Date().toISOString().split('T')[0],
      description_panne: depannage.description_panne || '',
    });
    setIsEditing(true);
    setEditingId(depannage.id);
    setIsModalOpen(true);
  };

  const handleStatutChange = async (id, nouveauStatut) => {
    try {
      await updateDepannageStatut(id, nouveauStatut);
      showSuccess('Statut mis à jour');
      
      // Met à jour l'état local immédiatement
      setDepannages(prev => prev.map(dep => 
        dep.id === id ? { ...dep, statut_depannage: nouveauStatut } : dep
      ));
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
      // Recharge les données pour éviter les incohérences
      fetchData();
    }
  };

  const handleDelete = async (depannage) => {
    const result = await showConfirm(`Supprimer le dépannage #${depannage.id}?`);
    
    if (result.isConfirmed) {
      try {
        await deleteDepannage(depannage.id);
        showSuccess('Dépannage supprimé');
        fetchData();
      } catch (err) {
        showError(err.response?.data?.message || 'Impossible de supprimer');
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      id_materiel: '', 
      id_demandeur: '', 
      date_signalement: new Date().toISOString().split('T')[0],
      description_panne: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const filteredDepannages = depannages.filter(depannage =>
    depannage.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    depannage.materiel?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    depannage.demandeur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    depannage.demandeur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    depannage.description_panne?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatutColor = (statut) => {
    const statutObj = statuts.find(s => s.value === statut);
    return statutObj?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'Signalé': return <AlertTriangle size={16} />;
      case 'En cours': return <Wrench size={16} />;
      case 'Résolu': return <CheckCircle size={16} />;
      case 'Irréparable': return <XCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Dépannages</h1>
            <p className="text-gray-600">Signalez et gérez les pannes de matériel</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
          >
            <Plus size={20} />
            Nouveau Dépannage
          </button>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par ID, matériel, demandeur ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matériel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demandeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Signalement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDepannages.map((depannage) => (
                <tr key={depannage.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wrench size={16} className="text-orange-600" />
                      <span className="font-medium">{depannage.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {depannage.materiel?.designation}
                    </div>
                    <div className="text-sm text-gray-500">
                      {depannage.materiel?.marque}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {depannage.demandeur?.nom} {depannage.demandeur?.prenom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {depannage.demandeur?.service}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{formatDate(depannage.date_signalement)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {depannage.description_panne}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={depannage.statut_depannage}
                      onChange={(e) => handleStatutChange(depannage.id, e.target.value)}
                      className={`text-xs font-medium border rounded px-2 py-1 cursor-pointer focus:ring-2 focus:ring-orange-500 ${getStatutColor(depannage.statut_depannage)}`}
                    >
                      {statuts.map(statut => (
                        <option key={statut.value} value={statut.value}>
                          {statut.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(depannage)} 
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="Modifier les informations"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(depannage)} 
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDepannages.length === 0 && (
            <div className="text-center py-12">
              <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun dépannage trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun dépannage ne correspond à votre recherche' : 'Commencez par signaler votre premier dépannage'}
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={isEditing ? "Modifier le Dépannage" : "Nouveau Dépannage"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Demandeur *</label>
                <select
                  value={formData.id_demandeur}
                  onChange={(e) => setFormData({ ...formData, id_demandeur: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Choisir un demandeur</option>
                  {demandeurs.map(demandeur => (
                    <option key={demandeur.id} value={demandeur.id}>
                      {demandeur.nom} {demandeur.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matériel *</label>
                <select
                  value={formData.id_materiel}
                  onChange={(e) => setFormData({ ...formData, id_materiel: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Choisir un matériel</option>
                  {materiels.map(materiel => (
                    <option key={materiel.id} value={materiel.id}>
                      {materiel.designation} - {materiel.marque}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Signalement *</label>
              <input
                type="date"
                value={formData.date_signalement}
                onChange={(e) => setFormData({ ...formData, date_signalement: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description de la panne *</label>
              <textarea
                value={formData.description_panne}
                onChange={(e) => setFormData({ ...formData, description_panne: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                placeholder="Décrivez la panne en détail..."
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
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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

export default DepannageList;