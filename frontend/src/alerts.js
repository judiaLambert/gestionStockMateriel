import Swal from 'sweetalert2';

export const showSuccess = (message, title = 'Succès') => {
  Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#059669',
    timer: 3000
  });
};

export const showError = (message, title = 'Erreur') => {
  Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#DC2626'
  });
};

export const showWarning = (message, title = 'Attention') => {
  Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: '#D97706'
  });
};

export const showConfirm = (message, title = 'Confirmation') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#059669',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Oui',
    cancelButtonText: 'Annuler'
  });
};