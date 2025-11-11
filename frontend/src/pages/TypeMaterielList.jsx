import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError, showConfirm } from '../alerts.jsx';
import Modal from '../components/Modal';
import { 
  getTypesMateriel, 
  addTypeMateriel, 
  updateTypeMateriel, 
  deleteTypeMateriel, 
} from '../api/typematerielAPI';

const TypeMaterielList = () => {
  const [typesMateriel, setTypesMateriel] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    id: '', 
    designation: '', 
    description: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchTypes = async () => {
    try {
      const res = await getTypesMateriel();
      setTypesMateriel(res.data);
    } catch (err) {
      console.error(err);
      showError('Impossible de charger les types');
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateTypeMateriel(formData.id, {
          designation: formData.designation,
          description: formData.description
        });
        showSuccess(`Type "${formData.designation}" modifié avec succès !`);
      } else {
        await addTypeMateriel({
          designation: formData.designation,
          description: formData.description
        });
        showSuccess(`Type "${formData.designation}" ajouté avec succès !`);
      }
      setIsModalOpen(false);
      resetForm();
      fetchTypes();
    } catch (err) {
      console.error(err);
      showError(
        isEditing 
          ? 'Erreur lors de la modification du type' 
          : 'Erreur lors de l\'ajout du type'
      );
    }
  };

  const handleEdit = (type) => {
    setFormData({
      id: type.id,
      designation: type.designation,
      description: type.description || ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (type) => {
    showConfirm(
      `Voulez-vous vraiment supprimer le type "${type.designation}" ?`,
      async () => {
        try {
          await deleteTypeMateriel(type.id);
          showSuccess(`Type "${type.designation}" supprimé avec succès !`);
          fetchTypes();
        } catch (err) {
          console.error(err);
          if (err.response?.status === 500) {
            showError(`Impossible de supprimer ce type car il est utilisé par des matériels.`);
          } else {
            showError('Erreur lors de la suppression du type');
          }
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({ id: '', designation: '', description: '' });
    setIsEditing(false);
  };

  const filteredTypes = typesMateriel.filter(tm => 
    tm.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tm.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header avec bouton retour */}
        <div className="mb-8">
          <Link 
            to="/materiel"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Retour aux Matériels
          </Link>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Types de Matériel</h1>
              <p className="text-gray-600">Gestion des catégories de matériels</p>
            </div>
            <button 
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }} 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Nouveau
            </button>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Désignation</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTypes.map((type, index) => (
                <tr key={type.id} className={`hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">{type.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{type.designation}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{type.description || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(type)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Modifier">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(type)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTypes.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun type trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun résultat ne correspond à votre recherche' : 'Commencez par ajouter un type'}
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
        title={isEditing ? "Modifier Type" : "Nouveau Type"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Désignation *</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ex: Ordinateur, Imprimante..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              placeholder="Description du type de matériel"
              rows="4"
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
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md font-medium"
            >
              {isEditing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TypeMaterielList;
