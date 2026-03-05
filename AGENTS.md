# AGENTS.md

## Conventions and guardrails

Guidance for AI agents working in this repository. Keep changes scoped to the target
app and follow existing patterns.

- AVOID using arbitrary type checks `asRecord`, for example:
  ```typescript
  ❌const asRecord = (value: unknown): Record<string, unknown> | null => {
  ❌  if (!value || typeof value !== 'object') {
  ❌    return null;
  ❌  }
  ❌  return value as Record<string, unknown>;
  ❌};
  ```
- If the input and output data types are unknown, use a placeholder and request the type definitions from the user.
