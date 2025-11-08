import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import Modal from '../components/Modal';
import { 
  getApprovisionnements, 
  addApprovisionnement, 
  updateApprovisionnement, 
  deleteApprovisionnement 
} from '../api/approvisionnementAPI';
import { getAcquisitions } from '../api/acquisitionAPI';

const ApprovisionnementList = () => {
  const [approvisionnements, setApprovisionnements] = useState([]);
  const [acquisitions, setAcquisitions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      const [appRes, acqRes] = await Promise.all([
        getApprovisionnements(),
        getAcquisitions()
      ]);
      setApprovisionnements(appRes.data);
      setAcquisitions(acqRes.data);
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

  const filteredApprovisionnements = approvisionnements.filter(approvisionnement =>
    approvisionnement.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approvisionnement.acquisition?.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approvisionnement.acquisition?.fournisseur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approvisionnement.dateApprovisionnement.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approvisionnement.recu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approvisionnement.noteApprovisionnement?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                liste des Approvisionnements
              </h1>
            </div>
            
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium"
          >
            <Plus size={20} />
            Nouvel Approvisionnement
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
                  placeholder="Rechercher par ID, acquisition, reçu, observation..."
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
                    ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Acquisition
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Reçu
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Observation
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredApprovisionnements.map((approvisionnement, index) => (
                  <tr 
                    key={approvisionnement.id} 
                    className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        
                        <span className="text-sm font-semibold text-gray-900">{approvisionnement.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{approvisionnement.acquisition?.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{formatDate(approvisionnement.dateApprovisionnement)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{truncateText(approvisionnement.recu)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{truncateText(approvisionnement.noteApprovisionnement)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(approvisionnement)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-150 font-medium"
                        >
                          <Edit size={16} />
                          {/* supprimer */}
                        </button>
                        <button
                          onClick={() => handleDelete(approvisionnement)}
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

          {filteredApprovisionnements.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
                <Search size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun approvisionnement trouvé</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'Aucun approvisionnement ne correspond à votre recherche' : 'Commencez par ajouter votre premier approvisionnement'}
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
          setFormData({ 
            id: '', 
            id_acquisition: '', 
            date_approvisionnement: '',
            recu: '',
            note_approvisionnement: ''
          });
          setSelectedAcquisition(null);
        }}
        title={isEditing ? "Modifier l'Approvisionnement" : "Nouvel Approvisionnement"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Acquisition</label>
            <select
              value={formData.id_acquisition}
              onChange={(e) => handleAcquisitionChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              required
            />
          </div>

          {selectedAcquisition && selectedAcquisition.typeAcquisition !== 'Don' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reçu (Bon de livraison) *
              </label>
              <input
                type="text"
                value={formData.recu}
                onChange={(e) => setFormData({ ...formData, recu: e.target.value })}
                placeholder="Ex: BL-2024-001, Facture F2024-123..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Numéro du bon de livraison ou de la facture
              </p>
            </div>
          )}

          {selectedAcquisition && selectedAcquisition.typeAcquisition === 'Don' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reçu (Optionnel)
              </label>
              <input
                type="text"
                value={formData.recu}
                onChange={(e) => setFormData({ ...formData, recu: e.target.value })}
                placeholder="Ex: Reçu donation, Attestation..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pour les dons, ce champ est optionnel
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observations
            </label>
            <textarea
              value={formData.note_approvisionnement}
              onChange={(e) => setFormData({ ...formData, note_approvisionnement: e.target.value })}
              placeholder="Notes sur la livraison..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all bg-gray-50"
            />
          </div>

          <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 -mx-6 -mb-6 px-6 pb-6">
            <div className="flex justify-end gap-3">
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
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ApprovisionnementList;