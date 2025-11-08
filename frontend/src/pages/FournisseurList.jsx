import React, { useEffect, useState } from 'react';
import { Plus, Search, Phone, MapPin, Calendar, Package } from 'lucide-react';
import Modal from '../components/Modal';
import { 
  getFournisseursGroupes, 
  addFournisseur
} from '../api/fournisseurAPI';
import { getTypesMateriel } from '../api/typematerielAPI';

const FournisseurList = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [typesMateriel, setTypesMateriel] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [formData, setFormData] = useState({ 
    nom: '', 
    contact: '', 
    adresse: '',
    date_livraison: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const [fourRes, typesRes] = await Promise.all([
        getFournisseursGroupes(),
        getTypesMateriel()
      ]);
      setFournisseurs(fourRes.data);
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
      // Créer une entrée pour chaque type de matériel sélectionné
      const promises = selectedTypes.map(typeId => 
        addFournisseur({
          ...formData,
          id_typemateriel: typeId
        })
      );
      
      await Promise.all(promises);
      setIsModalOpen(false);
      setFormData({ 
        nom: '', 
        contact: '', 
        adresse: '',
        date_livraison: new Date().toISOString().split('T')[0]
      });
      setSelectedTypes([]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTypeToggle = (typeId) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const filteredFournisseurs = fournisseurs.filter(f => 
    f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.typesMateriel.some(tm => 
      tm.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fournisseurs</h1>
            <p className="text-gray-600 mt-2">Gestion des fournisseurs et des matériels livrés</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={20} />
            Nouveau Fournisseur
          </button>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un fournisseur, adresse ou type de matériel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFournisseurs.map((fournisseur) => (
            <div key={fournisseur.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{fournisseur.nom}</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {fournisseur.typesMateriel.length} type(s)
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={16} className="text-purple-500" />
                    <span className="text-sm">{fournisseur.contact}</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin size={16} className="text-purple-500 mt-0.5" />
                    <span className="text-sm">{fournisseur.adresse}</span>
                  </div>
                </div>

                {/* Types de Matériel */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Package size={16} />
                    Types de matériel fournis
                  </h4>
                  <div className="space-y-2">
                    {fournisseur.typesMateriel.map((type, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-gray-700">{type.type}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={12} />
                          {new Date(type.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFournisseurs.length === 0 && (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fournisseur trouvé</h3>
            <p className="text-gray-500">Commencez par ajouter votre premier fournisseur</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setFormData({ 
      nom: '', 
      contact: '', 
      adresse: '',
      date_livraison: new Date().toISOString().split('T')[0]
    });
    setSelectedTypes([]);
  }}
  title="Nouveau Fournisseur"
  size="lg"
>
  <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
    {/* Informations fournisseur */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nom du fournisseur</label>
        <input
          type="text"
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Ex: TechnoPlus SARL"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
        <input
          type="text"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Ex: +261 34 12 345 67"
          required
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
      <textarea
        value={formData.adresse}
        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        placeholder="Adresse complète du fournisseur"
        rows="3"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Date de livraison</label>
      <input
        type="date"
        value={formData.date_livraison}
        onChange={(e) => setFormData({ ...formData, date_livraison: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        required
      />
    </div>

    {/* Types de matériel - Section scrollable */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Types de matériel fournis
        <span className="text-xs text-gray-500 ml-2">(Sélectionnez un ou plusieurs)</span>
      </label>
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
          {typesMateriel.map((type) => (
            <label key={type.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type.id)}
                onChange={() => handleTypeToggle(type.id)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-700">{type.designation}</span>
                {type.description && (
                  <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>
        {selectedTypes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-green-600 font-medium">
              {selectedTypes.length} type(s) sélectionné(s)
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTypes.map(typeId => {
                const type = typesMateriel.find(t => t.id === typeId);
                return type ? (
                  <span key={typeId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {type.designation}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Boutons en bas fixe */}
    <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 -mx-6 -mb-6 px-6 pb-6">
      <div className="flex justify-end gap-3">
        <button 
          type="button" 
          onClick={() => setIsModalOpen(false)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selectedTypes.length === 0}
        >
          Enregistrer ({selectedTypes.length})
        </button>
      </div>
    </div>
  </form>
</Modal>
    </div>
  );
};

export default FournisseurList;