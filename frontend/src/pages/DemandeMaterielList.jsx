import React, { useEffect, useState } from "react";
import {
  Plus, Search, Edit, Trash2, Eye, Check, X, Package, Clock, Calendar
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { showSuccess, showError, showConfirm } from "../alerts.jsx";
import Modal from "../components/Modal";
import {
  getDemandes,
  addDemande,
  updateDemande,
  deleteDemande,
  updateStatut,
} from "../api/demandematerielAPI";
import {
  addDetailDemande,
  updateDetailDemande,
  deleteDetailDemande,
} from "../api/detaildemandeAPI";
import { getDemandeurs } from "../api/demandeurAPI";
import { getMateriels } from "../api/materielAPI";

const DemandeMaterielList = () => {
  const [demandes, setDemandes] = useState([]);
  const [demandeurs, setDemandeurs] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isDetailFormModalOpen, setIsDetailFormModalOpen] = useState(false);

  const [selectedDemande, setSelectedDemande] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    id_demandeur: "",
    date_demande: new Date().toISOString().split("T")[0],
    raison_demande: "",
    type_possession: "temporaire",
    date_retour: "",
  });
  const [detailFormData, setDetailFormData] = useState({
    id_detail: "",
    id_materiel: "",
    quantite_demander: 1,
  });

  const [approvalData, setApprovalData] = useState({
    statut: "",
    motif_refus: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [demandesRes, demandeursRes, materielsRes] = await Promise.all([
        getDemandes(),
        getDemandeurs(),
        getMateriels(),
      ]);
      setDemandes(demandesRes.data);
      setDemandeurs(demandeursRes.data);
      setMateriels(materielsRes.data);
    } catch (err) {
      console.error(err);
      showError("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.type_possession === 'temporaire' && !formData.date_retour) {
      showError('Veuillez indiquer une date de retour pour une possession temporaire');
      return;
    }
    try {
      if (isEditing) {
        await updateDemande(selectedDemande.id, formData);
        showSuccess("Demande modifiée avec succès !");
      } else {
        await addDemande({
          ...formData,
          date_retour: formData.type_possession === 'definitive' ? undefined : formData.date_retour
        });
        showSuccess("Demande créée avec succès !");
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showError("Erreur lors de l'enregistrement");
    }
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDemande || !selectedDemande.id) {
      showError("Erreur d'identification de la demande");
      return;
    }
    try {
      await updateStatut(selectedDemande.id, approvalData);
      showSuccess(
        approvalData.statut === "approuvee"
          ? "✅ Demande approuvée ! Le demandeur sera notifié."
          : "❌ Demande refusée. Le demandeur sera informé."
      );
      setIsApprovalModalOpen(false);
      setApprovalData({ statut: "", motif_refus: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      showError("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingDetail) {
        await updateDetailDemande(detailFormData.id_detail, {
          quantite_demander: detailFormData.quantite_demander,
        });
        showSuccess("Détail modifié avec succès !");
      } else {
        await addDetailDemande(selectedDemande.id, {
          id_materiel: detailFormData.id_materiel,
          quantite_demander: detailFormData.quantite_demander,
        });
        showSuccess("Matériel ajouté avec succès !");
      }
      setIsDetailFormModalOpen(false);
      resetDetailForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showError("Erreur lors de l'enregistrement du détail");
    }
  };

  const handleEdit = (demande) => {
    setFormData({
      id_demandeur: demande.demandeur?.id_demandeur || "",
      date_demande: demande.date_demande.split("T")[0],
      raison_demande: demande.raison_demande,
      type_possession: demande.type_possession || 'temporaire',
      date_retour: demande.date_retour ? demande.date_retour.split("T")[0] : "",
    });
    setSelectedDemande(demande);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (demande) => {
    showConfirm(
      `Voulez-vous vraiment supprimer la demande "${demande.id}" ?`,
      async () => {
        try {
          await deleteDemande(demande.id);
          showSuccess("Demande supprimée avec succès !");
          fetchData();
        } catch (err) {
          console.error(err);
          showError("Erreur lors de la suppression");
        }
      }
    );
  };

  const handleViewDetails = (demande) => {
    setSelectedDemande(demande);
    setIsDetailModalOpen(true);
  };

  const handleApprove = (demande) => {
    setSelectedDemande(demande);
    setApprovalData({ statut: "approuvee", motif_refus: "" });
    setIsApprovalModalOpen(true);
  };

  const handleReject = (demande) => {
    setSelectedDemande(demande);
    setApprovalData({ statut: "refusee", motif_refus: "" });
    setIsApprovalModalOpen(true);
  };

  const handleAddDetail = () => {
    resetDetailForm();
    setIsDetailFormModalOpen(true);
  };

  const handleEditDetail = (detail) => {
    setDetailFormData({
      id_detail: detail.id_detail,
      id_materiel: detail.materiel?.id || "",
      quantite_demander: detail.quantite_demander,
    });
    setIsEditingDetail(true);
    setIsDetailFormModalOpen(true);
  };

  const handleDeleteDetail = (detail) => {
    showConfirm(
      `Voulez-vous vraiment supprimer "${detail.materiel?.designation}" ?`,
      async () => {
        try {
          await deleteDetailDemande(detail.id_detail);
          showSuccess("Matériel supprimé avec succès !");
          fetchData();
        } catch (err) {
          console.error(err);
          showError("Erreur lors de la suppression");
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({
      id_demandeur: "",
      date_demande: new Date().toISOString().split("T")[0],
      raison_demande: "",
      type_possession: "temporaire",
      date_retour: "",
    });
    setIsEditing(false);
    setSelectedDemande(null);
  };

  const resetDetailForm = () => {
    setDetailFormData({
      id_detail: "",
      id_materiel: "",
      quantite_demander: 1,
    });
    setIsEditingDetail(false);
  };

  const filteredDemandes = demandes.filter((demande) =>
    (demande.id || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (demande.demandeur?.nom || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (demande.raison_demande || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusConfig = (statut) => {
    const configs = {
      en_attente: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        text: "En attente",
      },
      approuvee: {
        color: "bg-green-50 text-green-700 border-green-200",
        text: "Approuvée",
      },
      refusee: {
        color: "bg-red-50 text-red-700 border-red-200",
        text: "Refusée",
      },
    };
    return configs[statut] || configs.en_attente;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Demandes de Matériel
              </h1>
              <p className="text-gray-600">
                Gestion et validation des demandes
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all font-medium"
            >
              <Plus size={20} />
              Nouvelle Demande
            </button>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher par ID, demandeur ou raison..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Tableau principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin mx-auto w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Demandeur</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Raison</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDemandes.map((demande) => {
                    const status = getStatusConfig(demande.statut);
                    return (
                      <tr key={demande.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-200">
                            {demande.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {demande.demandeur?.nom || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {demande.demandeur?.prenom || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDate(demande.date_demande)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="truncate max-w-[200px] block text-sm text-gray-700">
                            {demande.raison_demande}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                              demande.type_possession === 'definitive' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {demande.type_possession === 'definitive' ? '🔒 Définitive' : '⏱️ Temporaire'}
                            </span>
                            {demande.date_retour && (
                              <div className="flex items-center gap-1 text-xs text-orange-600">
                                <Clock size={12} />
                                {formatDate(demande.date_retour)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}
                          >
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(demande)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Matériels demandés"
                            >
                              <Eye size={16} />
                            </button>
                            {demande.statut === "en_attente" && (
                              <>
                                <button
                                  onClick={() => handleApprove(demande)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Approuver"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(demande)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Refuser"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleEdit(demande)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(demande)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredDemandes.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune demande trouvée
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Aucun résultat ne correspond à votre recherche"
                  : "Aucune demande enregistrée"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal formulaire demande avec type_possession et date_retour */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditing ? "Modifier la Demande" : "Nouvelle Demande"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Demandeur *
            </label>
            <select
              value={formData.id_demandeur}
              onChange={(e) =>
                setFormData({ ...formData, id_demandeur: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              required
            >
              <option value="">Sélectionnez un demandeur</option>
              {demandeurs.map((demandeur) => (
                <option key={demandeur.id_demandeur} value={demandeur.id_demandeur}>
                  {demandeur.nom} {demandeur.prenom}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              value={formData.date_demande}
              onChange={(e) => setFormData({ ...formData, date_demande: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Raison *
            </label>
            <textarea
              value={formData.raison_demande}
              onChange={(e) => setFormData({ ...formData, raison_demande: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
              rows="4"
              placeholder="Expliquez la raison de la demande..."
              required
            />
          </div>

          {/* TYPE DE POSSESSION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Type de possession *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type_possession: 'temporaire' })}
                className={`p-4 border-2 rounded-xl transition-all ${
                  formData.type_possession === 'temporaire'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Clock className={formData.type_possession === 'temporaire' ? 'text-blue-600' : 'text-gray-400'} size={20} />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.type_possession === 'temporaire' ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {formData.type_possession === 'temporaire' && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                <p className="font-semibold text-gray-900 text-left text-sm">Temporaire</p>
                <p className="text-xs text-gray-600 text-left mt-1">À retourner</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type_possession: 'definitive', date_retour: '' })}
                className={`p-4 border-2 rounded-xl transition-all ${
                  formData.type_possession === 'definitive'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Package className={formData.type_possession === 'definitive' ? 'text-purple-600' : 'text-gray-400'} size={20} />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.type_possession === 'definitive' ? 'border-purple-500' : 'border-gray-300'
                  }`}>
                    {formData.type_possession === 'definitive' && (
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                <p className="font-semibold text-gray-900 text-left text-sm">Définitive</p>
                <p className="text-xs text-gray-600 text-left mt-1">Sans retour</p>
              </button>
            </div>
          </div>

          {formData.type_possession === 'temporaire' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date de retour prévue *
              </label>
              <input
                type="date"
                value={formData.date_retour}
                onChange={(e) => setFormData({ ...formData, date_retour: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                ℹ️ Date à laquelle le matériel doit être retourné
              </p>
            </div>
          )}

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
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-md font-medium"
            >
              {isEditing ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal détails matériels */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Matériels demandés (${selectedDemande?.id || ""})`}
        size="lg"
      >
        <div className="space-y-2">
          {(selectedDemande?.detailDemandes || []).length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucun matériel demandé</div>
          )}
          {selectedDemande?.detailDemandes &&
            selectedDemande.detailDemandes.map((detail) => (
              <div key={detail.id_detail || detail.id} className="flex justify-between items-center border-b py-3 hover:bg-gray-50 px-2 rounded">
                <span className="font-medium text-gray-900">{detail.materiel?.designation}</span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full text-sm">
                    x{detail.quantite_demander}
                  </span>
                  {selectedDemande.statut === "en_attente" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditDetail(detail)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Modifier"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteDetail(detail)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          {selectedDemande?.statut === "en_attente" && (
            <div className="py-4 text-center border-t">
              <button
                onClick={handleAddDetail}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
              >
                <Plus size={16} />
                Ajouter un matériel
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal approbation/refus */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setApprovalData({ statut: "", motif_refus: "" });
        }}
        title={approvalData.statut === "approuvee" ? "✅ Approuver la Demande" : "❌ Refuser la Demande"}
        size="md"
      >
        <form onSubmit={handleApprovalSubmit} className="space-y-5">
          {approvalData.statut === "refusee" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Motif du refus *</label>
              <textarea
                value={approvalData.motif_refus}
                onChange={(e) => setApprovalData({ ...approvalData, motif_refus: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                rows="4"
                placeholder="Expliquez le motif du refus..."
                required
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                setIsApprovalModalOpen(false);
                setApprovalData({ statut: "", motif_refus: "" });
              }}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 ${approvalData.statut === "approuvee" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white rounded-lg transition-all shadow-md font-medium`}
            >
              {approvalData.statut === "approuvee" ? "Approuver" : "Refuser"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal ajout/modification detail */}
      <Modal
        isOpen={isDetailFormModalOpen}
        onClose={() => {
          setIsDetailFormModalOpen(false);
          resetDetailForm();
        }}
        title={isEditingDetail ? "Modifier le matériel" : "Ajouter un matériel"}
        size="md"
      >
        <form onSubmit={handleDetailSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Matériel *
            </label>
            <select
              value={detailFormData.id_materiel}
              onChange={(e) =>
                setDetailFormData({ ...detailFormData, id_materiel: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              required
            >
              <option value="">Sélectionnez un matériel</option>
              {materiels.map((materiel) => (
                <option key={materiel.id} value={materiel.id}>
                  {materiel.designation}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantité demandée *
            </label>
            <input
              type="number"
              min="1"
              value={detailFormData.quantite_demander}
              onChange={(e) =>
                setDetailFormData({ ...detailFormData, quantite_demander: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                setIsDetailFormModalOpen(false);
                resetDetailForm();
              }}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-md font-medium"
            >
              {isEditingDetail ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DemandeMaterielList;
