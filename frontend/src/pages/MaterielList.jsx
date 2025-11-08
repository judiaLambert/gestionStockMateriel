import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Box } from 'lucide-react';
import Modal from '../components/Modal';
import { 
  getMateriels, 
  addMateriel, 
  updateMateriel, 
  deleteMateriel 
} from '../api/materielAPI';
import { getEtatsMateriel } from '../api/etatmaterielAPI';
import { getTypesMateriel } from '../api/typematerielAPI';

const MaterielList = () => {
  const [materiels, setMateriels] = useState([]);
  const [etatsMateriel, setEtatsMateriel] = useState([]);
  const [typesMateriel, setTypesMateriel] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    id: '', 
    id_etatmateriel: '', 
    id_typemateriel: '', 
    designation: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const [matRes, etatsRes, typesRes] = await Promise.all([
        getMateriels(),
        getEtatsMateriel(),
        getTypesMateriel()
      ]);
      setMateriels(matRes.data);
      setEtatsMateriel(etatsRes.data);
      setTypesMateriel(typesRes.data);
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
        await updateMateriel(formData.id, formData);
      } else {
        await addMateriel(formData);
      }
      setIsModalOpen(false);
      setFormData({ id: '', id_etatmateriel: '', id_typemateriel: '', designation: '' });
      setIsEditing(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (materiel) => {
    setFormData({
      id: materiel.id,
      id_etatmateriel: materiel.etatMateriel?.id || '',
      id_typemateriel: materiel.typeMateriel?.id || '',
      designation: materiel.designation
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (materiel) => {
    if (confirm(`Supprimer le matériel "${materiel.designation}" ?`)) {
      try {
        await deleteMateriel(materiel.id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredMateriels = materiels.filter(materiel =>
    materiel.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    materiel.typeMateriel?.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    materiel.etatMateriel?.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    materiel.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEtatColor = (etatDesignation) => {
    const colors = {
      'Neuf': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Bon état': 'bg-blue-50 text-blue-700 border-blue-200',
      'À réparer': 'bg-amber-50 text-amber-700 border-amber-200',
      'Hors service': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[etatDesignation] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                liste des Matériels
              </h1>
            </div>
            
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium"
          >
            <Plus size={20} />
            Nouveau Matériel
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
                  placeholder="Rechercher par désignation, type, état ou ID..."
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
                    ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Désignation
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    État
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredMateriels.map((materiel, index) => (
                  <tr 
                    key={materiel.id} 
                    className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        
                        <span className="text-sm font-semibold text-gray-900">{materiel.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{materiel.designation}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{materiel.typeMateriel?.designation}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getEtatColor(materiel.etatMateriel?.designation)}`}>
                        {materiel.etatMateriel?.designation}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(materiel)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-150 font-medium"
                        >
                          <Edit size={16} />
                          {/* modifier */}
                        </button>
                        <button
                          onClick={() => handleDelete(materiel)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-150 font-medium"
                        >
                          <Trash2 size={16} />
                          {/* supprimer */}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMateriels.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
                <Search size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun matériel trouvé</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'Aucun matériel ne correspond à votre recherche' : 'Commencez par ajouter votre premier matériel'}
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
          setFormData({ id: '', id_etatmateriel: '', id_typemateriel: '', designation: '' });
        }}
        title={isEditing ? "Modifier le Matériel" : "Nouveau Matériel"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Désignation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              placeholder="Ex: Ordinateur Dell Latitude 5490"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type de matériel</label>
            <select
              value={formData.id_typemateriel}
              onChange={(e) => setFormData({ ...formData, id_typemateriel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              required
            >
              <option value="">Sélectionnez un type</option>
              {typesMateriel.map(type => (
                <option key={type.id} value={type.id}>{type.designation}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">État du matériel</label>
            <select
              value={formData.id_etatmateriel}
              onChange={(e) => setFormData({ ...formData, id_etatmateriel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
              required
            >
              <option value="">Sélectionnez un état</option>
              {etatsMateriel.map(etat => (
                <option key={etat.id} value={etat.id}>{etat.designation}</option>
              ))}
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

export default MaterielList;