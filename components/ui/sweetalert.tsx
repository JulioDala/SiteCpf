"use client"

import Swal from "sweetalert2"

// Função helper para configuração base
const getBaseConfig = () => ({
  // Z-index muito alto para garantir sobreposição
  customClass: {
    container: 'swal2-container-custom !z-[9999]',
    popup: 'swal2-popup-custom !z-[10000]',
    backdrop: 'swal2-backdrop-custom !z-[9998]'
  },
  // Configurações para garantir que eventos funcionem
  allowOutsideClick: true,
  allowEscapeKey: true,
  stopKeydownPropagation: false,
  // Callback para gerenciar estado
  didOpen: () => {
    // Marcar que SweetAlert está ativo
    document.body.setAttribute('data-swal-active', 'true');

    // Adicionar CSS dinâmico se necessário
    const style = document.createElement('style');
    style.id = 'swal-dialog-fix';
    style.innerHTML = `
      .swal2-container-custom {
        z-index: 9999 !important;
        pointer-events: auto !important;
      }
      .swal2-popup-custom {
        z-index: 10000 !important;
        pointer-events: auto !important;
      }
      .swal2-backdrop-custom {
        z-index: 9998 !important;
        pointer-events: auto !important;
      }
      /* Reduzir z-index do Dialog quando SweetAlert está ativo */
      body[data-swal-active="true"] [data-radix-dialog-overlay] {
        z-index: 20 !important;
      }
      body[data-swal-active="true"] [data-radix-dialog-content] {
        z-index: 25 !important;
      }
    `;

    if (!document.getElementById('swal-dialog-fix')) {
      document.head.appendChild(style);
    }
  },
  didClose: () => {
    // Remover marcação
    document.body.removeAttribute('data-swal-active');

    // Remover CSS dinâmico
    const style = document.getElementById('swal-dialog-fix');
    if (style) {
      style.remove();
    }
  }
});

export const showSuccessAlert = (title: string, text?: string) => {
  return Swal.fire({
    ...getBaseConfig(),
    title,
    text,
    icon: "success",
    timer: 2500,
    timerProgressBar: true,
  });
};

export const showErrorAlert = (title: string, text?: string) => {
  return Swal.fire({
    ...getBaseConfig(),
    title,
    text,
    icon: "error",
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: true,
    focusConfirm: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    didOpen: () => {
      if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
      }
    }
  });
};

export const showConfirmAlert = (title: string, text?: string) => {
  return Swal.fire({
    ...getBaseConfig(),
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, confirmar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#8b5cf6",
    cancelButtonColor: "#6b7280",
    // Configurações extras para botões funcionarem
    focusConfirm: true,
    reverseButtons: false,
    buttonsStyling: true,
    showConfirmButton: true
  });
};

export const showInfoAlert = (title: string, text?: string) => {
  return Swal.fire({
    ...getBaseConfig(),
    title,
    text,
    icon: "info",
    timer: 2500,
    timerProgressBar: true,
  });
};