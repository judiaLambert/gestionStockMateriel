import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Building2, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import {
  getDepartements,
  addDepartement,
  updateDepartement,
  deleteDepartement,
} from '../api/departementAPI';
import { getTypesDepartement } from '../api/typeDepAPI';

const DepartementList = () => {
  const [departements, setDepartements] = useState([]);
  const [typesDepartement, setTypesDepartement] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id_departement: '',
    num_salle: '',
    id_typedepartement: '',
    nom_service: '',
  });

  const fetchDepartements = async () => {
    try {
      const res = await getDepartements();
      setDepartements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTypesDepartement = async () => {
    try {
      const res = await getTypesDepartement();
      setTypesDepartement(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartements();
    fetchTypesDepartement();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDepartement(formData.id_departement, {
          num_salle: formData.num_salle,
          id_typedepartement: formData.id_typedepartement,
          nom_service: formData.nom_service,
        });
      } else {
        await addDepartement({
          id_departement: formData.id_departement,
          num_salle: formData.num_salle,
          id_typedepartement: formData.id_typedepartement,
          nom_service: formData.nom_service,
        });
      }
      setIsModalOpen(false);
      setIsEditing(false);
      setFormData({ id_departement: '', num_salle: '', id_typedepartement: '', nom_service: '' });
      fetchDepartements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (dept) => {
    setFormData({
      id_departement: dept.id_departement,
      num_salle: dept.num_salle,
      id_typedepartement: dept.typeDepartement?.id || '',
      nom_service: dept.nom_service,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (dept) => {
    if (confirm(`Supprimer le département "${dept.nom_service}" ?`)) {
      try {
        await deleteDepartement(dept.id_departement);
        fetchDepartements();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredDepartements = departements.filter(
    (dept) =>
      dept.nom_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.id_departement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.num_salle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header avec lien Type Département */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              Gestion des Départements
            </h1>
            
            {/* Lien rapide Type Département */}
            <Link
              to="/type-departement"
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium border border-purple-200 inline-flex"
            >
              <Layers size={16} />
              Gérer les Types de Département
            </Link>
          </div>
          
          <button
            onClick={() => {
              setIsEditing(false);
              setFormData({ id_departement: '', num_salle: '', id_typedepartement: '', nom_service: '' });
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium"
          >
            <Plus size={20} />
            Nouveau Département
          </button>
        </div>

        {/* Carte de recherche */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex-1 w-full max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un département par nom, ID ou numéro de salle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Tableau moderne */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    ID Département
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Numéro Salle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Nom du Service
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredDepartements.map((dept, index) => (
                  <tr
                    key={dept.id_departement}
                    className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{dept.id_departement}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200">
                        {dept.num_salle}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {dept.typeDepartement?.nom || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{dept.nom_service}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(dept)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-150 font-medium"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(dept)}
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

          {filteredDepartements.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
                <Search size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun département trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun département ne correspond à votre recherche' : 'Commencez par ajouter votre premier département'}
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
          setFormData({ id_departement: '', num_salle: '', id_typedepartement: '', nom_service: '' });
        }}
        title={isEditing ? 'Modifier le Département' : 'Nouveau Département'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isEditing && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID Département
              </label>
              <input
                type="text"
                value={formData.id_departement}
                onChange={(e) => setFormData({ ...formData, id_departement: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                placeholder="Ex: DEPT-001"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Numéro de Salle
            </label>
            <input
              type="text"
              value={formData.num_salle}
              onChange={(e) => setFormData({ ...formData, num_salle: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              placeholder="Ex: A101, B205"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type de Département
            </label>
            <select
              value={formData.id_typedepartement}
              onChange={(e) => setFormData({ ...formData, id_typedepartement: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              required
            >
              <option value="">Sélectionnez un type</option>
              {typesDepartement.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du Service
            </label>
            <input
              type="text"
              value={formData.nom_service}
              onChange={(e) => setFormData({ ...formData, nom_service: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              placeholder="Ex: Service Informatique"
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

export default DepartementList;
