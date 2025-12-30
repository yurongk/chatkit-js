import * as React from 'react';
import type { ChatKitOptions } from '@xpert-ai/chatkit-types';
import { A2UIProvider } from "@xpert-ai/a2ui-react";
import { Chat } from "./components/chat";
import { StreamProvider } from "./providers/Stream";
import { ThemeProvider } from "./providers/Theme";
import { setLanguage } from "./i18n";
import { useParentMessenger } from './hooks/useParentMessenger';

export type AppProps = {
  options?: ChatKitOptions | null;
  clientSecret: string;
};

export function App({ clientSecret, options }: AppProps) {
  const { isParentAvailable, sendCommand } = useParentMessenger();
  const apiKey = clientSecret.trim() ? clientSecret : undefined;
  const xpertId = import.meta.env.VITE_XPERTAI_XPERT_ID as string | undefined;
  const apiUrl = import.meta.env.VITE_XPERTAI_API_URL as string | undefined;

  // Extract options
  const theme = options?.theme;
  const locale = options?.locale;

  React.useEffect(() => {
    if (!locale) return;
    setLanguage(locale);
  }, [locale]);

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen">
        <A2UIProvider onAction={(action) => {
          if (isParentAvailable) sendCommand('onWidgetAction', { action: action.actionId, widgetItem: action.context });
        }}>
          <StreamProvider apiKey={apiKey} apiUrl={options?.api.apiUrl || apiUrl} xpertId={options?.api.xpertId || xpertId}>
            <Chat
              className="flex-1"
              clientSecret={apiKey}
              options={options}
            />
          </StreamProvider>
        </A2UIProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
