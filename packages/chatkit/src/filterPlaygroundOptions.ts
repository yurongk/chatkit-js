import type { ChatKitOptions, ChatKitTheme, ColorScheme } from './options';

/**
 * Playground configuration whitelist - only allow these options to take effect when copied from the playground
 * Filters out: locale, initialThread, header, history, threadItemActions, disclaimer, entities, widgets, onClientTool
 */

/**
 * Options allowed to be configured from Playground
 */
export type PlaygroundAllowedOptions = {
  api?: ChatKitOptions['api'];
  theme?: ColorScheme | ChatKitTheme;
  composer?: ChatKitOptions['composer'];
  startScreen?: ChatKitOptions['startScreen'];
};

/**
 * Whitelist of allowed option keys
 */
const ALLOWED_KEYS: (keyof PlaygroundAllowedOptions)[] = [
  'api',
  'theme',
  'composer',
  'startScreen',
];

/**
 * Filter out only the allowed options from a Playground config
 *
 * @param options - Full config copied from the playground
 * @returns An object containing only whitelisted options
 *
 * @example
 * ```ts
 * // Config copied from the playground
 * const playgroundConfig = {
 *   theme: { colorScheme: 'light', radius: 'pill' },
 *   threadItemActions: { feedback: true }, // will be filtered out
 *   startScreen: { greeting: 'Hello!' },
 * };
 *
 * const filtered = filterPlaygroundOptions(playgroundConfig);
 * // Result: { theme: { colorScheme: 'light', radius: 'pill' }, startScreen: { greeting: 'Hello!' } }
 * ```
 */
export function filterPlaygroundOptions<T extends Partial<ChatKitOptions>>(
  options: T
): PlaygroundAllowedOptions {
  const filtered: PlaygroundAllowedOptions = {};

  for (const key of ALLOWED_KEYS) {
    if (key in options && options[key] !== undefined) {
      // @ts-expect-error - dynamic assignment
      filtered[key] = options[key];
    }
  }

  // fontSources is preserved - user must provide their own font URLs

  return filtered;
}

/**
 * Merge Playground config with local config
 * Playground config overrides matching items in local config (whitelist only)
 *
 * @param localOptions - Base config in the local project (can include onClientTool, header, etc.)
 * @param playgroundOptions - Config copied from the playground
 * @returns Merged config
 *
 * @example
 * ```ts
 * const localConfig = {
 *   api: { getClientSecret: async () => '...' },
 *   onClientTool: async () => { ... },  // kept
 *   header: { enabled: true },          // kept
 * };
 *
 * const playgroundConfig = {
 *   theme: { colorScheme: 'dark' },
 *   threadItemActions: { feedback: true }, // filtered out
 * };
 *
 * const merged = mergeWithPlaygroundOptions(localConfig, playgroundConfig);
 * // Result: { api, onClientTool, header, theme }
 * ```
 */
export function mergeWithPlaygroundOptions<T extends Partial<ChatKitOptions>>(
  localOptions: T,
  playgroundOptions: Partial<ChatKitOptions>
): T & PlaygroundAllowedOptions {
  const filteredPlayground = filterPlaygroundOptions(playgroundOptions);

  return {
    ...localOptions,
    ...filteredPlayground,
  };
}
