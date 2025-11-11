import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError, showConfirm } from '../alerts.jsx';
import Modal from '../components/Modal';
import { 
  getEtatsMateriel, 
  addEtatMateriel, 
  updateEtatMateriel, 
  deleteEtatMateriel, 
} from '../api/etatmaterielAPI';

const EtatMaterielList = () => {
  const [etatsMateriel, setEtatsMateriel] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    id: '', 
    designation: '', 
    description: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchEtats = async () => {
    try {
      const res = await getEtatsMateriel();
      setEtatsMateriel(res.data);
    } catch (err) {
      console.error(err);
      showError('Impossible de charger les états');
    }
  };

  useEffect(() => {
    fetchEtats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateEtatMateriel(formData.id, {
          designation: formData.designation,
          description: formData.description
        });
        showSuccess(`État "${formData.designation}" modifié avec succès !`);
      } else {
        await addEtatMateriel({
          designation: formData.designation,
          description: formData.description
        });
        showSuccess(`État "${formData.designation}" ajouté avec succès !`);
      }
      setIsModalOpen(false);
      resetForm();
      fetchEtats();
    } catch (err) {
      console.error(err);
      showError(
        isEditing 
          ? 'Erreur lors de la modification de l\'état' 
          : 'Erreur lors de l\'ajout de l\'état'
      );
    }
  };

  const handleEdit = (etat) => {
    setFormData({
      id: etat.id,
      designation: etat.designation,
      description: etat.description || ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (etat) => {
    showConfirm(
      `Voulez-vous vraiment supprimer l'état "${etat.designation}" ?`,
      async () => {
        try {
          await deleteEtatMateriel(etat.id);
          showSuccess(`État "${etat.designation}" supprimé avec succès !`);
          fetchEtats();
        } catch (err) {
          console.error(err);
          if (err.response?.status === 500) {
            showError(`Impossible de supprimer cet état car il est utilisé par des matériels.`);
          } else {
            showError('Erreur lors de la suppression de l\'état');
          }
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({ id: '', designation: '', description: '' });
    setIsEditing(false);
  };

  const filteredEtats = etatsMateriel.filter(em => 
    em.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    em.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header avec bouton retour */}
        <div className="mb-8">
          <Link 
            to="/materiel"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Retour aux Matériels
          </Link>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">États Matériel</h1>
              <p className="text-gray-600">Gestion des états des matériels</p>
            </div>
            <button 
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
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
              placeholder="Rechercher un état..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Désignation</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEtats.map((etat, index) => (
                <tr key={etat.id} className={`hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">{etat.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{etat.designation}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{etat.description || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(etat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Modifier">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(etat)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEtats.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun état trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun résultat ne correspond à votre recherche' : 'Commencez par ajouter un état'}
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
        title={isEditing ? "Modifier État" : "Nouvel État"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Désignation *</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Neuf, Bon état, À réparer..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Description de l'état"
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

export default EtatMaterielList;
