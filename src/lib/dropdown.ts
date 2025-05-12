// Script para manejar la funcionalidad del dropdown con TypeScript
document.addEventListener('DOMContentLoaded', (): void => {
  const menuButton: HTMLElement | null = document.getElementById('user-menu-button');
  const menuContainer: HTMLElement | null = document.getElementById('user-menu-container');
  const dropdownMenu: HTMLElement | null = document.getElementById('user-dropdown-menu');

  if (!menuButton || !menuContainer || !dropdownMenu) return;

  // Función para mostrar/ocultar el menú
  const toggleMenu = (): void => {
    const expanded: boolean = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', (!expanded).toString());

    if (expanded) {
      dropdownMenu.classList.add('hidden');
    } else {
      dropdownMenu.classList.remove('hidden');
    }
  };

  // Mostrar/ocultar al hacer clic en el botón
  menuButton.addEventListener('click', (e: MouseEvent): void => {
    e.stopPropagation();
    toggleMenu();
  });

  // Cerrar el menú al hacer clic fuera de él
  document.addEventListener('click', (e: MouseEvent): void => {
    const target = e.target as Node;
    if (menuContainer && !menuContainer.contains(target)) {
      menuButton.setAttribute('aria-expanded', 'false');
      dropdownMenu.classList.add('hidden');
    }
  });

  // Cerrar el menú al presionar la tecla Escape
  document.addEventListener('keydown', (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      menuButton.setAttribute('aria-expanded', 'false');
      dropdownMenu.classList.add('hidden');
    }
  });
});