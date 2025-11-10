import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Settings, Layers, Package, Download, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const [filterType, setFilterType] = useState('all');
  const [filterEtat, setFilterEtat] = useState('all');
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

  const filteredMateriels = materiels.filter(materiel => {
    const matchSearch = materiel.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materiel.typeMateriel?.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materiel.etatMateriel?.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materiel.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchType = filterType === 'all' || materiel.typeMateriel?.id === filterType;
    const matchEtat = filterEtat === 'all' || materiel.etatMateriel?.id === filterEtat;
    
    return matchSearch && matchType && matchEtat;
  });

  const getEtatColor = (etatDesignation) => {
    const colors = {
      'Neuf': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Bon état': 'bg-blue-50 text-blue-700 border-blue-200',
      'À réparer': 'bg-amber-50 text-amber-700 border-amber-200',
      'Hors service': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[etatDesignation] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Statistiques (sans total)
  const stats = {
    neuf: materiels.filter(m => m.etatMateriel?.designation === 'Neuf').length,
    bonEtat: materiels.filter(m => m.etatMateriel?.designation === 'Bon état').length,
    aReparer: materiels.filter(m => m.etatMateriel?.designation === 'À réparer').length,
    horsService: materiels.filter(m => m.etatMateriel?.designation === 'Hors service').length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header sobre */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Matériels
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Package size={18} className="text-green-600" />
                Inventaire du patrimoine informatique
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
                <Download size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Exporter</span>
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
              >
                <Plus size={20} />
                Ajouter
              </button>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="flex items-center gap-3">
            <Link
              to="/type-materiel"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-all shadow-sm"
            >
              <Layers size={16} />
              <span className="text-sm font-semibold">Types Matériel</span>
            </Link>
            <Link
              to="/etat-materiel"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-all shadow-sm"
            >
              <Settings size={16} />
              <span className="text-sm font-semibold">États Matériel</span>
            </Link>
          </div>
        </div>

        {/* Cards statistiques sobres */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Package className="text-emerald-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.neuf}</p>
                <p className="text-xs text-gray-600 font-medium">Neufs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.bonEtat}</p>
                <p className="text-xs text-gray-600 font-medium">Bon État</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Settings className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.aReparer}</p>
                <p className="text-xs text-gray-600 font-medium">À Réparer</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.horsService}</p>
                <p className="text-xs text-gray-600 font-medium">Hors Service</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par désignation, type, état..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all appearance-none bg-white text-sm font-medium"
                >
                  <option value="all">Tous types</option>
                  {typesMateriel.map(type => (
                    <option key={type.id} value={type.id}>{type.designation}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={filterEtat}
                  onChange={(e) => setFilterEtat(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all appearance-none bg-white text-sm font-medium"
                >
                  <option value="all">Tous états</option>
                  {etatsMateriel.map(etat => (
                    <option key={etat.id} value={etat.id}>{etat.designation}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filtres actifs */}
          {(filterType !== 'all' || filterEtat !== 'all') && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600">Filtres actifs:</span>
              {filterType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {typesMateriel.find(t => t.id === filterType)?.designation}
                  <button onClick={() => setFilterType('all')} className="hover:bg-blue-200 rounded-full p-0.5">×</button>
                </span>
              )}
              {filterEtat !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {etatsMateriel.find(e => e.id === filterEtat)?.designation}
                  <button onClick={() => setFilterEtat('all')} className="hover:bg-green-200 rounded-full p-0.5">×</button>
                </span>
              )}
              <button 
                onClick={() => { setFilterType('all'); setFilterEtat('all'); }}
                className="text-xs text-gray-600 hover:text-gray-900 font-medium ml-2"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* Tableau sobre */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Désignation</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">État</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredMateriels.map((materiel, index) => (
                  <tr key={materiel.id} className={`hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{materiel.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{materiel.designation}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                        {materiel.typeMateriel?.designation}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getEtatColor(materiel.etatMateriel?.designation)}`}>
                        {materiel.etatMateriel?.designation}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(materiel)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(materiel)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={18} />
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun matériel trouvé</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterType !== 'all' || filterEtat !== 'all' 
                  ? 'Essayez d\'ajuster vos filtres' 
                  : 'Commencez par ajouter votre premier matériel'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal sobre */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setIsEditing(false); setFormData({ id: '', id_etatmateriel: '', id_typemateriel: '', designation: '' }); }} title={isEditing ? "Modifier le Matériel" : "Nouveau Matériel"} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Désignation</label>
            <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" placeholder="Ex: Ordinateur Dell Latitude 5490" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type de matériel</label>
            <select value={formData.id_typemateriel} onChange={(e) => setFormData({ ...formData, id_typemateriel: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" required>
              <option value="">Sélectionnez un type</option>
              {typesMateriel.map(type => (
                <option key={type.id} value={type.id}>{type.designation}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">État du matériel</label>
            <select value={formData.id_etatmateriel} onChange={(e) => setFormData({ ...formData, id_etatmateriel: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" required>
              <option value="">Sélectionnez un état</option>
              {etatsMateriel.map(etat => (
                <option key={etat.id} value={etat.id}>{etat.designation}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium">Annuler</button>
            <button type="submit" className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md font-medium">{isEditing ? 'Mettre à jour' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterielList;
