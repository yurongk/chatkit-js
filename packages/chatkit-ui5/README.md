# @xpert-ai/chatkit-ui5

SAP UI5 control wrapper for ChatKit components, enabling easy embedding of ChatKit conversational experiences in UI5/Fiori applications. For a sample application, refer to [`examples/sap-ui5`](https://github.com/xpert-ai/xpertai-chatkit-advanced-samples) (Todo + ChatKit) in this repository.

## Prerequisites

- An XpertAI digital expert created on the XpertAI platform (with `xpertId`) and ChatKit Host configured, obtaining the corresponding `frameUrl` and `apiUrl`.
- UI5 CLI (`npm i -g @ui5/cli`) and project dependency management tools (e.g., pnpm / npm).

## Installation

```sh
pnpm add @xpert-ai/chatkit-ui5
# or npm i @xpert-ai/chatkit-ui5
```

Place the build output *chatkit.ui5.js* in the UI5 static resources directory and declare the resource root path in `manifest.json` (example matches sample-app):

```json
"sap.ui5": {
  "resourceRoots": {
    "xpertai.chatkit": "thirdparty/xpertai/chatkit/"
  }
}
```

## Quick Start (from sample-app)

Reserve a container in the XML view:

```xml
<VBox id="chatKitContainer" width="100%" height="70vh" />
```

Load on-demand and create the control in the controller:

```js
sap.ui.require(["xpertai/chatkit/ui5"], (ChatKitLib) => {
  const chatKit = new ChatKitLib.ChatKit({
    config: {
      frameUrl: "https://app.mtda.cloud/chatkit/index.html",
      api: {
        apiUrl: "https://api.mtda.cloud/api/ai",
        xpertId: "your-xpert-id",
        getClientSecret: async () => "<API Key securely retrieved from backend>"
      },
      onEffect: ({ name, data }) => {
        // Handle ChatKit effects for application integration, e.g., adding to todo list
      }
    }
  });

  this.byId("chatKitContainer").addItem(chatKit);
});
```

## Main Configuration Options

- `frameUrl`: ChatKit Host address (HTML container).
- `api.apiUrl`: Backend API address.
- `api.xpertId`: XpertAI platform digital expert ID.
- `api.getClientSecret()`: Async function to securely retrieve user-specific API Key from backend.
- Event callbacks: `onReady`, `onError`, `onResponseStart`, `onResponseEnd`, `onThreadChange`, `onThreadLoadStart`, `onThreadLoadEnd`, `onEffect`, etc. (follow `onXxx` naming convention).

## Control Methods

After obtaining the control instance in the controller, you can call:

- `focusComposer()`: Focus the input box.
- `setThreadId(threadId)`: Switch conversation thread.
- `sendUserMessage(message)`: Send user message.
- `setComposerValue(value)`: Set input box content.
- `fetchUpdates()`: Refresh conversation content.
- `sendCustomAction(action)`: Trigger custom action.

## Event Binding (UI5 Style)

The control maps ChatKit events to UI5 events: `ready`, `error`, `log`, `responseStart`, `responseEnd`, `threadChange`, `threadLoadStart`, `threadLoadEnd`, `effect`. You can listen directly in XML or subscribe via `attachReady/attachEffect` methods in the controller.

## Examples and References

- Complete example: [`examples/sap-ui5`](https://github.com/xpert-ai/xpertai-chatkit-advanced-samples) (includes manifest configuration, container layout, Effect handling).
- Recommended configuration loading approach: Merge defaults, `manifest.json`, and `window` overrides in `Component.js`, then pass via model to views and controllers.
