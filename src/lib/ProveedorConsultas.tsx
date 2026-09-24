import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

/**
 * Cada isla de Astro es una raíz de hidratación independiente, así que cada
 * una crea su propio QueryClient (no hay estado de servidor compartido
 * entre islas en esta demo). Ver references/integracion-api.md de la skill:
 * TanStack Query en lugar de reinventar fetch+estado con useEffect.
 */
export default function ProveedorConsultas({ children }: { children: ReactNode }) {
  const [cliente] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Sin reintentos automáticos: cada endpoint simulado ya resuelve
            // en 300-900 ms, y los estados de error de la interfaz ofrecen
            // su propio botón "Reintentar" (CA-08.3, CA-05.6). Reintentar en
            // segundo plano no aporta aquí y solo retrasa ver el error.
            retry: false,
            staleTime: 30_000,
            // La API simulada nunca usa fetch real (solo latencia con
            // setTimeout): no depende de la conectividad real del navegador.
            networkMode: 'always',
          },
        },
      }),
  );
  return <QueryClientProvider client={cliente}>{children}</QueryClientProvider>;
}
