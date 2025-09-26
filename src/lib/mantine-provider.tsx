'use client';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

export function MantineProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider>
      <ModalsProvider>
        {children}
        <Notifications />
      </ModalsProvider>
    </MantineProvider>
  );
}
