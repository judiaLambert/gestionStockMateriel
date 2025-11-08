import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('600', '100')}`}>
          <Icon className={color.replace('border', 'text')} size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;