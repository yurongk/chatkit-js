# ChatKit React

React bindings for ChatKit, providing lightweight components and hooks to integrate conversational AI interfaces into React applications.

## Installation

```bash
npm install @xpert-ai/chatkit-react
# or
pnpm add @xpert-ai/chatkit-react
# or
yarn add @xpert-ai/chatkit-react
```

## Quick Start

```tsx
import { useChatKit, ChatKit } from '@xpert-ai/chatkit-react';

function App() {
  const chatkit = useChatKit({
    frameUrl: '<url-to-chatkit-frame>',
    api: {
      apiUrl: 'https://api.xpertai.cn',
      xpertId: 'your-assistant-id',
      getClientSecret: async () => {
        const response = await fetch('/api/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        return data.client_secret;
      }
    },
    onReady: () => {
      console.log('ChatKit is ready');
    }
  });

  return (
    <div className="h-screen w-full">
      <ChatKit control={chatkit.control} />
    </div>
  );
}
```

## API Reference

### `useChatKit(options)`

A React hook that initializes and manages a ChatKit instance.

#### Parameters

```typescript
interface UseChatKitOptions extends Partial<ChatKitOptions> {
  frameUrl: string;
  api: {
    apiUrl: string;
    xpertId: string;
    getClientSecret: () => Promise<string>;
  };
  locale?: SupportedLocale; // 'en-US' | 'zh-Hans'
  theme?: ThemeOptions;
  composer?: ComposerOptions;
  startScreen?: StartScreenOptions;
  onClientTool?: (params: ClientToolParams) => Promise<ClientToolMessageInput>;
  onError?: (error: Error) => void;
  onReady?: () => void;
  onThreadChange?: (data: { threadId: string }) => void;
  onEffect?: (data: { name: string; data: any }) => void;
}
```

#### Returns

```typescript
interface ChatKitInstance {
  control: ChatKitControl; // Pass to <ChatKit> component
  sendUserMessage: (params: SendMessageParams) => Promise<void>;
  setThreadId: (threadId: string) => Promise<void>;
  // ... other methods
}
```

### `<ChatKit />` Component

The main UI component that renders the chat interface.

#### Props

```typescript
interface ChatKitProps {
  control: ChatKitControl;
  className?: string;
}
```

## Configuration Examples

### Theme Customization

```tsx
const chatkit = useChatKit({
  frameUrl: 'https://chatkit.studio/frame',
  api: { /* ... */ },
  theme: {
    colorScheme: 'light', // or 'dark'
    radius: 'pill', // 'none' | 'small' | 'medium' | 'large' | 'pill'
    density: 'normal', // 'compact' | 'normal' | 'comfortable'
    color: {
      grayscale: {
        hue: 120,
        tint: 6
      },
      accent: {
        primary: '#83e58a',
        level: 2
      }
    },
    typography: {
      baseSize: 16,
      fontFamily: 'Inter, sans-serif',
    }
  }
});
```

### Composer Configuration

```tsx
const chatkit = useChatKit({
  frameUrl: '<url-to-chatkit-frame>',
  api: { /* ... */ },
  composer: {
    attachments: {
      enabled: true,
      maxCount: 5,
      maxSize: 10485760 // 10MB
    },
    tools: [
      {
        id: 'search_docs',
        label: 'Search Documentation',
        shortLabel: 'Search',
        placeholderOverride: 'Ask about our docs...',
        icon: 'book-open',
        pinned: false
      }
    ]
  }
});
```

### Start Screen with Prompts

```tsx
const chatkit = useChatKit({
  frameUrl: '<url-to-chatkit-frame>',
  api: { /* ... */ },
  startScreen: {
    greeting: 'Welcome! How can I help you today?',
    prompts: [
      {
        icon: 'circle-question',
        label: 'What is ChatKit?',
        prompt: 'What is ChatKit?'
      },
      {
        icon: 'lightbulb',
        label: 'Show me examples',
        prompt: 'Can you show me some examples?'
      }
    ]
  }
});
```

### Handling Client Tools

```tsx
const chatkit = useChatKit({
  frameUrl: '<url-to-chatkit-frame>',
  api: { /* ... */ },
  onClientTool: async ({ name, params, id, tool_call_id }) => {
    console.log(`Tool invoked: ${name}`, params);
    
    // Perform tool action
    let result;
    if (name === 'get_weather') {
      result = await fetchWeather(params.location);
    }
    
    return {
      tool_call_id: tool_call_id || id,
      name: name,
      status: 'success',
      content: JSON.stringify(result)
    };
  }
});
```

### Error Handling and Lifecycle Events

```tsx
const chatkit = useChatKit({
  frameUrl: '<url-to-chatkit-frame>',
  api: { /* ... */ },
  onError: (error) => {
    console.error('ChatKit error:', error);
    // Handle error (show toast, etc.)
  },
  onReady: () => {
    console.log('ChatKit initialized successfully');
  },
  onThreadChange: ({ threadId }) => {
    console.log('Thread changed:', threadId);
    // Save thread ID, update URL, etc.
  },
  onEffect: ({ name, data }) => {
    console.log(`Effect triggered: ${name}`, data);
    // Handle custom effects from assistant
  }
});
```

## Common Usage Patterns

### Sending Messages Programmatically

```tsx
function App() {
  const chatkit = useChatKit({ /* ... */ });
  
  const handleSendMessage = () => {
    chatkit.sendUserMessage({
      text: 'Hello, ChatKit!',
      newThread: true
    });
  };
  
  const handleSendWithState = () => {
    chatkit.sendUserMessage({
      text: 'Greet me',
      newThread: true,
      state: {
        user_name: 'Alice',
        preferences: { theme: 'dark' }
      }
    });
  };
  
  return (
    <div>
      <button onClick={handleSendMessage}>Start Conversation</button>
      <button onClick={handleSendWithState}>Send with Context</button>
      <ChatKit control={chatkit.control} />
    </div>
  );
}
```

### Thread Management

```tsx
function App() {
  const [threads, setThreads] = useState<string[]>([]);
  const chatkit = useChatKit({
    /* ... */
    onThreadChange: ({ threadId }) => {
      if (threadId && !threads.includes(threadId)) {
        setThreads(prev => [...prev, threadId]);
      }
    }
  });
  
  const switchThread = (threadId: string) => {
    chatkit.setThreadId(threadId);
  };
  
  return (
    <div>
      <aside>
        <h3>Threads</h3>
        {threads.map(id => (
          <button key={id} onClick={() => switchThread(id)}>
            {id}
          </button>
        ))}
      </aside>
      <ChatKit control={chatkit.control} />
    </div>
  );
}
```

### Internationalization

```tsx
import { useState } from 'react';
import type { SupportedLocale } from '@xpert-ai/chatkit-types';

function App() {
  const [locale, setLocale] = useState<SupportedLocale>('en-US');
  
  const chatkit = useChatKit({
    locale,
    /* ... */
  });
  
  return (
    <div>
      <select 
        value={locale} 
        onChange={(e) => setLocale(e.target.value as SupportedLocale)}
      >
        <option value="en-US">English</option>
        <option value="zh-Hans">简体中文</option>
      </select>
      <ChatKit control={chatkit.control} />
    </div>
  );
}
```

## TypeScript Support

This package is written in TypeScript and includes full type definitions.

```typescript
import type { 
  ChatKitOptions,
  ClientToolMessageInput,
  SupportedLocale 
} from '@xpert-ai/chatkit-types';
```

## Requirements

- React >= 18
- React DOM >= 18

## Related Packages

- `@xpert-ai/chatkit` - Core ChatKit library
- `@xpert-ai/chatkit-types` - TypeScript type definitions
- `@xpert-ai/chatkit-ui` - Pre-built UI components

## License

See LICENSE file in the repository root.
