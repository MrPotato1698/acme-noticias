import { describe, it, expect } from 'vitest';
import { renderUserMenu } from './getUserHeader';

describe('renderUserMenu', () => {
    it('shows login link when not logged in', () => {
        const element = renderUserMenu(false);

        expect(element.tagName).toBe('A');
        expect(element.textContent).toBe('Iniciar Sesión');
        expect((element as HTMLAnchorElement).href).toContain('/login');
    });

    it('shows user dropdown when logged in', () => {
        const element = renderUserMenu(true, 'admin');

        expect(element.id).toBe('dropdown-menu');

        const [button, span] = element.children;
        expect(button.textContent).toBe('Mi Cuenta');
        expect(span.textContent).toBe('admin');
    });
});
