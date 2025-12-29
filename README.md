# ChatKit

An all-in-one AI chat framework that makes building conversational experiences dead simple.

🤔 Still building chat UIs from scratch? Managing message state manually? Implementing streaming yourself?

Let ChatKit handle the heavy lifting. Get a complete AI chat experience up and running in minutes.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

## ✨ Why ChatKit?

- **Save Time**: Integrate a full-featured chat in 30 minutes, not weeks
- **Flexible**: Works with React, Vue, vanilla JS—customize themes your way
- **Complete**: Streaming, tools, uploads, threads—all built in

## 🚀 Quick Start

### Backend (FastAPI)

Config environment by copying `.env.example` to `.env` and filling in your values.

```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/api/chatkit/session")
async def create_session():
  return {"client_secret": "your_session_token"}
```

Full example: `pnpm managed-chatkit:dev`

### Frontend (React)

```bash
npm install @xpert-ai/chatkit-react
```

Config environment by copying `.env.example` to `.env` and filling in your values.

```tsx
import { ChatKit, useChatKit } from '@xpert-ai/chatkit-react';

export function MyChat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    theme: { colorScheme: 'light', radius: 'round' },
  });

  return <ChatKit control={control} className="h-[600px]" />;
}
```

## 📦 Key Features

- **🎨 Deep Customization** - Control colors, fonts, spacing—make it yours
- **⚡ Real-time Streaming** - Messages flow in smoothly, token by token
- **🔧 Tool Integration** - Seamless client and server tool support
- **📎 File Uploads** - Attach files and images with flexible config
- **💬 Thread Management** - Switch conversations, track history
- **🌍 i18n Ready** - 68+ locales out of the box
- **🎯 Framework Agnostic** - React/Vue/Angular/vanilla JS all work

## 📁 Project Structure

```
chatkit-js/
├── packages/
│   ├── chatkit/              # Core type definitions
│   ├── chatkit-react/        # React bindings
│   ├── chatkit-ui/           # Complete UI library
│   └── web-component/        # Web Component (framework-agnostic)
├── examples/
│   └── managed-chatkit/      # Full-stack example
└── docs/                    # Documentation
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run full-stack example
pnpm managed-chatkit:dev

# Dev UI components
pnpm dev:ui

# Run tests
pnpm test

# Lint code
pnpm lint
```

## Publish

```bash
pnpm -r publish --filter @xpert-ai/chatkit-vue
```

## 📚 Learn More

- [Full Documentation](docs/index.md)
- [Configuration Options](packages/chatkit/src/options.ts)
- [Thread Management](docs/concepts/threads.md)
- [Tool Integration](docs/concepts/tools.md)
- [Example Project](examples/managed-chatkit/)

## 💻 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## 🗺️ Roadmap

- [x] Core message streaming
- [x] Thread management
- [x] File attachments
- [ ] Advanced theming
- [ ] Tool call visualization
- [ ] Voice I/O
- [ ] WebSocket support

## 🤝 Contributing

We love contributions!

1. Fork the project
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- 📖 [Documentation](docs/index.md)
- 🐛 [Issues](https://github.com/xpert-ai/chatkit-js/issues)
- 💬 [Discussions](https://github.com/xpert-ai/chatkit-js/discussions)

## 📄 License

Apache License 2.0

---

Built with ❤️ by the **Xpert AI** team

Got questions? Want to chat? Feel free to [open an issue](https://github.com/xpert-ai/chatkit-js/issues) or [join the discussion](https://github.com/xpert-ai/chatkit-js/discussions)
