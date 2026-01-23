import { useContext, useEffect, useRef } from "react";
import type { ChatKitOptions } from "@xpert-ai/chatkit-types";
import { ParentMessengerContext, type ParentMessenger } from "../providers/ParentMessenger";

export type { ParentMessenger } from "../providers/ParentMessenger";

export type ParentMessengerOptions = {
  onSetOptions?: (options: ChatKitOptions | null) => void;
};

export function useParentMessenger(
  { onSetOptions }: ParentMessengerOptions = {},
): ParentMessenger {
  const context = useContext(ParentMessengerContext);
  if (!context) {
    throw new Error("useParentMessenger must be used within a ParentMessengerProvider");
  }

  const { registerOnSetOptions, ...messenger } = context;
  const onSetOptionsRef = useRef(onSetOptions);
  useEffect(() => {
    onSetOptionsRef.current = onSetOptions;
  }, [onSetOptions]);

  const hasOnSetOptions = Boolean(onSetOptions);
  useEffect(() => {
    if (!hasOnSetOptions) return;
    const handler = (options: ChatKitOptions | null) => {
      onSetOptionsRef.current?.(options);
    };
    return registerOnSetOptions(handler);
  }, [hasOnSetOptions, registerOnSetOptions]);

  return messenger;
}
