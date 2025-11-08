import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getDepartements } from '../api/departementAPI';
import { getDemandeurs, addDemandeur, updateDemandeur, deleteDemandeur } from '../api/demandeurAPI';

const DemandeurList = () => {
  const [demandeurs, setDemandeurs] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ id: '', nom: '', telephone: '', id_departement: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const [demRes, depRes] = await Promise.all([getDemandeurs(), getDepartements()]);
      setDemandeurs(demRes.data);
      setDepartements(depRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDemandeur(formData.id, formData);
      } else {
        await addDemandeur(formData);
      }
      setIsModalOpen(false);
      setFormData({ id: '', nom: '', telephone: '', id_departement: '' });
      setIsEditing(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      id: row.id, // ← Utilisez 'id' ici
      nom: row.nom,
      telephone: row.telephone,
      id_departement: row.departement?.num_salle || '', // ← Accédez à num_salle
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (confirm(`Supprimer le demandeur "${row.nom}" ?`)) {
      try {
        await deleteDemandeur(row.id); // ← Utilisez 'id' ici
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const headers = ['ID', 'Nom', 'Téléphone', 'Département'];

  const tableData = demandeurs.map(d => ({
    id: d.id, // ← Utilisez 'id' ici
    nom: d.nom,
    telephone: d.telephone,
    departement: d.departement?.nom_service || 'N/A',
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Demandeurs</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Ajouter un Demandeur
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un demandeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <Table
        headers={headers}
        data={tableData.filter(d =>
          d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.telephone.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setFormData({ id: '', nom: '', telephone: '', id_departement: '' });
        }}
        title={isEditing ? 'Modifier Demandeur' : 'Ajouter Demandeur'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Téléphone</label>
            <input
              type="text"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Département</label>
            <select
              value={formData.id_departement}
              onChange={(e) => setFormData({ ...formData, id_departement: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
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

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              {isEditing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DemandeurList;