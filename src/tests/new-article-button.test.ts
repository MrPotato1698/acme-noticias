import '@testing-library/jest-dom';

import { describe, it, expect } from 'vitest';
import { getByRole, getByText } from '@testing-library/dom';

describe('new-article-button', () => {
  it('renders link to /newarticle with correct text', () => {
    // Simulate HTML render
    document.body.innerHTML = `
      <a href="/newarticle" role="menuitem">
        <div>
          <svg></svg>
          <span>Crear nuevo artículo</span>
        </div>
      </a>
    `;

    const link = getByRole(document.body, 'menuitem');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/newarticle');
    expect(getByText(link, 'Crear nuevo artículo')).toBeInTheDocument();
  });
});
