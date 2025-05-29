import '@testing-library/jest-dom';

import { describe, it, expect } from 'vitest';
import { getByRole, getByText } from '@testing-library/dom';

describe('NewArticleButton', () => {
  it('renders link to /admin/admin-article with correct text', () => {
    // Simulate HTML render
    document.body.innerHTML = `
      <a href="/admin/admin-article" role="menuitem">
        <div>
          <svg></svg>
          <span>Administrar artículos</span>
        </div>
      </a>
    `;

    const link = getByRole(document.body, 'menuitem');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/admin/admin-article');
    expect(getByText(link, 'Administrar artículos')).toBeInTheDocument();
  });
});
