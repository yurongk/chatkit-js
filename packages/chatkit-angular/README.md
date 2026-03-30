# @xpert-ai/chatkit-angular

Angular 17+ standalone bindings for Xpert Chatkit.

## Local Demo

From the repository root:

```bash
pnpm dev:ui
pnpm managed-chatkit-angular:dev
```

Then open `http://localhost:5175`.

## Install

```bash
pnpm add @xpert-ai/chatkit-angular @angular/core
```

## Usage

```ts
import { Component } from '@angular/core';
import {
  ChatKitElement,
  createChatKit,
} from '@xpert-ai/chatkit-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatKitElement],
  template: `
    <xpertai-chatkit
      [control]="chatkit"
      style="display: block; height: 100vh;"
    ></xpertai-chatkit>
  `,
})
export class AppComponent {
  readonly chatkit = createChatKit({
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
        return {
          secret: data.client_secret,
          organizationId: data.organization_id,
        };
      },
    },
    onReady: () => {
      console.log('ChatKit is ready');
    },
  });
}
```

`getClientSecret` may return the legacy `string`, or return
`{ secret, organizationId }` to forward `organization-id` on hosted API calls.

If you prefer a wrapper component, `ChatKit` is also exported and renders the
same web component for you:

```ts
import { ChatKit } from '@xpert-ai/chatkit-angular';
```

## API

### `createChatKit(options)`

Creates a `ChatKitControl` instance that stores ChatKit options and exposes the
web component methods:

- `setOptions(next)`
- `focusComposer()`
- `setThreadId(threadId)`
- `sendUserMessage(params)`
- `setComposerValue(params)`
- `fetchUpdates()`
- `sendCustomAction(action, itemId?)`

### `<xpert-chatkit />`

Standalone Angular component that mounts the underlying `xpertai-chatkit` web
component for you. No `CUSTOM_ELEMENTS_SCHEMA` setup is required.

### `<xpertai-chatkit />`

Import `ChatKitElement` to use the real custom element directly in Angular
templates with the same attribute surface as the React and Vue bindings.
