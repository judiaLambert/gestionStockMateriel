import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/Table';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ id: '', nom: '' });

  // Récupérer les données du backend
  const fetchTypes = async () => {
    try {
      const res = await getTypesDepartement();
      setTypesDepartement(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // Ajouter ou mettre à jour
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateTypeDepartement(formData.id, { nom: formData.nom });
      } else {
        await addTypeDepartement({ nom: formData.nom });
      }
      setIsModalOpen(false);
      setFormData({ id: '', nom: '' });
      fetchTypes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (row) => {
    setFormData(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (confirm(`Supprimer "${row.nom}" ?`)) {
      try {
        await deleteTypeDepartement(row.id);
        fetchTypes();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const headers = ['ID', 'Nom'];

  return (
    <div className="space-y-6">
      {/* Header et bouton */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Types de Département</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Ajouter un Type
        </button>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        headers={headers}
        data={typesDepartement.filter(td => td.nom.toLowerCase().includes(searchTerm.toLowerCase()))}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ id: '', nom: '', description: '' });
        }}
        title={formData.id ? "Modifier Type de Département" : "Ajouter Type de Département"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Ex: Académique, Administratif, Technique"
              required
            />
          </div>

          

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              {formData.id ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TypeDepartementList;
