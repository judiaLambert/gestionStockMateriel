import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-400 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-white font-bold text-3xl">ENI</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Chargement...</h3>
        <p className="text-gray-600">Comptabilité Matière ENI</p>
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
