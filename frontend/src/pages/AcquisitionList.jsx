import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, Building, Package } from 'lucide-react';
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
      } else {
        await addAcquisition(formData);
      }
      setIsModalOpen(false);
      setFormData({ 
        id: '', 
        id_fournisseur: '', 
        date_acquisition: new Date().toISOString().split('T')[0],
        type_acquisition: '' 
      });
      setIsEditing(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (acquisition) => {
    setFormData({
      id: acquisition.id,
      id_fournisseur: acquisition.fournisseur?.id || '',
      date_acquisition: acquisition.dateAcquisition,
      type_acquisition: acquisition.typeAcquisition
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (acquisition) => {
    if (confirm(`Supprimer l'acquisition "${acquisition.id}" ?`)) {
      try {
        await deleteAcquisition(acquisition.id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredAcquisitions = acquisitions.filter(acquisition =>
    acquisition.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acquisition.fournisseur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acquisition.typeAcquisition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acquisition.dateAcquisition.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                liste des Acquisitions
              </h1>
            </div>
            
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium"
          >
            <Plus size={20} />
            Nouvelle Acquisition
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
                  placeholder="Rechercher par ID, fournisseur, type..."
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
                    ID Acquisition
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Fournisseur
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAcquisitions.map((acquisition, index) => (
                  <tr 
                    key={acquisition.id} 
                    className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div></div>
                        <span className="text-sm font-semibold text-gray-900">{acquisition.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          
                        </div>
                        <span className="text-sm font-medium text-gray-900">{acquisition.fournisseur?.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        
                        <span className="text-sm text-gray-700">{formatDate(acquisition.dateAcquisition)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getTypeColor(acquisition.typeAcquisition)}`}>
                        {acquisition.typeAcquisition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(acquisition)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-150 font-medium"
                        >
                          <Edit size={16} />
                         {/*  modifier*/}
                        </button>
                        <button
                          onClick={() => handleDelete(acquisition)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-150 font-medium"
                        >
                          <Trash2 size={16} />
                         {/*  Supprimer*/}
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
                <Search size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune acquisition trouvée</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'Aucune acquisition ne correspond à votre recherche' : 'Commencez par ajouter votre première acquisition'}
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
            id_fournisseur: '', 
            date_acquisition: new Date().toISOString().split('T')[0],
            type_acquisition: '' 
          });
        }}
        title={isEditing ? "Modifier l'Acquisition" : "Nouvelle Acquisition"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fournisseur</label>
            <select
              value={formData.id_fournisseur}
              onChange={(e) => setFormData({ ...formData, id_fournisseur: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              required
            >
              <option value="">Sélectionnez un fournisseur</option>
              {fournisseurs.map(fournisseur => (
                <option key={fournisseur.id} value={fournisseur.id}>{fournisseur.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date d'acquisition</label>
            <input
              type="date"
              value={formData.date_acquisition}
              onChange={(e) => setFormData({ ...formData, date_acquisition: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type d'acquisition</label>
            <select
              value={formData.type_acquisition}
              onChange={(e) => setFormData({ ...formData, type_acquisition: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="Achat">Achat</option>
              <option value="Don">Don</option>
              <option value="Location">Location</option>
              <option value="Prêt">Prêt</option>
              <option value="Maintenance">Maintenance</option>
            </select>
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

export default AcquisitionList;