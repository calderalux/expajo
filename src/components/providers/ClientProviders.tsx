'use client';

import { MantineProviderWrapper } from '@/lib/mantine-provider';
import { SupabaseProvider } from '@/lib/providers';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <MantineProviderWrapper>
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </MantineProviderWrapper>
  );
}
