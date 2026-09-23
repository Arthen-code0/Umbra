import { describe, expect, it } from 'vitest';
import {
  listarExperiencias,
  obtenerExperiencia,
  obtenerDisponibilidad,
} from '../../../src/lib/api/experiencias';
import { crearReserva } from '../../../src/lib/api/reservas';
import { obtenerCieloEstaNoche } from '../../../src/lib/api/cielo';
import { ErrorApi } from '../../../src/lib/api/tipos';

describe('listarExperiencias', () => {
  it('devuelve las 6 experiencias paginadas por defecto', async () => {
    const respuesta = await listarExperiencias();
    expect(respuesta.data).toHaveLength(6);
    expect(respuesta.meta.total).toBe(6);
  });

  it('filtra por apta_ninos (CA-02.1)', async () => {
    const respuesta = await listarExperiencias({ aptaNinos: true });
    expect(respuesta.data.length).toBeGreaterThan(0);
    expect(respuesta.data.every((e) => e.aptaNinos)).toBe(true);
  });

  it('filtra por precio máximo (CA-02.2)', async () => {
    const respuesta = await listarExperiencias({ precioMax: 30 });
    expect(respuesta.data.every((e) => e.precio <= 30)).toBe(true);
  });

  it('devuelve una lista vacía cuando ningún resultado cumple los filtros (CA-02.3)', async () => {
    const respuesta = await listarExperiencias({ precioMax: 1 });
    expect(respuesta.data).toHaveLength(0);
  });
});

describe('obtenerExperiencia', () => {
  it('devuelve 404 con Problem Details si no existe', async () => {
    await expect(obtenerExperiencia('no-existe')).rejects.toBeInstanceOf(ErrorApi);
    try {
      await obtenerExperiencia('no-existe');
      throw new Error('no debería llegar aquí');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorApi);
      expect((error as ErrorApi).problema.status).toBe(404);
    }
  });
});

describe('obtenerDisponibilidad', () => {
  it('genera 30 días y al menos una fecha agotada', async () => {
    const disponibilidad = await obtenerDisponibilidad('noche-de-estrellas-en-familia');
    expect(disponibilidad).toHaveLength(30);
    expect(disponibilidad.some((d) => d.plazasLibres === 0)).toBe(true);
  });
});

describe('crearReserva', () => {
  it('rechaza con 422 si faltan campos obligatorios (CA-05.3)', async () => {
    await expect(
      crearReserva({
        experienciaId: 'noche-de-estrellas-en-familia',
        fecha: '2099-01-01',
        plazas: 2,
        nombre: '',
        email: '',
        telefono: '',
      }),
    ).rejects.toMatchObject({ problema: { status: 422 } });
  });

  it('rechaza con 422 si el email no es válido (CA-05.4)', async () => {
    await expect(
      crearReserva({
        experienciaId: 'noche-de-estrellas-en-familia',
        fecha: '2099-01-01',
        plazas: 2,
        nombre: 'Ana',
        email: 'no-es-un-email',
        telefono: '600111222',
      }),
    ).rejects.toMatchObject({ problema: { status: 422 } });
  });

  it('rechaza con 409 si no hay plazas suficientes (RN-01)', async () => {
    const disponibilidad = await obtenerDisponibilidad('noche-de-estrellas-en-familia');
    const fechaAgotada = disponibilidad.find((d) => d.plazasLibres === 0)!;
    await expect(
      crearReserva({
        experienciaId: 'noche-de-estrellas-en-familia',
        fecha: fechaAgotada.fecha,
        plazas: 1,
        nombre: 'Ana',
        email: 'ana@example.com',
        telefono: '600111222',
      }),
    ).rejects.toMatchObject({ problema: { status: 409 } });
  });

  it('crea la reserva con localizador cuando los datos son válidos', async () => {
    const disponibilidad = await obtenerDisponibilidad('noche-de-estrellas-en-familia');
    const fechaConPlazas = disponibilidad.find((d) => d.plazasLibres > 0)!;
    const reserva = await crearReserva({
      experienciaId: 'noche-de-estrellas-en-familia',
      fecha: fechaConPlazas.fecha,
      plazas: 1,
      nombre: 'Ana',
      email: 'ANA@Example.com',
      telefono: '600111222',
    });
    expect(reserva.localizador).toMatch(/^UMB-[A-Z0-9]{6}$/);
    expect(reserva.email).toBe('ana@example.com');
  });
});

describe('obtenerCieloEstaNoche', () => {
  it('devuelve una estructura completa y estable para una fecha fija', async () => {
    const cielo = await obtenerCieloEstaNoche(new Date('2026-09-23T12:00:00Z'));
    expect(cielo.faseLunar.porcentajeIluminacion).toBeGreaterThanOrEqual(0);
    expect(cielo.faseLunar.porcentajeIluminacion).toBeLessThanOrEqual(100);
    expect(cielo.visibilidad.valor).toBeGreaterThanOrEqual(0);
    expect(cielo.planetasVisibles.length).toBeGreaterThan(0);
  });

  it('muestra la lista vacía cuando no hay eventos en los próximos 30 días (CA-08.4)', async () => {
    // El 5 de septiembre no cae ningún evento del calendario en los 30 días siguientes.
    const cielo = await obtenerCieloEstaNoche(new Date('2026-09-05T12:00:00Z'));
    expect(cielo.proximosEventos).toHaveLength(0);
  });
});
