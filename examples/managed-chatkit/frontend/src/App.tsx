import { useEffect } from 'react';
import { useChatKit, ChatKit } from '@xpert-ai/chatkit-react';
import { ChatKitOptions, ClientToolMessageInput } from '@xpert-ai/chatkit-types';
import { useAppStore } from './store/useAppStore';

// ============================================================================
// Playground config - copied from https://chatkit.studio/playground
// Only whitelisted options take effect: theme, composer, startScreen, api
// Other options (e.g., threadItemActions.feedback) are automatically filtered out
// ============================================================================
const playgroundConfig: Partial<ChatKitOptions> = {
  theme: {
    
  },
  composer: {
    attachments: {
      enabled: true,
      maxCount: 5,
      maxSize: 10485760
    },
    tools: [
      {
        id: 'search_docs',
        label: 'Search docs',
        shortLabel: 'Docs',
        placeholderOverride: 'Search documentation',
        icon: 'book-open',
        pinned: false
      }
      // ...and 1 more tool
    ],
  },
  startScreen: {
    greeting: '',
    prompts: [
      {
        icon: 'circle-question',
        label: 'What is ChatKit?',
        prompt: 'What is ChatKit?'
      }
      // ...and 4 more prompts
    ],
  },
};


// Final config
export default function App() {
  const xpertApiUrl = (import.meta.env.VITE_XPERTAI_API_URL as string | undefined) ?? '';
  const backendOrigin = (import.meta.env.VITE_CHATKIT_BACKEND as string | undefined) ?? '';
  const assistantId = (import.meta.env.VITE_CHATKIT_XPERT_ID as string | undefined) ?? '';
  const frameUrl = (import.meta.env.VITE_CHATKIT_TARGET as string | undefined) ?? '';

  const setChatkit = useAppStore((state) => state.setChatkit);

  const chatkitOptions = useChatKit({
    ...playgroundConfig,
    frameUrl,
    api: {
      apiUrl: xpertApiUrl,
      xpertId: assistantId,
      getClientSecret: async () => {
        const createSessionUrl = backendOrigin
          ? `${backendOrigin.replace(/\/$/, '')}/api/create-session`
          : '/api/create-session';

        const response = await fetch(createSessionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(assistantId ? { assistantId } : {}),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data.client_secret) {
          throw new Error('Missing client_secret in response');
        }

        return data.client_secret;
      }
    },
    onClientTool: async ({ name, params, id, tool_call_id }): Promise<ClientToolMessageInput> => {
      console.log(`Client tool invoked: ${name}`, params, id, tool_call_id);
      return {
        tool_call_id: tool_call_id || id,
        name: name,
        status: 'success',
        content: `You invoked the "${name}" tool with parameters: ${JSON.stringify(params)}`,
      };
    },
    onError: (error) => {
      console.error('Failed to create session:', error);
    },
    onReady: () => {
      setChatkit(chatkitOptions);
    },
    onEffect: ({name, data}) => {
      console.log(`Effect triggered: ${name}`, data);
    }
  });

  useEffect(() => {
    console.log('Managed Chatkit Example with React Component');
    console.log('Backend:', backendOrigin || '(using proxy)');
    console.log('Assistant ID:', assistantId);
    console.log('Theme:', playgroundConfig.theme);
  }, [backendOrigin, assistantId]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-4 border-r overflow-hidden border-gray-300 bg-white">
        <h1 className="text-2xl font-bold mb-4">Managed Chatkit Example</h1>
        <p className="text-sm text-gray-600 mb-2">Using React Component with Options</p>

        <div className="space-y-2 text-xs text-gray-500">
          <div>
            <strong>Backend:</strong> {backendOrigin || '(proxy)'}
          </div>
          <div>
            <strong>Chatkit URL:</strong>
            <div className="break-all mt-1 p-1 bg-gray-100 rounded text-[10px]">
              {frameUrl || '(unset)'}
            </div>
          </div>
          <div>
            <strong>Assistant:</strong> {assistantId || '(default)'}
          </div>
          <div className="pt-2 border-t">
            <strong>Theme Config:</strong>
            <pre className="mt-1 p-2 bg-gray-100 rounded text-[10px] overflow-auto max-h-40">
              {JSON.stringify(playgroundConfig.theme, null, 2)}
            </pre>
          </div>

          <div>
            <button className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
              onClick={() => chatkitOptions.sendUserMessage({ text: 'Hello world!', newThread: true })}
            >
              Trigger Conversation
            </button>
          </div>
        </div>
      </div>

      <ChatKit control={chatkitOptions.control} className="shrink-0 w-[500px]" />
    </div>
  );
}
