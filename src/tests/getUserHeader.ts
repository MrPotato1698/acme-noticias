export function renderUserMenu(isLoggedIn: boolean, role: string = ''): HTMLElement {
    if (isLoggedIn) {
        const container = document.createElement('div');
        container.id = 'dropdown-menu';

        const button = document.createElement('button');
        button.textContent = 'Mi Cuenta';

        const span = document.createElement('span');
        span.textContent = role;

        container.appendChild(button);
        container.appendChild(span);

        return container;
    } else {
        const link = document.createElement('a');
        link.href = '/login';
        link.textContent = 'Iniciar Sesión';

        return link;
    }
}
