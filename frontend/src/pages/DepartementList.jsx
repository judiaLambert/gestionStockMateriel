import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/Table';
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

  // 🔹 Récupérer les départements
  const fetchDepartements = async () => {
    try {
      const res = await getDepartements();
      setDepartements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Récupérer les types de département
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

  //  Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Modification
        await updateDepartement(formData.id_departement, {
          num_salle: formData.num_salle,
          id_typedepartement: formData.id_typedepartement,
          nom_service: formData.nom_service,
        });
      } else {
        // Ajout
        await addDepartement({
          id_departement: formData.id_departement,
          num_salle: formData.num_salle,
          id_typedepartement: formData.id_typedepartement,
          nom_service: formData.nom_service,
        });
      }

      // Réinitialisation
      setIsModalOpen(false);
      setIsEditing(false);
      setFormData({ id_departement: '', num_salle: '', id_typedepartement: '', nom_service: '' });
      fetchDepartements();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Modifier un département
  const handleEdit = (row) => {
    setFormData({
      id_departement: row.id_departement,
      num_salle: row.num_salle,
      id_typedepartement: row.typeDepartement.id,
      nom_service: row.nom_service,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // 🔹 Supprimer un département
  const handleDelete = async (row) => {
    if (confirm(`Supprimer le département "${row.nom_service}" ?`)) {
      try {
        await deleteDepartement(row.id_departement);
        fetchDepartements();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 🔹 Colonnes du tableau
  const headers = ['ID Département', 'Num Salle', 'Type Département', 'Nom Service'];

  const tableData = departements.map((dept) => ({
    id_departement: dept.id_departement,
    num_salle: dept.num_salle,
    typeDepartement: dept.typeDepartement
      ? `${dept.typeDepartement.id} `
      : 'N/A',
    nom_service: dept.nom_service,
  }));

  return (
    <div className="space-y-6">
      {/* Titre et bouton */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Départements</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({ id_departement: '', num_salle: '', id_typedepartement: '', nom_service: '' });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Ajouter un Département
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un département..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Tableau */}
      <Table
        headers={headers}
        data={tableData.filter(
          (dept) =>
            dept.nom_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.id_departement.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.num_salle.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setFormData({ num_salle: '', id_typedepartement: '', nom_service: '' });
        }}
        title={isEditing ? 'Modifier Département' : 'Ajouter Département'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de Salle
            </label>
            <input
              type="text"
              value={formData.num_salle}
              onChange={(e) =>
                setFormData({ ...formData, num_salle: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Ex: A101, B205"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de Département
            </label>
            <select
              value={formData.id_typedepartement}
              onChange={(e) =>
                setFormData({ ...formData, id_typedepartement: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="">Sélectionnez un type</option>
              {typesDepartement.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.id} - {type.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du Service
            </label>
            <input
              type="text"
              value={formData.nom_service}
              onChange={(e) =>
                setFormData({ ...formData, nom_service: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Ex: Informatique, Ressources Humaines"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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