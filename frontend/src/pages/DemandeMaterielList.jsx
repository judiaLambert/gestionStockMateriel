import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, User, FileText } from 'lucide-react';
import Modal from '../components/Modal';
import { 
  getDemandes, 
  addDemande, 
  updateDemande, 
  deleteDemande 
} from '../api/demandematerielAPI';
import { getDemandeurs } from '../api/demandeurAPI';

const DemandeMaterielList = () => {
  const [demandes, setDemandes] = useState([]);
  const [demandeurs, setDemandeurs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    id_demandeur: '', 
    date_demande: new Date().toISOString().split('T')[0],
    raison_demande: '' 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      const [demandesRes, demandeursRes] = await Promise.all([
        getDemandes(),
        getDemandeurs()
      ]);
      setDemandes(demandesRes.data);
      setDemandeurs(demandeursRes.data);
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
        await updateDemande(editingId, formData);
      } else {
        await addDemande(formData);
      }
      setIsModalOpen(false);
      setFormData({ 
        id_demandeur: '', 
        date_demande: new Date().toISOString().split('T')[0],
        raison_demande: '' 
      });
      setIsEditing(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (demande) => {
    setFormData({
      id_demandeur: demande.demandeur?.id || '',
      date_demande: demande.date_demande.split('T')[0],
      raison_demande: demande.raison_demande
    });
    setIsEditing(true);
    setEditingId(demande.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (demande) => {
    if (confirm(`Supprimer la demande "${demande.id}" ?`)) {
      try {
        await deleteDemande(demande.id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredDemandes = demandes.filter(demande =>
    demande.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.demandeur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.demandeur?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.raison_demande.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.date_demande.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (dateDemande) => {
    const today = new Date();
    const demandeDate = new Date(dateDemande);
    const diffTime = today - demandeDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'bg-green-50 text-green-700 border-green-200';
    if (diffDays <= 3) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (diffDays <= 7) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Demandes de Matériel
              </h1>
            </div>
            
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium"
          >
            <Plus size={20} />
            Nouvelle Demande
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
                  placeholder="Rechercher par ID, demandeur, raison..."
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
                    ID Demande
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Demandeur
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Date Demande
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Raison
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredDemandes.map((demande, index) => (
                  <tr 
                    key={demande.id} 
                    className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        
                        <span className="text-sm font-semibold text-gray-900">{demande.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {demande.demandeur?.nom} {demande.demandeur?.prenom}
                          </span>
                          <span className="text-xs text-gray-500">{demande.demandeur?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                       
                        <span className="text-sm text-gray-700">{formatDate(demande.date_demande)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                        {demande.raison_demande}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(demande.date_demande)}`}>
                        {new Date(demande.date_demande) > new Date() ? 'Future' : 'En cours'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(demande)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-150 font-medium"
                        >
                          <Edit size={16} />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(demande)}
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

          {filteredDemandes.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
                <Search size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'Aucune demande ne correspond à votre recherche' : 'Commencez par ajouter votre première demande de matériel'}
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
          setFormData({ 
            id_demandeur: '', 
            date_demande: new Date().toISOString().split('T')[0],
            raison_demande: '' 
          });
        }}
        title={isEditing ? "Modifier la Demande" : "Nouvelle Demande de Matériel"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Demandeur</label>
            <select
              value={formData.id_demandeur}
              onChange={(e) => setFormData({ ...formData, id_demandeur: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              required
            >
              <option value="">Sélectionnez un demandeur</option>
              {demandeurs.map(demandeur => (
                <option key={demandeur.id} value={demandeur.id}>
                  {demandeur.nom} {demandeur.prenom} - {demandeur.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date de demande</label>
            <input
              type="date"
              value={formData.date_demande}
              onChange={(e) => setFormData({ ...formData, date_demande: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Raison de la demande</label>
            <textarea
              value={formData.raison_demande}
              onChange={(e) => setFormData({ ...formData, raison_demande: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              rows="4"
              placeholder="Décrivez la raison de votre demande de matériel..."
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

export default DemandeMaterielList;