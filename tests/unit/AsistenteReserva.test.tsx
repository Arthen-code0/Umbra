import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import AsistenteReserva from '../../src/islands/AsistenteReserva';

const ESPERA = { timeout: 4000 };

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

async function avanzarHastaPasoDatos(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.click(screen.getByRole('radio', { name: /Noche de estrellas en familia/i }));
  await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

  const selectorFecha = await screen.findByLabelText('Fecha', undefined, ESPERA);
  const opcionConPlazas = Array.from((selectorFecha as HTMLSelectElement).options).find((opcion) =>
    opcion.textContent?.includes('plazas libres'),
  );
  await usuario.selectOptions(selectorFecha, opcionConPlazas!.value);
  await usuario.click(screen.getByRole('button', { name: 'Continuar' }));
  await screen.findByRole('heading', { name: /3\. Tus datos/ });
}

describe('AsistenteReserva', () => {
  it('avanza del paso 1 al 2 con la experiencia elegida (CA-05.1)', async () => {
    const usuario = userEvent.setup();
    render(<AsistenteReserva />);

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    await usuario.click(screen.getByRole('radio', { name: /Pequeños astrónomos/i }));
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText(/Pequeños astrónomos · horario/)).toBeInTheDocument();
  });

  it('muestra "Este campo es obligatorio" y mueve el foco al primer error (CA-05.3)', async () => {
    const usuario = userEvent.setup();
    render(<AsistenteReserva />);
    await avanzarHastaPasoDatos(usuario);

    await usuario.type(screen.getByLabelText('Nombre y apellidos'), 'Ana García');
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getAllByText('Este campo es obligatorio')).toHaveLength(2);
    expect(screen.getByLabelText('Correo electrónico')).toHaveFocus();
  });

  it('valida el email al salir del campo (CA-05.4)', async () => {
    const usuario = userEvent.setup();
    render(<AsistenteReserva />);
    await avanzarHastaPasoDatos(usuario);

    await usuario.type(screen.getByLabelText('Correo electrónico'), 'sin-arroba');
    await usuario.tab();

    expect(screen.getByText('Introduce un correo electrónico válido')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
  });

  it('bloquea el botón durante el envío y muestra la confirmación (CA-05.5)', async () => {
    const usuario = userEvent.setup();
    render(<AsistenteReserva />);
    await avanzarHastaPasoDatos(usuario);

    await usuario.type(screen.getByLabelText('Nombre y apellidos'), 'Ana García');
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await usuario.type(screen.getByLabelText('Teléfono'), '600111222');
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    await usuario.click(await screen.findByRole('button', { name: 'Confirmar reserva' }));
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();

    expect(await screen.findByText(/UMB-[A-Z0-9]{6}/, undefined, ESPERA)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reserva confirmada' })).toBeInTheDocument();
  });

  it('muestra el error de la API y reactiva el botón (CA-05.6)', async () => {
    const usuario = userEvent.setup();
    render(<AsistenteReserva />);
    await avanzarHastaPasoDatos(usuario);

    await usuario.type(screen.getByLabelText('Nombre y apellidos'), 'Ana García');
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await usuario.type(screen.getByLabelText('Teléfono'), '600111222');
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    window.history.replaceState({}, '', '/reservar?simular=error');
    await usuario.click(await screen.findByRole('button', { name: 'Confirmar reserva' }));

    expect(await screen.findByRole('alert', undefined, ESPERA)).toHaveTextContent(
      /sistema de reservas no responde/,
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Confirmar reserva' })).toBeEnabled(),
    );
  });
});
