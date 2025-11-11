import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Users, Phone, Building } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError, showConfirm } from '../alerts.jsx';
import Modal from '../components/Modal';
import { getDepartements } from '../api/departementAPI';
import { getDemandeurs, addDemandeur, updateDemandeur, deleteDemandeur } from '../api/demandeurAPI';

const DemandeurList = () => {
  const [demandeurs, setDemandeurs] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    id_demandeur: '', 
    nom: '', 
    telephone: '', 
    id_departement: '' 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [demRes, depRes] = await Promise.all([getDemandeurs(), getDepartements()]);
      setDemandeurs(demRes.data);
      setDepartements(depRes.data);
    } catch (err) {
      console.error(err);
      showError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDemandeur(formData.id_demandeur, {
          nom: formData.nom,
          telephone: formData.telephone,
          id_departement: formData.id_departement
        });
        showSuccess(`Demandeur "${formData.nom}" modifié avec succès !`);
      } else {
        await addDemandeur({
          nom: formData.nom,
          telephone: formData.telephone,
          id_departement: formData.id_departement
        });
        showSuccess(`Demandeur "${formData.nom}" ajouté avec succès !`);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showError(
        isEditing 
          ? 'Erreur lors de la modification du demandeur' 
          : 'Erreur lors de l\'ajout du demandeur'
      );
    }
  };

  const handleEdit = (demandeur) => {
    setFormData({
      id_demandeur: demandeur.id_demandeur,
      nom: demandeur.nom,
      telephone: demandeur.telephone,
      id_departement: demandeur.departement?.num_salle || '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (demandeur) => {
    showConfirm(
      `Voulez-vous vraiment supprimer le demandeur "${demandeur.nom}" ?`,
      async () => {
        try {
          await deleteDemandeur(demandeur.id_demandeur);
          showSuccess(`Demandeur "${demandeur.nom}" supprimé avec succès !`);
          fetchData();
        } catch (err) {
          console.error(err);
          if (err.response?.status === 500) {
            showError(
              `Impossible de supprimer "${demandeur.nom}" car il est lié à d'autres enregistrements.`
            );
          } else {
            showError('Erreur lors de la suppression du demandeur');
          }
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({ 
      id_demandeur: '', 
      nom: '', 
      telephone: '', 
      id_departement: '' 
    });
    setIsEditing(false);
  };

  const filteredDemandeurs = demandeurs.filter(d =>
    d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id_demandeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.departement?.nom_service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Demandeurs</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Users size={18} className="text-purple-600" />
                Gestion des demandeurs de matériel
              </p>
            </div>
            <button 
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus size={20} />
              Nouveau
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{demandeurs.length}</p>
              <p className="text-sm text-gray-600 font-medium">Demandeurs enregistrés</p>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, ID ou département..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin mx-auto w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Département</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredDemandeurs.map((demandeur, index) => (
                    <tr 
                      key={demandeur.id_demandeur} 
                      className={`hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold border border-purple-200">
                          {demandeur.id_demandeur}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {demandeur.nom.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{demandeur.nom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone size={14} className="text-gray-400" />
                          {demandeur.telephone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">{demandeur.departement?.nom_service || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEdit(demandeur)} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(demandeur)} 
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
          )}

          {!loading && filteredDemandeurs.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun demandeur trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun résultat ne correspond à votre recherche' : 'Commencez par ajouter un demandeur'}
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
        title={isEditing ? "Modifier Demandeur" : "Nouveau Demandeur"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder="Ex: Jean Dupont"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder="Ex: +261 34 12 345 67"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Département *</label>
            <select
              value={formData.id_departement}
              onChange={(e) => setFormData({ ...formData, id_departement: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              required
            >
              <option value="">Sélectionnez un département</option>
              {departements.map(dep => (
                <option key={dep.num_salle} value={dep.num_salle}>
                  {dep.num_salle} - {dep.nom_service}
                </option>
              ))}
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
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all shadow-md font-medium"
            >
              {isEditing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DemandeurList;
