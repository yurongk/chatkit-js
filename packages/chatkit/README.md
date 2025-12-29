# ChatKit Types

This package is the type-definition library for ChatKit, providing unified, reusable API types for the ChatKit project.

## Role in the ChatKit project

- Exposes the interface signatures and event types of `XpertAIChatKit`, ensuring consistency between integrators and internal implementation.
- Aggregates core chat-related types (such as `ChatKitOptions`, messages, attachments, widgets, interrupts) for reuse by the UI package and business side.
- Serves as a standalone types package so that the ChatKit Web Component and the XpertAI platform can obtain type hints and validation without bringing in implementation code.
