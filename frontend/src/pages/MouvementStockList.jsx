import React, { useEffect, useState } from 'react';
import { Search, Package, ArrowUpCircle, ArrowDownCircle, Clock, Filter } from 'lucide-react';
import { getMouvementsRecent, getMouvementsStats } from '../api/mouvementAPI';
import { showError } from '../alerts';

const MouvementStockList = () => {
  const [mouvements, setMouvements] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('TOUS');

  const typesMouvement = [
    { value: 'TOUS', label: 'Tous les mouvements' },
    { value: 'ENTREE', label: 'Entrées', color: 'text-green-600' },
    { value: 'SORTIE', label: 'Sorties', color: 'text-red-600' },
    { value: 'RESERVATION', label: 'Réservations', color: 'text-orange-600' },
  ];

  const fetchData = async () => {
    try {
      const [mouvementsRes, statsRes] = await Promise.all([
        getMouvementsRecent(),
        getMouvementsStats()
      ]);
      setMouvements(mouvementsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      showError('Impossible de charger les mouvements');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTypeColor = (type) => {
    const colors = {
      'ENTREE': 'bg-green-100 text-green-800 border-green-200',
      'SORTIE': 'bg-red-100 text-red-800 border-red-200',
      'RESERVATION': 'bg-orange-100 text-orange-800 border-orange-200',
      'DERESERVATION': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ENTREE': return <ArrowUpCircle size={16} className="text-green-600" />;
      case 'SORTIE': return <ArrowDownCircle size={16} className="text-red-600" />;
      case 'RESERVATION': return <Clock size={16} className="text-orange-600" />;
      default: return <Package size={16} className="text-gray-600" />;
    }
  };

  const filteredMouvements = mouvements.filter(mouvement =>
    (filterType === 'TOUS' || mouvement.type_mouvement === filterType) &&
    (mouvement.materiel?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     mouvement.motif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     mouvement.type_reference?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historique des Mouvements</h1>
            <p className="text-gray-600">Suivi de tous les mouvements de stock</p>
          </div>
          
          {stats && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Total mouvements</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalMouvements}</p>
            </div>
          )}
        </div>

        {/* Filtres et Recherche */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtre par type */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {typesMouvement.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par matériel, motif ou référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des mouvements */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matériel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMouvements.map((mouvement) => (
                <tr key={mouvement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-blue-600" />
                      <span className="font-medium text-sm">{mouvement.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {mouvement.materiel?.designation}
                    </div>
                    <div className="text-sm text-gray-500">
                      {mouvement.materiel?.typeMateriel?.designation}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(mouvement.type_mouvement)}
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getTypeColor(mouvement.type_mouvement)}`}>
                        {mouvement.type_mouvement}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${
                      mouvement.type_mouvement === 'ENTREE' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {mouvement.type_mouvement === 'ENTREE' ? '+' : '-'}{mouvement.quantite}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{formatDate(mouvement.date_mouvement)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {mouvement.type_reference && (
                      <div className="text-sm">
                        <div className="text-gray-900">{mouvement.type_reference}</div>
                        <div className="text-gray-500">{mouvement.id_reference}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{mouvement.motif}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMouvements.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun mouvement trouvé</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'TOUS' 
                  ? 'Aucun mouvement ne correspond à vos critères' 
                  : 'Aucun mouvement enregistré pour le moment'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MouvementStockList;