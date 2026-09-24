import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import PanelCielo from '../../src/islands/PanelCielo';

const ESPERA = { timeout: 4000 };

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('PanelCielo', () => {
  it('muestra el estado de carga y después los datos (CA-08.1, CA-08.2)', async () => {
    render(<PanelCielo />);
    expect(screen.getByText('Cargando el cielo de esta noche…')).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Fase lunar' }, ESPERA)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Visibilidad' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Planetas visibles' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Iluminación lunar: \d+%/ })).toBeInTheDocument();
  });

  it('muestra el error y el botón de reintentar (CA-08.3)', async () => {
    window.history.replaceState({}, '', '/el-cielo-esta-noche?simular=error');
    render(<PanelCielo />);

    expect(await screen.findByRole('alert', undefined, ESPERA)).toHaveTextContent(
      'No se han podido cargar los datos del cielo',
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
