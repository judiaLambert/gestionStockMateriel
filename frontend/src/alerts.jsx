import { toast } from 'react-hot-toast';

export const showSuccess = (message, title = 'Succès') => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10B981',
      color: '#fff',
      padding: '16px',
      borderRadius: '10px',
      fontWeight: '500',
    },
    icon: '✓',
  });
};

export const showError = (message, title = 'Erreur') => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#EF4444',
      color: '#fff',
      padding: '16px',
      borderRadius: '10px',
      fontWeight: '500',
    },
    icon: '✕',
  });
};

export const showWarning = (message, title = 'Attention') => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#F59E0B',
      color: '#fff',
      padding: '16px',
      borderRadius: '10px',
      fontWeight: '500',
    },
    icon: '⚠',
  });
};

export const showInfo = (message) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#3B82F6',
      color: '#fff',
      padding: '16px',
      borderRadius: '10px',
      fontWeight: '500',
    },
    icon: 'ℹ',
  });
};

export const showConfirm = (message, onConfirm) => {
  toast(
    (t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              onConfirm();
              toast.dismiss(t.id);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Confirmer
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: 'top-center',
      style: {
        background: '#fff',
        padding: '16px',
        borderRadius: '10px',
        border: '2px solid #e5e7eb',
      },
    }
  );
};
