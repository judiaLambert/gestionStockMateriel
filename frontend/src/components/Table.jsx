import React, { useState } from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const Table = ({ headers = [], data = [], onEdit, onDelete, itemsPerPage = 15 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!Array.isArray(headers) || headers.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-yellow-700 font-medium">⚠️ En-têtes de table manquants</p>
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <p className="text-gray-500 text-lg">Aucune donnée à afficher</p>
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const hasActions = onEdit || onDelete;
  const dataKeys = Object.keys(data[0] || {});

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-green-600 to-green-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  #
                </th>
                {headers.map((header, index) => (
                  <th 
                    key={index} 
                    className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
                {hasActions && (
                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-green-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                    {startIndex + rowIndex + 1}
                  </td>
                  {dataKeys.map((key, cellIndex) => (
                    <td 
                      key={cellIndex} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {row[key] || '-'}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(row)}
                            className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(row)}
                            className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-600">
            Affichage de <span className="font-bold text-green-700">{startIndex + 1}</span> à{' '}
            <span className="font-bold text-green-700">{Math.min(endIndex, data.length)}</span> sur{' '}
            <span className="font-bold text-green-700">{data.length}</span> entrées
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === index + 1
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg'
                      : 'border border-gray-300 hover:bg-green-50 text-gray-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
