import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color} transform hover:scale-105 transition-all duration-300`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-gray-800 mt-3">{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${color.replace('border', 'bg').replace('600', '100')} shadow-md`}>
          <Icon className={color.replace('border', 'text')} size={32} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
