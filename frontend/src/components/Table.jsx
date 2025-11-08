import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const Table = ({ headers = [], data = [], onEdit, onDelete }) => {
  if (!Array.isArray(headers) || headers.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700">En-têtes de table manquants</p>
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">Aucune donnée à afficher</p>
      </div>
    );
  }

  const hasActions = onEdit || onDelete;

  // Fonction pour obtenir les clés des données (utilise la première ligne)
  const dataKeys = Object.keys(data[0] || {});

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
      <table className="min-w-full">
        <thead className="bg-gradient-to-r from-green-600 to-green-700">
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
            {hasActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="hover:bg-gray-50 transition-colors"
            >
              {dataKeys.map((key, cellIndex) => (
                <td 
                  key={cellIndex} 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                >
                  {row[key] || '-'}
                </td>
              ))}
              {hasActions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(row)}
                      className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                      title="Modifier"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(row)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;