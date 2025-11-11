import React, { useEffect, useState } from 'react';
import { Plus, Search, Phone, MapPin, Mail, FileText, Building, Edit, Trash2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError, showConfirm } from '../alerts.jsx';
import Modal from '../components/Modal';
import { 
  getFournisseursGroupes, 
  addFournisseur,
  updateFournisseur,
  deleteFournisseur
} from '../api/fournisseurAPI';

const FournisseurList = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    id: '',
    nom: '', 
    contact: '', 
    adresse: '',
    nif: '',
    stat: '',
    email: ''
  });

  const fetchData = async () => {
    try {
      const fourRes = await getFournisseursGroupes();
      setFournisseurs(fourRes.data);
    } catch (err) {
      console.error(err);
      showError('Impossible de charger les fournisseurs');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateFournisseur(formData.id, {
          nom: formData.nom.trim(),
          contact: formData.contact.trim(),
          adresse: formData.adresse.trim(),
          nif: formData.nif.trim() || undefined,
          stat: formData.stat.trim() || undefined,
          email: formData.email.trim() || undefined
        });
        showSuccess(`Fournisseur "${formData.nom}" modifié avec succès !`);
      } else {
        await addFournisseur({
          nom: formData.nom.trim(),
          contact: formData.contact.trim(),
          adresse: formData.adresse.trim(),
          nif: formData.nif.trim() || undefined,
          stat: formData.stat.trim() || undefined,
          email: formData.email.trim() || undefined
        });
        showSuccess(`Fournisseur "${formData.nom}" ajouté avec succès !`);
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showError(
        isEditing 
          ? 'Erreur lors de la modification du fournisseur' 
          : 'Erreur lors de l\'ajout du fournisseur'
      );
    }
  };

  const handleEdit = (fournisseur) => {
    setFormData({
      id: fournisseur.id,
      nom: fournisseur.nom,
      contact: fournisseur.contact,
      adresse: fournisseur.adresse,
      nif: fournisseur.nif || '',
      stat: fournisseur.stat || '',
      email: fournisseur.email || ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (fournisseur) => {
    showConfirm(
      `Voulez-vous vraiment supprimer le fournisseur "${fournisseur.nom}" ?`,
      async () => {
        try {
          await deleteFournisseur(fournisseur.id);
          showSuccess(`Fournisseur "${fournisseur.nom}" supprimé avec succès !`);
          fetchData();
        } catch (err) {
          console.error(err);
          
          // Détection de l'erreur de contrainte de clé étrangère
          if (err.response?.status === 500 && err.response?.data?.message?.includes('acquisition')) {
            showError(
              `Impossible de supprimer "${fournisseur.nom}" car il est lié à des acquisitions existantes. Supprimez d'abord les acquisitions associées.`
            );
          } else if (err.response?.data?.code === '23503') {
            showError(
              `Ce fournisseur est encore utilisé dans d'autres enregistrements. Supprimez d'abord les références avant de le supprimer.`
            );
          } else {
            showError('Erreur lors de la suppression du fournisseur');
          }
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({ 
      id: '',
      nom: '', 
      contact: '', 
      adresse: '',
      nif: '',
      stat: '',
      email: ''
    });
    setIsEditing(false);
  };

  const filteredFournisseurs = fournisseurs.filter(f => 
    f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.nif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.stat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast Container */}
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fournisseurs</h1>
              <p className="text-gray-600 mt-2">Gestion des fournisseurs</p>
            </div>
            <button 
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
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
              placeholder="Rechercher par nom, NIF, STAT, email ou adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFournisseurs.map((fournisseur) => (
            <div key={fournisseur.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
              <div className="p-6">
                {/* Header avec nom */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900">{fournisseur.nom}</h3>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Phone size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Contact</p>
                      <p className="text-sm text-gray-900">{fournisseur.contact}</p>
                    </div>
                  </div>

                  {fournisseur.email && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Mail size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-sm text-gray-900">{fournisseur.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 text-gray-600">
                    <div className="p-2 bg-orange-50 rounded-lg mt-0.5">
                      <MapPin size={16} className="text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Adresse</p>
                      <p className="text-sm text-gray-900 line-clamp-2">{fournisseur.adresse}</p>
                    </div>
                  </div>

                  {(fournisseur.nif || fournisseur.stat) && (
                    <div className="pt-3 border-t border-gray-100">
                      {fournisseur.nif && (
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <FileText size={16} className="text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium">NIF</p>
                            <p className="text-sm text-gray-900">{fournisseur.nif}</p>
                          </div>
                        </div>
                      )}
                      
                      {fournisseur.stat && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <Building size={16} className="text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium">STAT</p>
                            <p className="text-sm text-gray-900">{fournisseur.stat}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(fournisseur)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all font-medium"
                  >
                    <Edit size={18} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(fournisseur)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all font-medium"
                  >
                    <Trash2 size={18} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFournisseurs.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun fournisseur trouvé</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Aucun résultat ne correspond à votre recherche' : 'Commencez par ajouter un fournisseur'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditing ? "Modifier le Fournisseur" : "Nouveau Fournisseur"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Ex: TechnoPlus SARL"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact *</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Ex: +261 34 12 345 67"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              placeholder="Ex: contact@technoplus.mg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">NIF</label>
              <input
                type="text"
                value={formData.nif}
                onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Ex: 1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">STAT</label>
              <input
                type="text"
                value={formData.stat}
                onChange={(e) => setFormData({ ...formData, stat: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Ex: 12345678901234"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse *</label>
            <textarea
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all"
              placeholder="Adresse complète du fournisseur"
              rows="3"
              required
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
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md font-medium"
            >
              {isEditing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FournisseurList;
