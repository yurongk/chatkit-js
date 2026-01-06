# @xpert-ai/chatkit-ui5

SAP Fiori (UI5) wrapper for the ChatKit web component. This control renders the
`<xpertai-chatkit>` element and wires UI5-friendly properties, events, and
methods so it can be embedded inside UI5 applications.

## Installation

```bash
pnpm add @xpert-ai/chatkit-ui5
```

Make sure the ChatKit web component dependencies are available, then load the
control after the UI5 runtime is ready.

## Usage

```javascript
import { ChatKit } from '@xpert-ai/chatkit-ui5';

const chatkit = new ChatKit();

chatkit.setConfig({
  baseUrl: 'https://api.example.com',
  token: '<token>',
  onReady() {
    console.log('ChatKit ready');
  },
});

chatkit.placeAt('content'); // standard UI5 placement

// Call methods on the underlying web component
chatkit.focusComposer();
chatkit.sendUserMessage({ content: 'Hello from UI5' });
```

### Event forwarding

ChatKit web component events are re-emitted as UI5 events:

| Web component event          | UI5 event          | Handler property  |
| ---------------------------- | ------------------ | ----------------- |
| `chatkit.ready`              | `ready`            | `onReady`         |
| `chatkit.error`              | `error`            | `onError`         |
| `chatkit.response.start`     | `responseStart`    | `onResponseStart` |
| `chatkit.response.end`       | `responseEnd`      | `onResponseEnd`   |
| `chatkit.log`                | `log`              | `onLog`           |
| `chatkit.thread.change`      | `threadChange`     | `onThreadChange`  |
| `chatkit.thread.load.start`  | `threadLoadStart`  | `onThreadLoadStart`|
| `chatkit.thread.load.end`    | `threadLoadEnd`    | `onThreadLoadEnd` |
| `chatkit.effect`             | `effect`           | `onEffect`        |

Each handler receives the event detail payload.
