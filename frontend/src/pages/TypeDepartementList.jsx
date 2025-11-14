import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, ArrowLeft, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showSuccess, showError, showConfirm } from '../alerts.jsx';
import Modal from '../components/Modal';
import { 
  getTypesDepartement, 
  addTypeDepartement, 
  updateTypeDepartement, 
  deleteTypeDepartement, 
} from '../api/typeDepAPI';

const TypeDepartementList = () => {
  const [typesDepartement, setTypesDepartement] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ nom: '' });

  const fetchTypes = async () => {
    try {
      const res = await getTypesDepartement();
      setTypesDepartement(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      showError('Erreur lors du chargement des types de département');
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateTypeDepartement(formData.id_typedepartement, { nom: formData.nom });
        showSuccess('Type de département mis à jour avec succès !');
      } else {
        await addTypeDepartement({ nom: formData.nom });
        showSuccess('Type de département ajouté avec succès !');
      }
      setIsModalOpen(false);
      setIsEditing(false);
      setFormData({ nom: '' });
      fetchTypes();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      showError('Erreur lors de l\'enregistrement du type');
    }
  };

  const handleEdit = (row) => {
    setFormData(row);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    const confirmed = await showConfirm(
      `Êtes-vous sûr de vouloir supprimer "${row.nom}" ?`,
      'Cette action est irréversible'
    );
    
    if (confirmed) {
      try {
        await deleteTypeDepartement(row.id_typedepartement);
        showSuccess('Type de département supprimé avec succès !');
        fetchTypes();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        showError('Erreur lors de la suppression du type');
      }
    }
  };

  const filteredTypes = typesDepartement.filter(td => 
    td.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    td.id_typedepartement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent mb-3">
              Types de Département
            </h1>
            
            <Link
              to="/departement"
              className="inlineflex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium border border-emerald-200 inline-flex"
            >
              <ArrowLeft size={16} />
              Retour aux Départements
            </Link>
          </div>
          
          <button
            onClick={() => {
              setIsEditing(false);
              setFormData({ nom: '' });
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium"
          >
            <Plus size={20} />
            Nouveau Type
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex-1 w-full max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un type par nom ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    ID Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Nom du Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredTypes.map((type, index) => (
                  <tr
                    key={type.id_typedepartement}
                    className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-sm font-semibold border border-purple-200">
                        {type.id_typedepartement}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{type.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(type)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-150 font-medium"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(type)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-150 font-medium"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTypes.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mb-4">
                <Search size={32} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun type trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun type ne correspond à votre recherche' : 'Commencez par ajouter votre premier type'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setFormData({ nom: '' });
        }}
        title={isEditing ? 'Modifier le Type' : 'Nouveau Type de Département'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du Type
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50"
              placeholder="Ex: Académique, Administratif, Technique"
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
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              {isEditing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TypeDepartementList;
