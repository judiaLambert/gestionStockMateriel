import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, User, FileText } from 'lucide-react';
import Modal from '../components/Modal';
import { 
  getDetailDemandes, 
  addDetailDemande, 
  updateDetailDemande, 
  deleteDetailDemande 
} from '../api/detaildemandeAPI';
import { getMateriels } from '../api/materielAPI';
import { getDemandes } from '../api/demandematerielAPI';

const DetailDemandeList = () => {
  const [details, setDetails] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    id_materiel: '', 
    id_demande: '', 
    quantite_demander: '' 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      const [detailsRes, materielsRes, demandesRes] = await Promise.all([
        getDetailDemandes(),
        getMateriels(),
        getDemandes()
      ]);
      setDetails(detailsRes.data);
      setMateriels(materielsRes.data);
      setDemandes(demandesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDetailDemande(editingId, formData);
      } else {
        await addDetailDemande(formData);
      }
      setIsModalOpen(false);
      setFormData({ id_materiel: '', id_demande: '', quantite_demander: '' });
      setIsEditing(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (detail) => {
    setFormData({
      id_materiel: detail.materiel?.id || '',
      id_demande: detail.demandeMateriel?.id || '',
      quantite_demander: detail.quantite_demander?.toString() || ''
    });
    setIsEditing(true);
    setEditingId(detail.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (detail) => {
    if (confirm(`Supprimer le détail "${detail.id}" ?`)) {
      try {
        await deleteDetailDemande(detail.id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Fonction pour obtenir le nom du demandeur depuis la demande
  const getNomDemandeur = (detail) => {
    return detail.demandeMateriel?.demandeur 
      ? `${detail.demandeMateriel.demandeur.nom} ${detail.demandeMateriel.demandeur.prenom || ''}`
      : 'N/A';
  };

  const filteredDetails = details.filter(detail =>
    detail.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.materiel?.designation_materiel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getNomDemandeur(detail).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Détails des Demandes
              </h1>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium"
          >
            <Plus size={20} />
            Nouveau Détail
          </button>
        </div>

        {/* Carte de recherche */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par ID, matériel, demandeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tableau moderne */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    ID Détail
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Matériel
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Demandeur
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Quantité
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
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
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Package size={16} className="text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {detail.materiel?.designation}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <User size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {getNomDemandeur(detail)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Demande: {detail.demandeMateriel?.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {detail.quantite_demander} unités
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(detail)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-150 font-medium"
                        >
                          <Edit size={16} />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(detail)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-150 font-medium"
                        >
                          <Trash2 size={16} />
                          Supprimer
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
                <Search size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun détail trouvé</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'Aucun détail ne correspond à votre recherche' : 'Commencez par ajouter votre premier détail de demande'}
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
          setIsEditing(false);
          setEditingId(null);
          setFormData({ id_materiel: '', id_demande: '', quantite_demander: '' });
        }}
        title={isEditing ? "Modifier le Détail" : "Nouveau Détail de Demande"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Matériel</label>
            <select
              value={formData.id_materiel}
              onChange={(e) => setFormData({ ...formData, id_materiel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Demande</label>
            <select
              value={formData.id_demande}
              onChange={(e) => setFormData({ ...formData, id_demande: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              required
            >
              <option value="">Sélectionnez une demande</option>
              {demandes.map(demande => (
                <option key={demande.id} value={demande.id}>
                  Demande {demande.id} - {demande.demandeur?.nom} {demande.demandeur?.prenom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantité</label>
            <input
              type="number"
              value={formData.quantite_demander}
              onChange={(e) => setFormData({ ...formData, quantite_demander: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              min="1"
              placeholder="Entrez la quantité demandée"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              {isEditing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DetailDemandeList;