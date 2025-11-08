import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, CheckCircle, Clock, Package, User, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import { 
  getAttributions, 
  addAttribution, 
  updateAttribution, 
  deleteAttribution,
  updateAttributionStatut 
} from '../api/attributionAPI';
import { getMateriels } from '../api/materielAPI';
import { getDemandeurs } from '../api/demandeurAPI';
import { getDetailDemandes } from '../api/detaildemandeAPI';
import { showSuccess, showError, showConfirm } from '../alerts';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const AttributionList = () => {
  const [attributions, setAttributions] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [demandeurs, setDemandeurs] = useState([]);
  const [detailDemandes, setDetailDemandes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    id_materiel: '', 
    id_demandeur: '', 
    date_attribution: new Date().toISOString().split('T')[0],
    quantite_attribuee: '',
    statut_attribution: 'En possession',
    date_retour_prevue: '',
    motif_attribution: '',
    attribution_definitive: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [demandesFiltrees, setDemandesFiltrees] = useState([]);
  const [demandeSelectionnee, setDemandeSelectionnee] = useState(null);

  const fetchData = async () => {
    try {
      const [attributionsRes, materielsRes, demandeursRes, detailDemandesRes] = await Promise.all([
        getAttributions(),
        getMateriels(),
        getDemandeurs(),
        getDetailDemandes()
      ]);
      setAttributions(attributionsRes.data);
      setMateriels(materielsRes.data);
      setDemandeurs(demandeursRes.data);
      setDetailDemandes(detailDemandesRes.data);
    } catch (err) {
      showError('Impossible de charger les données');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CORRECTION : Filtrer les demandes quand un demandeur est sélectionné
  useEffect(() => {
    if (formData.id_demandeur) {
      const demandesDuDemandeur = detailDemandes.filter(detail => 
        detail.demandeMateriel?.demandeur?.id === formData.id_demandeur
      );
      setDemandesFiltrees(demandesDuDemandeur);
    } else {
      setDemandesFiltrees([]);
      setDemandeSelectionnee(null);
    }
  }, [formData.id_demandeur, detailDemandes]);

  // CORRECTION : Quand une demande spécifique est sélectionnée
  const handleDemandeChange = (idMateriel) => {
    const demande = demandesFiltrees.find(d => 
      d.materiel?.id === idMateriel
    );
    
    if (demande) {
      setDemandeSelectionnee(demande);
      setFormData(prev => ({
        ...prev,
        id_materiel: idMateriel,
        quantite_attribuee: demande.quantite_demander || '',
        date_attribution: new Date().toISOString().split('T')[0]
      }));
    } else {
      setDemandeSelectionnee(null);
      setFormData(prev => ({
        ...prev,
        id_materiel: '',
        quantite_attribuee: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!demandeSelectionnee) {
      showError('Veuillez sélectionner une demande');
      return;
    }

    try {
      // VÉRIFICATION CORRIGÉE : Vérifier si une attribution existe déjà pour ce DÉTAIL DE DEMANDE
      const attributionExistante = attributions.find(att => 
        att.materiel?.id === formData.id_materiel &&
        att.demandeur?.id === formData.id_demandeur &&
        // Vérifier que c'est la même demande (même détail)
        att.detailDemandeId === demandeSelectionnee.id // Supposons que vous ayez cette relation
      );

      // Si une attribution existe pour ce détail de demande, bloquer
      if (attributionExistante && !isEditing) {
        showError('Une attribution existe déjà pour cette demande. Impossible de créer une autre attribution pour le même détail de demande.');
        return;
      }

      const dataToSend = {
        id_materiel: formData.id_materiel,
        id_demandeur: formData.id_demandeur,
        date_attribution: formData.date_attribution,
        quantite_attribuee: parseInt(formData.quantite_attribuee),
        statut_attribution: formData.attribution_definitive ? 'Rendu' : 'En possession',
        date_retour_prevue: formData.attribution_definitive ? undefined : formData.date_retour_prevue,
        motif_attribution: formData.motif_attribution,
        // Ajouter l'ID du détail de demande pour la relation
        id_detail_demande: demandeSelectionnee.id
      };

      if (isEditing) {
        await updateAttribution(editingId, dataToSend);
        showSuccess('Attribution modifiée avec succès');
      } else {
        await addAttribution(dataToSend);
        showSuccess('Attribution créée avec succès');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (attribution) => {
    setFormData({
      id_materiel: attribution.materiel?.id || '',
      id_demandeur: attribution.demandeur?.id || '',
      date_attribution: attribution.date_attribution?.split('T')[0] || new Date().toISOString().split('T')[0],
      quantite_attribuee: attribution.quantite_attribuee,
      statut_attribution: attribution.statut_attribution,
      date_retour_prevue: attribution.date_retour_prevue?.split('T')[0] || '',
      motif_attribution: attribution.motif_attribution || '',
      attribution_definitive: attribution.statut_attribution === 'Rendu'
    });
    setIsEditing(true);
    setEditingId(attribution.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (attribution) => {
    const result = await showConfirm(`Supprimer l'attribution #${attribution.id}?`);
    
    if (result.isConfirmed) {
      try {
        await deleteAttribution(attribution.id);
        showSuccess('Attribution supprimée');
        fetchData();
      } catch (err) {
        showError(err.response?.data?.message || 'Impossible de supprimer');
      }
    }
  };

  const handleMarquerRendu = async (attribution) => {
    const result = await showConfirm('Marquer comme rendu?');
    
    if (result.isConfirmed) {
      try {
        await updateAttributionStatut(attribution.id, 'Rendu');
        showSuccess('Matériel marqué comme rendu');
        fetchData();
      } catch (err) {
        showError(err.response?.data?.message || 'Erreur');
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      id_materiel: '', 
      id_demandeur: '', 
      date_attribution: new Date().toISOString().split('T')[0],
      quantite_attribuee: '',
      statut_attribution: 'En possession',
      date_retour_prevue: '',
      motif_attribution: '',
      attribution_definitive: false
    });
    setIsEditing(false);
    setEditingId(null);
    setDemandesFiltrees([]);
    setDemandeSelectionnee(null);
  };

  const filteredAttributions = attributions.filter(attribution =>
    attribution.id?.toString().includes(searchTerm) ||
    attribution.materiel?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attribution.demandeur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attribution.demandeur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatutColor = (statut) => {
    const colors = {
      'En possession': 'bg-blue-50 text-blue-700 border-blue-200',
      'Rendu': 'bg-green-50 text-green-700 border-green-200',
      'En retard': 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[statut] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Attributions</h1>
            <p className="text-gray-600">Attribuez et gérez le matériel</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Nouvelle Attribution
          </button>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matériel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demandeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Attribution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAttributions.map((attribution) => (
                <tr key={attribution.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-blue-600" />
                      <span className="font-medium">#{attribution.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{attribution.materiel?.designation}</td>
                  <td className="px-6 py-4">
                    {attribution.demandeur?.nom} {attribution.demandeur?.prenom}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {formatDate(attribution.date_attribution)}
                    </div>
                    {attribution.date_retour_prevue && (
                      <div className="text-xs text-gray-500">
                        Retour_prevu: {formatDate(attribution.date_retour_prevue)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">{attribution.quantite_attribuee}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatutColor(attribution.statut_attribution)}`}>
                      {attribution.statut_attribution}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(attribution)} className="text-blue-600 hover:text-blue-800">
                        <Edit size={16} />
                      </button>
                      {attribution.statut_attribution !== 'Rendu' && (
                        <button onClick={() => handleMarquerRendu(attribution)} className="text-green-600 hover:text-green-800">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(attribution)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Modifier" : "Nouvelle Attribution"}>
          <div className="flex flex-col h-[500px]">
            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Demandeur *</label>
                  <select
                    value={formData.id_demandeur}
                    onChange={(e) => setFormData({ ...formData, id_demandeur: e.target.value, id_materiel: '' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Choisir un demandeur</option>
                    {demandeurs.map(demandeur => (
                      <option key={demandeur.id} value={demandeur.id}>
                        {demandeur.nom} {demandeur.prenom}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.id_demandeur && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matériel *</label>
                    <select
                      value={formData.id_materiel}
                      onChange={(e) => handleDemandeChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Choisir un matériel</option>
                      {demandesFiltrees.map(demande => (
                        <option key={demande.materiel?.id} value={demande.materiel?.id}>
                          {demande.materiel?.designation} - Quantité: {demande.quantite_demander}
                          {demande.demandeMateriel?.date_demande && (
                            <span> (Demande: {formatDate(demande.demandeMateriel.date_demande)})</span>
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {demandeSelectionnee && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Attribution *</label>
                        <input
                          type="date"
                          value={formData.date_attribution}
                          onChange={(e) => setFormData({ ...formData, date_attribution: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                        <input
                          type="number"
                          value={formData.quantite_attribuee}
                          onChange={(e) => setFormData({ ...formData, quantite_attribuee: e.target.value })}
                          max={demandeSelectionnee.quantite_demander}
                          min="1"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum: {demandeSelectionnee.quantite_demander}
                        </p>
                      </div>
                    </div>

                    {!formData.attribution_definitive && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Retour Prévue</label>
                        <input
                          type="date"
                          value={formData.date_retour_prevue}
                          onChange={(e) => setFormData({ ...formData, date_retour_prevue: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                      <input
                        type="text"
                        value={formData.motif_attribution}
                        onChange={(e) => setFormData({ ...formData, motif_attribution: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.attribution_definitive}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          attribution_definitive: e.target.checked,
                          date_retour_prevue: e.target.checked ? '' : formData.date_retour_prevue
                        })}
                        className="rounded"
                      />
                      <label className="text-sm text-gray-700">Attribution Définitive</label>
                    </div>
                  </>
                )}
              </form>
            </div>

            {/* Footer fixe en bas */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AttributionList;