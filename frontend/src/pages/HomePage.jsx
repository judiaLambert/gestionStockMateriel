import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, ArrowRight } from 'lucide-react';
import logoENI from '../assets/IMG-20250925-WA0000.jpg'; // Ajustez le chemin selon votre structure

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        
        {/* Logo et titre */}
        <div className="text-center mb-12 animate-fadeIn">
          
<img 
  src={logoENI} 
  alt="Logo ENI" 
  className="w-40 h-40 object-contain mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
  style={{ 
    filter: 'brightness(1.2) contrast(1.1)',
    mixBlendMode: 'multiply' 
  }}
/>


          
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Comptabilité Matière
          </h1>
          <h2 className="text-2xl text-green-700 font-semibold mb-6">
            École Nationale d'Informatique
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Système complet de gestion et de traçabilité du patrimoine matériel.
            <br />
            <span className="font-semibold text-green-700">
              Préservation des deniers publics • Sauvegarde du patrimoine • Bonne gouvernance
            </span>
          </p>
        </div>

        {/* Cartes de connexion */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* Admin Card */}
          <div
            onClick={() => navigate('/login-admin')}
            className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
          >
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Administrateur</h3>
              <p className="text-green-100">Accès complet au système</p>
            </div>
            <div className="p-8">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Gestion complète du stock
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Validation des demandes
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Rapports et statistiques
                </li>
              </ul>
              <div className="flex items-center justify-between text-green-700 font-semibold group-hover:translate-x-2 transition-transform">
                <span>Se connecter</span>
                <ArrowRight size={20} />
              </div>
            </div>
          </div>

          {/* Demandeur Card */}
          <div
            onClick={() => navigate('/login-demandeur')}
            className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Demandeur</h3>
              <p className="text-blue-100">Gestion des demandes</p>
            </div>
            <div className="p-8">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Créer des demandes
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Suivre vos demandes
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Signaler des pannes
                </li>
              </ul>
              <div className="flex items-center justify-between text-blue-700 font-semibold group-hover:translate-x-2 transition-transform">
                <span>Se connecter</span>
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="text-sm">
            🔒 Système sécurisé de gestion du patrimoine matériel de l'ENI
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
