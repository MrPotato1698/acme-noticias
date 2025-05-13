interface FilterState {
  q: string;
  category: string;
  author: string;
  sort: string;
}

document.addEventListener('DOMContentLoaded', (): void => {
  // Elementos del DOM
  const searchForm = document.getElementById('search-form') as HTMLFormElement;
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const categoryInputs = document.querySelectorAll('input[name="category"]') as NodeListOf<HTMLInputElement>;
  const sortInputs = document.querySelectorAll('input[name="sort"]') as NodeListOf<HTMLInputElement>;
  const authorSearch = document.getElementById('author-search') as HTMLInputElement;
  const authorDropdown = document.getElementById('author-dropdown') as HTMLDivElement;
  const authorOptions = document.querySelectorAll('.author-option') as NodeListOf<HTMLDivElement>;
  const selectedAuthorId = document.getElementById('selected-author-id') as HTMLInputElement;
  const selectedAuthorDisplay = document.getElementById('selected-author-display') as HTMLDivElement;
  const applyFiltersBtn = document.getElementById('apply-filters') as HTMLButtonElement;
  const clearFiltersBtn = document.getElementById('clear-filters') as HTMLButtonElement;

  // Estado actual de los filtros
  const currentState: FilterState = {
    q: searchInput.value,
    category: getSelectedRadioValue(categoryInputs),
    author: selectedAuthorId.value,
    sort: getSelectedRadioValue(sortInputs)
  };

  // Función para obtener el valor seleccionado de un grupo de radio buttons
  function getSelectedRadioValue(radioInputs: NodeListOf<HTMLInputElement>): string {
    for (const input of radioInputs) {
      if (input.checked) {
        return input.value;
      }
    }
    return '';
  }

  // Función para aplicar los filtros y navegar a la URL con los parámetros
  function applyFilters(): void {
    const url = new URL(window.location.href);
    
    // Actualizar los parámetros de búsqueda
    if (currentState.q) {
      url.searchParams.set('q', currentState.q);
    } else {
      url.searchParams.delete('q');
    }
    
    if (currentState.category) {
      url.searchParams.set('category', currentState.category);
    } else {
      url.searchParams.delete('category');
    }
    
    if (currentState.author) {
      url.searchParams.set('author', currentState.author);
    } else {
      url.searchParams.delete('author');
    }
    
    if (currentState.sort && currentState.sort !== 'newest') {
      url.searchParams.set('sort', currentState.sort);
    } else {
      url.searchParams.delete('sort');
    }
    
    // Navegar a la URL con los filtros aplicados
    window.location.href = url.toString();
  }

  // Función para limpiar todos los filtros
  function clearFilters(): void {
    // Resetear el estado
    currentState.q = '';
    currentState.category = '';
    currentState.author = '';
    currentState.sort = 'newest';
    
    // Resetear los controles de la UI
    searchInput.value = '';
    
    // Seleccionar "Todas las categorías"
    for (const input of categoryInputs) {
      input.checked = input.value === '';
    }
    
    // Seleccionar "Más recientes primero"
    for (const input of sortInputs) {
      input.checked = input.value === 'newest';
    }
    
    // Limpiar el autor seleccionado
    selectedAuthorId.value = '';
    authorSearch.value = '';
    selectedAuthorDisplay.textContent = '';
    
    // Aplicar los filtros (esto navegará a la URL sin parámetros)
    applyFilters();
  }

  // Manejar la búsqueda por palabra clave
  searchForm.addEventListener('submit', (e: Event): void => {
    e.preventDefault();
    currentState.q = searchInput.value;
    applyFilters();
  });

  // Manejar cambios en las categorías
  categoryInputs.forEach((input: HTMLInputElement): void => {
    input.addEventListener('change', (): void => {
      currentState.category = input.value;
    });
  });

  // Manejar cambios en las opciones de ordenamiento
  sortInputs.forEach((input: HTMLInputElement): void => {
    input.addEventListener('change', (): void => {
      currentState.sort = input.value;
    });
  });

  // Manejar el combobox de redactores
  authorSearch.addEventListener('focus', (): void => {
    authorDropdown.classList.remove('hidden');
  });

  authorSearch.addEventListener('input', (e: Event): void => {
    const target = e.target as HTMLInputElement;
    const searchValue = target.value.toLowerCase();
    
    // Filtrar las opciones basadas en la búsqueda
    authorOptions.forEach((option: HTMLDivElement): void => {
      const authorName = option.textContent?.toLowerCase() ?? '';
      if (authorName.includes(searchValue) || searchValue === '') {
        option.classList.remove('hidden');
      } else {
        option.classList.add('hidden');
      }
    });
  });

  // Cerrar el dropdown cuando se hace clic fuera
  document.addEventListener('click', (e: MouseEvent): void => {
    const target = e.target as Node;
    if (!authorSearch.contains(target) && !authorDropdown.contains(target)) {
      authorDropdown.classList.add('hidden');
    }
  });

  // Manejar la selección de un redactor
  authorOptions.forEach((option: HTMLDivElement): void => {
    option.addEventListener('click', (): void => {
      const authorId = option.getAttribute('data-author-id') ?? '';
      const authorName = option.getAttribute('data-author-name') ?? 'Todos los redactores';
      
      // Actualizar el estado y la UI
      currentState.author = authorId;
      selectedAuthorId.value = authorId;
      authorSearch.value = authorId ? authorName : '';
      
      if (authorId) {
        selectedAuthorDisplay.textContent = `Filtrando por: ${authorName}`;
      } else {
        selectedAuthorDisplay.textContent = '';
      }
      
      // Cerrar el dropdown
      authorDropdown.classList.add('hidden');
    });
  });

  // Manejar el botón de aplicar filtros
  applyFiltersBtn.addEventListener('click', applyFilters);

  // Manejar el botón de limpiar filtros
  clearFiltersBtn.addEventListener('click', clearFilters);

  // Inicializar el combobox con el autor seleccionado actualmente
  if (currentState.author) {
    const selectedOption = document.querySelector(`[data-author-id="${currentState.author}"]`) as HTMLDivElement;
    if (selectedOption) {
      const authorName = selectedOption.getAttribute('data-author-name') ?? '';
      authorSearch.value = authorName;
    }
  }
});