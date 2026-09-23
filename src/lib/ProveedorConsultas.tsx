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
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );
  return <QueryClientProvider client={cliente}>{children}</QueryClientProvider>;
}
