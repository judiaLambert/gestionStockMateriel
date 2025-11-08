import React, { useState, useEffect } from 'react';
import { Check, X, Mail, User, Phone, Building } from 'lucide-react';
import { getPendingDemandeurs, activateDemandeur, rejectDemandeur } from '../api/authAPI';

const DemandesInscription = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');

  const fetchDemandes = async () => {
    try {
      const result = await getPendingDemandeurs();
      if (result.success) {
        setDemandes(result.data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const handleActivate = async (demande) => {
    console.log('🔄 Activation demande:', demande);
    
    // CORRECTION : L'ID utilisateur est dans demande.utilisateur.id_utilisateur
    const userId = demande.utilisateur?.id_utilisateur;
    console.log('🔍 ID Utilisateur:', userId);
    
    if (!userId) {
      alert('Erreur: ID utilisateur non trouvé');
      return;
    }
    
    // CORRECTION : Passer l'ID utilisateur avec la demande
    setSelectedDemande({
      ...demande,
      id_utilisateur: userId // Ajouter l'ID utilisateur explicitement
    });
    generatePassword();
    setShowModal(true);
  };

  const confirmActivation = async () => {
    try {
      // CORRECTION : Utiliser selectedDemande.id_utilisateur
      const result = await activateDemandeur(selectedDemande.id_utilisateur, password);
      if (result.success) {
        alert(`✅ Compte activé !\nMot de passe envoyé à: ${selectedDemande.email}`);
        setShowModal(false);
        fetchDemandes();
      }
    } catch (error) {
      alert('❌ Erreur lors de l\'activation');
    }
  };

  const handleReject = async (demande) => {
    // CORRECTION : Utiliser demande.utilisateur.id_utilisateur
    const userId = demande.utilisateur?.id_utilisateur;
    
    if (!userId) {
      alert('Erreur: ID utilisateur non trouvé');
      return;
    }

    if (confirm(`Refuser la demande de ${demande.nom} ?`)) {
      try {
        await rejectDemandeur(userId);
        fetchDemandes();
      } catch (error) {
        alert('❌ Erreur lors du refus');
      }
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Demandes d'Inscription en Attente</h1>
        <span className="bg-orange-500 text-white px-3 py-1 rounded-full">
          {demandes.length} demande(s)
        </span>
      </div>

      {demandes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucune demande en attente</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {demandes.map((demande) => {
            // CORRECTION : Afficher les bonnes données
            const userId = demande.utilisateur?.id_utilisateur;
            
            return (
              <div key={userId || demande.id_demandeur} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User size={20} className="text-gray-400" />
                      <h3 className="font-semibold text-lg">{demande.nom}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{demande.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        <span>{demande.telephone || 'Non renseigné'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building size={16} />
                        <span>
                          Type: <strong className="capitalize">{demande.type_demandeur}</strong>
                        </span>
                      </div>
                      
                      {demande.departement && (
                        <div className="flex items-center gap-2">
                          <Building size={16} />
                          <span>Département: {demande.departement.nom_service}</span>
                        </div>
                      )}
                    </div>

                    {/* CORRECTION : Afficher l'ID utilisateur pour debug */}
                    <div className="mt-2 text-xs text-gray-400">
                      ID Utilisateur: {userId}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleActivate(demande)}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                      title="Accepter"
                    >
                      <Check size={20} />
                    </button>
                    
                    <button
                      onClick={() => handleReject(demande)}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                      title="Refuser"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmation */}
      {showModal && selectedDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Activer le compte</h3>
            
            <div className="mb-4">
              <p>Compte: <strong>{selectedDemande.nom}</strong></p>
              <p>Email: <strong>{selectedDemande.email}</strong></p>
              <p className="text-sm text-gray-500">ID: {selectedDemande.id_utilisateur}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Mot de passe temporaire
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={password}
                  readOnly
                  className="flex-1 border border-gray-300 rounded px-3 py-2 bg-gray-50"
                />
                <button
                  onClick={generatePassword}
                  className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"
                >
                  Regénérer
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Ce mot de passe sera envoyé par email à l'utilisateur.
                Il devra le changer à sa première connexion.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmActivation}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirmer l'activation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandesInscription;