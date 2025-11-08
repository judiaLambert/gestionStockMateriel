import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/Table';
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
      } else {
        await addEtatMateriel({
          designation: formData.designation,
          description: formData.description
        });
      }
      setIsModalOpen(false);
      setFormData({ id: '', designation: '', description: '' });
      setIsEditing(false);
      fetchEtats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      id: row.id,
      designation: row.designation,
      description: row.description
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (confirm(`Supprimer l'état "${row.designation}" ?`)) {
      try {
        await deleteEtatMateriel(row.id);
        fetchEtats();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const headers = ['ID', 'Désignation État', 'Description'];

  const tableData = etatsMateriel.map(em => ({
    id: em.id,
    designation: em.designation,
    description: em.description || 'Aucune description'
  }));

  return (
    <div className="space-y-6">
      {/* Header et bouton */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des États Matériel</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Ajouter un État
        </button>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un état matériel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        headers={headers}
        data={tableData.filter(em => 
          em.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          em.description.toLowerCase().includes(searchTerm.toLowerCase())
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
          setFormData({ id: '', designation: '', description: '' });
        }}
        title={isEditing ? "Modifier État Matériel" : "Ajouter État Matériel"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Désignation État</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Ex: Neuf, Bon état, À réparer, Hors service"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Description détaillée de l'état"
              rows="4"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg">
              {isEditing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EtatMaterielList;