import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import CatalogoExperiencias from '../../src/islands/CatalogoExperiencias';

const ESPERA = { timeout: 4000 };

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('CatalogoExperiencias', () => {
  it('muestra skeletons y después las 6 experiencias', async () => {
    render(<CatalogoExperiencias />);
    expect(screen.getByText('Cargando experiencias…')).toBeInTheDocument();
    expect(await screen.findAllByRole('heading', { level: 3 }, ESPERA)).toHaveLength(6);
  });

  it('filtra por apta para niños (CA-02.1)', async () => {
    const usuario = userEvent.setup();
    render(<CatalogoExperiencias />);
    await screen.findAllByRole('heading', { level: 3 }, ESPERA);

    await usuario.click(screen.getByRole('checkbox', { name: 'Apta para niños' }));

    await screen.findByText('Noche de estrellas en familia', undefined, ESPERA);
    expect(screen.queryByText('Caza de la Vía Láctea')).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
  });

  it('respeta el precio máximo de la URL (CA-02.2)', async () => {
    window.history.replaceState({}, '', '/experiencias?precioMax=30');
    render(<CatalogoExperiencias />);
    const titulos = await screen.findAllByRole('heading', { level: 3 }, ESPERA);
    expect(titulos.map((titulo) => titulo.textContent)).toEqual([
      'Noche de estrellas en familia',
      'Pequeños astrónomos',
    ]);
  });

  it('muestra el estado vacío con "Quitar filtros" (CA-02.3)', async () => {
    const usuario = userEvent.setup();
    window.history.replaceState({}, '', '/experiencias?precioMax=15');
    render(<CatalogoExperiencias />);

    expect(
      await screen.findByText(
        'Ninguna experiencia cumple estos filtros ahora mismo.',
        undefined,
        ESPERA,
      ),
    ).toBeInTheDocument();
    await usuario.click(screen.getAllByRole('button', { name: 'Quitar filtros' }).at(-1)!);
    expect(await screen.findAllByRole('heading', { level: 3 }, ESPERA)).toHaveLength(6);
  });

  it('muestra el error simulado con botón de reintentar', async () => {
    window.history.replaceState({}, '', '/experiencias?simular=error');
    render(<CatalogoExperiencias />);
    expect(await screen.findByRole('alert', undefined, ESPERA)).toHaveTextContent(
      'No se han podido cargar las experiencias',
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
