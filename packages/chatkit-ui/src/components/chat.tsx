import * as React from 'react';
import { FileText, Loader2, Pencil, RefreshCw, X } from 'lucide-react';

import type { Message } from '@xpert-ai/xpert-sdk';
import type { ChatkitMessage, ChatKitOptions, ToolOption } from '@xpert-ai/chatkit-types';

/**
 * Represents a file stored on the server.
 * Returned by the file upload API.
 */
interface StorageFile {
  id: string;
  file: string;
  url?: string;
  originalName?: string;
  size?: number;
  mimetype?: string;
}

/**
 * Represents a file being uploaded or already uploaded.
 */
type UploadingFile = {
  /** Local unique ID for tracking */
  localId: string;
  /** Original File object */
  file: File;
  /** Upload status */
  status: 'uploading' | 'success' | 'error';
  /** Server-side file info after successful upload */
  storageFile?: StorageFile;
  /** Error message if upload failed */
  error?: string;
};

import { cn } from '../lib/utils';
import { useStreamContext } from '../providers/Stream';
import { ComposerMenu } from './composer/ComposerMenu';
import { SendButton } from './composer/SendButton';
import { HistorySidebar } from './history/HistorySidebar';
import { AssistantMessage } from './thread/messages/ai';
import { MessageActions } from './thread/MessageActions';
import { StartScreen } from './thread/StartScreen';
// Avatar import removed - AI avatar disabled
import { ScrollArea } from './ui/scroll-area';
import { useStreamManager } from '../hooks/useStream';
import { useThreads } from '../hooks/useThreads';
import { useChatkitTranslation } from '../i18n/useChatkitTranslation';

export type ChatProps = {
  className?: string;
  title?: string;
  placeholder?: string;
  clientSecret?: string;
  options?: ChatKitOptions | null;
};

const defaultApiUrl = import.meta.env.VITE_XPERTAI_API_URL as string | undefined;
function createMessageId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}

function formatMessageContent(content: Message['content'][number]): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part) {
          const textValue = (part as { text?: unknown }).text;
          return typeof textValue === 'string' ? textValue : '';
        }
        return '';
      })
      .join('');
  }

  if (content == null) return '';

  // Handle object with text property (e.g., {"type":"text","text":"..."})
  if (typeof content === 'object' && 'text' in content) {
    const textValue = (content as { text?: unknown }).text;
    return typeof textValue === 'string' ? textValue : '';
  }

  return '';
}

export function Chat({
  className,
  options,
  title,
  placeholder,
  clientSecret = '',
}: ChatProps) {
  const { t } = useChatkitTranslation();
  const composer = options?.composer;
  const startScreen = options?.startScreen;
  const history = options?.history;
  const disclaimer = options?.disclaimer;
  const apiUrl = options?.api?.apiUrl || defaultApiUrl;
  // const threadItemActions = options?.threadItemActions;
  const {setStream} = useStreamManager();
  const stream = useStreamContext();

  const [isHistoryLoading, setIsHistoryLoading] = React.useState(false);
  const [historyError, setHistoryError] = React.useState<string | null>(null);
  const [assistantName, setAssistantName] = React.useState<string | null>(null);

  // Minimum loading dots display time (ms)
  const LOADING_DOTS_MIN_DURATION = 800;
  const [showLoadingDots, setShowLoadingDots] = React.useState(false);
  const loadingStartTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setStream(stream);
  }, [setStream, stream]);

  // Handle loading dots with minimum display time
  React.useEffect(() => {
    if (stream.isLoading) {
      // Start showing loading dots
      if (!loadingStartTimeRef.current) {
        loadingStartTimeRef.current = Date.now();
        setShowLoadingDots(true);
      }
    } else {
      // Loading finished - check if we need to keep dots visible
      if (loadingStartTimeRef.current) {
        const elapsed = Date.now() - loadingStartTimeRef.current;
        const remaining = LOADING_DOTS_MIN_DURATION - elapsed;

        if (remaining > 0) {
          // Keep dots visible for remaining time
          const timer = setTimeout(() => {
            setShowLoadingDots(false);
            loadingStartTimeRef.current = null;
          }, remaining);
          return () => clearTimeout(timer);
        } else {
          // Minimum time already passed
          setShowLoadingDots(false);
          loadingStartTimeRef.current = null;
        }
      }
    }
  }, [stream.isLoading]);

  const [draft, setDraft] = React.useState('');
  const [selectedTool, setSelectedTool] = React.useState<ToolOption | null>(null);
  const [attachments, setAttachments] = React.useState<UploadingFile[]>([]);
  const {
    threads,
    createThread,
    deleteThread,
    refreshThreads,
    isLoading: isThreadsLoading,
  } = useThreads();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resolvedTitle = title ?? t('chat.title');
  const resolvedPlaceholder = placeholder ?? t('chat.placeholder');

  // Use placeholder from composer options or fallback to prop/i18n
  const inputPlaceholder =
    selectedTool?.placeholderOverride ?? composer?.placeholder ?? resolvedPlaceholder;

  const messages = stream.messages ?? [];
  const trimmedDraft = draft.trim();

  const scrollToBottom = React.useCallback((smooth = false) => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      // Find the actual Radix ScrollArea Viewport element
      const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: smooth ? 'smooth' : 'instant',
        });
      }
    });
  }, []);

  // Auto-scroll when messages change or during streaming
  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Also scroll when streaming content updates (for smooth following)
  React.useEffect(() => {
    if (stream.isLoading) {
      scrollToBottom();
    }
  }, [stream.isLoading, messages, scrollToBottom]);

  const hasApiKey = Boolean(clientSecret.trim());
  const missingConfig = !apiUrl || !hasApiKey;
  // Check if any files are still uploading (moved up for use in isSendDisabled)
  const hasUploadingFiles = attachments.some((a) => a.status === 'uploading');
  const isSendDisabled =
    !trimmedDraft || stream.isLoading || missingConfig || isHistoryLoading || hasUploadingFiles;

  React.useEffect(() => {
    if (missingConfig) return;
    void refreshThreads();
  }, [missingConfig, refreshThreads]);

  // Fetch assistant name from API
  React.useEffect(() => {
    if (missingConfig || !stream.client || !stream.assistantId) return;
    stream.client.assistants
      .get(stream.assistantId)
      .then((assistant) => {
        if (assistant) {
          setAssistantName(assistant.metadata?.title as string || assistant.name);
        }
      })
      .catch((err) => {
        console.warn('[Chat] Failed to load assistant info:', err);
      });
  }, [missingConfig, stream.client, stream.assistantId]);

  // Get successfully uploaded files (matching IStorageFile interface)
  const uploadedFiles = attachments
    .filter((a) => a.status === 'success' && a.storageFile)
    .map((a) => ({
      id: a.storageFile!.id,
      file: a.storageFile!.file,
      url: a.storageFile!.url,
      originalName: a.storageFile!.originalName ?? a.file.name,
      mimetype: a.storageFile!.mimetype ?? a.file.type,
      size: a.storageFile!.size ?? a.file.size,
    }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // isSendDisabled already includes hasUploadingFiles check
    if (isSendDisabled) return;

    // Store files for display in the message
    const filesToSend = uploadedFiles.length > 0 ? [...uploadedFiles] : undefined;

    const newMessage: Message & { attachments?: typeof uploadedFiles } = {
      id: createMessageId(),
      type: 'human',
      content: trimmedDraft,
      ...(filesToSend ? { attachments: filesToSend } : {}),
    };

    setDraft('');

    // Include files in the submit request
    const inputPayload: { input: string; files?: typeof uploadedFiles } = {
      input: trimmedDraft,
    };
    if (filesToSend) {
      inputPayload.files = filesToSend;
    }

    stream.submit(
      { input: inputPayload },
      {
        optimisticValues: (prev) => {
          const prevMessages = prev?.messages ?? [];
          return { ...prev, messages: [...prevMessages, newMessage] };
        },
      },
    );

    // Immediately scroll to bottom to show the new message
    scrollToBottom(true);

    // Clear selected tool if not persistent
    if (selectedTool && !selectedTool.pinned) {
      setSelectedTool(null);
    }
    // Clear attachments after submit
    setAttachments([]);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // Upload a single file to the server
  const uploadFile = React.useCallback(async (localId: string, file: File) => {
    try {
      const result = await stream.client.contexts.uploadFile<StorageFile>(file);
      setAttachments((prev) =>
        prev.map((item) =>
          item.localId === localId
            ? { ...item, status: 'success' as const, storageFile: result }
            : item
        )
      );
    } catch (error) {
      setAttachments((prev) =>
        prev.map((item) =>
          item.localId === localId
            ? {
                ...item,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : item
        )
      );
    }
  }, [stream.client]);

  // Retry uploading a failed file
  const handleRetryUpload = React.useCallback((localId: string) => {
    const attachment = attachments.find((a) => a.localId === localId);
    if (!attachment || attachment.status !== 'error') return;

    setAttachments((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? { ...item, status: 'uploading' as const, error: undefined }
          : item
      )
    );
    void uploadFile(localId, attachment.file);
  }, [attachments, uploadFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const maxCount = composer?.attachments?.maxCount ?? 10;
    const maxSize = composer?.attachments?.maxSize ?? 100 * 1024 * 1024; // 100MB default

    const newAttachments: UploadingFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds max size of ${maxSize} bytes`);
        continue;
      }
      const localId = createMessageId();
      newAttachments.push({
        localId,
        file,
        status: 'uploading',
      });
    }

    // Add new attachments and limit to maxCount
    setAttachments((prev) => {
      const combined = [...prev, ...newAttachments];
      return combined.slice(0, maxCount);
    });

    // Start uploading each file
    newAttachments.forEach((attachment) => {
      void uploadFile(attachment.localId, attachment.file);
    });

    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleRemoveAttachment = async (localId: string) => {
    const attachment = attachments.find((a) => a.localId === localId);
    if (!attachment) return;

    // If file was uploaded successfully, delete from server
    if (attachment.status === 'success' && attachment.storageFile?.id) {
      try {
        await fetch(`${stream.apiUrl}/contexts/file/${attachment.storageFile.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${clientSecret}`,
          },
        });
      } catch {
        // Still remove from local state even if server delete fails
      }
    }

    setAttachments((prev) => prev.filter((item) => item.localId !== localId));
  };

  const handleToolSelect = (tool: ToolOption) => {
    setSelectedTool((prev) => (prev?.id === tool.id ? null : tool));
  };

  const handlePromptClick = (prompt: string) => {
    if (missingConfig || stream.isLoading || isHistoryLoading) return;

    const newMessage: Message = {
      id: createMessageId(),
      type: 'human',
      content: prompt,
    };

    stream.submit(
      { input: { input: prompt } },
      {
        optimisticValues: (prev) => {
          const prevMessages = prev?.messages ?? [];
          return { ...prev, messages: [...prevMessages, newMessage] };
        },
      },
    );

    // Scroll to bottom to show the new message
    scrollToBottom(true);
  };

  const loadThreadMessages = React.useCallback(
    async (recordId: string) => {
      if (missingConfig) {
        setHistoryError(t('chat.missingConfigShort'));
        return;
      }
      setHistoryError(null);
      setIsHistoryLoading(true);
      try {
        await stream.loadThreadMessages(recordId);
        // setActiveThreadId(threadId ?? null);
      } catch (err) {
        console.warn('Failed to load thread messages', err);
        setHistoryError(
          err instanceof Error ? err.message : t('chat.errors.loadMessages'),
        );
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [missingConfig, stream, t],
  );

  const handleNewThread = async () => {
    if (missingConfig || stream.isLoading || isHistoryLoading) return;
    setHistoryError(null);
    try {
      // const created = await createThread({ title: t('history.newThreadTitle') });
      // setActiveThreadId(created.id);
      stream.reset(null, []);
      // await refreshThreads();
    } catch (err) {
      console.warn('Failed to create thread', err);
      setHistoryError(
        err instanceof Error ? err.message : t('chat.errors.createThread'),
      );
    }
  };

  const handleSelectThread = (id: string) => {
    if (isHistoryLoading) return;
    setHistoryError(null);
    const thread = threads.find((item) => item.id === id);
    if (!thread) return;
    if (id === stream.threadId) return;
    stream.reset(id, []);
    if (thread.recordId) {
      void loadThreadMessages(thread.recordId);
    }
  };

  const handleDeleteThread = (id: string) => {
    setHistoryError(null);
    const thread = threads.find((item) => item.id === id);
    if (!thread?.recordId) return;
    void deleteThread(thread.recordId)
      .then(() => {
        if (stream.threadId === id) {
          stream.reset(null, []);
        }
        return refreshThreads();
      })
      .catch((err) => {
        console.warn('Failed to delete thread', err);
        setHistoryError(
          err instanceof Error ? err.message : t('chat.errors.deleteThread'),
        );
      });
  };

  const handleRetry = (messageIndex: number) => {
    // Find the last human message before this AI message to resend
    const messagesUpToIndex = messages.slice(0, messageIndex);
    const lastHumanMessage = [...messagesUpToIndex].reverse().find(
      (m) => String(m.type) === 'human'
    );

    if (lastHumanMessage && typeof lastHumanMessage.content === 'string') {
      stream.submit(
        { input: {input: lastHumanMessage.content} },
        {
          optimisticValues: (prev) => {
            // Remove the AI message that we're retrying
            const prevMessages = prev?.messages ?? [];
            return {
              ...prev,
              messages: prevMessages.slice(0, messageIndex),
            };
          },
        },
      );
    }
  };

  // Build accept string for file input
  const acceptMimes = composer?.attachments?.accept
    ? Object.entries(composer.attachments.accept)
        .map(([mime, exts]) => [mime, ...exts.map((e) => `.${e}`)].join(','))
        .join(',')
    : undefined;

  const errorMessage =
    stream.error instanceof Error ? stream.error.message : undefined;

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col overflow-hidden bg-background shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b bg-muted/30 px-6 py-2">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <div>
            <h2 className="text-lg font-semibold">{assistantName || resolvedTitle}</h2>
            <p className="text-xs text-muted-foreground">{t('chat.statusOnline')}</p>
          </div>
        </div>
        {/* History controls - only shown when history.enabled is true (default) */}
        {(history?.enabled !== false) && (
          <div className="flex items-center gap-1">
            {/* New thread button */}
            <button
              type="button"
              onClick={handleNewThread}
              disabled={missingConfig || isHistoryLoading}
              className={cn(
                'flex h-8 w-8 cursor-pointer items-center justify-center rounded-md',
                'text-muted-foreground hover:text-foreground hover:bg-muted',
                'transition-colors duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              title={t('history.newThread')}
            >
              <Pencil size={16} />
            </button>
            <HistorySidebar
              threads={threads}
              currentThreadId={stream.threadId ?? undefined}
              onNewThread={handleNewThread}
              onSelectThread={handleSelectThread}
              onDeleteThread={handleDeleteThread}
              showDelete={history?.showDelete !== false}
              disabled={missingConfig || isThreadsLoading || isHistoryLoading}
            />
          </div>
        )}
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div ref={viewportRef} className="px-6 py-4">
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          {historyError && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {historyError}
            </div>
          )}
          {missingConfig && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t('chat.missingConfigDetail')}
            </div>
          )}
          {isHistoryLoading && (
            <div className="mb-4 rounded-lg border border-muted px-3 py-2 text-sm text-muted-foreground">
              {t('chat.loadingThread')}
            </div>
          )}
          {messages.length === 0 ? (
            <StartScreen
              startScreen={startScreen}
              onPromptClick={handlePromptClick}
            />
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const messageType = String(message.type);
                const isAssistantMessage =
                  messageType === 'assistant' || messageType === 'ai';

                const messageContent =
                  typeof message.content === 'string'
                    ? message.content
                    : Array.isArray(message.content)
                      ? message.content.map((part) => formatMessageContent(part as any)).join('')
                      : formatMessageContent(message.content);

                return (
                  <div
                    key={message.id ?? `${message.type}-${index}`}
                    className={cn(
                      'group flex gap-3',
                      message.type === 'human'
                        ? 'justify-end'
                        : 'justify-start -ml-1',  // AI messages: slightly closer to left
                    )}
                  >
                    <div className="flex flex-col">
                      <div
                        className={cn(
                          'max-w-full rounded-2xl',
                          message.type === 'human'
                            ? 'bg-primary text-primary-foreground px-4 py-2.5'
                            : message.type === 'system'
                              ? 'bg-muted text-muted-foreground text-xs px-4 py-2.5'
                              : 'py-1 text-chat-foreground',  // AI messages: use chat-specific foreground color
                        )}
                      >
                        {isAssistantMessage ? (
                          <AssistantMessage
                            message={{
                              ...(message as ChatkitMessage),
                              type: 'assistant',
                            }}
                            isStreaming={stream.isLoading && index === messages.length - 1}
                          />
                        ) : (
                          <>
                            {/* Show attachments for human messages */}
                            {message.type === 'human' && (message as any).attachments?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {((message as any).attachments as Array<{ originalName: string; mimetype: string }>).map((file, fileIndex) => (
                                  <div
                                    key={fileIndex}
                                    className="flex items-center gap-1.5 rounded-md bg-primary-foreground/20 px-2 py-1 text-xs"
                                  >
                                    <FileText size={12} />
                                    <span className="max-w-[100px] truncate">{file.originalName}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {Array.isArray(message.content) ? (
                              message.content.map((part, partIndex) => (
                                <p
                                  key={`${part.type}-${partIndex}`}
                                  className="break-words text-sm leading-relaxed"
                                >
                                  {formatMessageContent(part as any)}
                                </p>
                              ))
                            ) : (
                              <span className="break-words text-sm leading-relaxed">
                                {formatMessageContent(message.content)}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {/* Message actions - hidden during streaming, retry only for last AI message */}
                      <MessageActions
                        content={messageContent}
                        isAssistant={isAssistantMessage}
                        isStreaming={stream.isLoading && index === messages.length - 1}
                        onRetry={
                          isAssistantMessage && !stream.isLoading && index === messages.length - 1
                            ? () => handleRetry(index)
                            : undefined
                        }
                      />
                    </div>
                  </div>
                );
              })}
              {/* Show loading indicator with minimum display time */}
              {showLoadingDots && (() => {
                const lastMessage = messages[messages.length - 1];
                const lastMessageType = lastMessage ? String(lastMessage.type) : '';
                const isLastMessageFromAI = lastMessageType === 'ai' || lastMessageType === 'assistant';
                // Hide dots once AI has substantial content
                const lastMsgContent = lastMessage?.content;
                const hasSubstantialContent = isLastMessageFromAI &&
                  ((typeof lastMsgContent === 'string' && lastMsgContent.length > 10) ||
                   (Array.isArray(lastMsgContent) && lastMsgContent.length > 0));
                if (hasSubstantialContent) return null;
                return (
                  <div className="flex justify-start gap-3 -ml-2">
                    <div className="max-w-full rounded-2xl py-2.5">
                      <div className="flex gap-1.5">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-muted/30 p-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptMimes}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((item) => (
              <div
                key={item.localId}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1 text-sm",
                  item.status === 'error' ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted'
                )}
              >
                {/* Status icon */}
                {item.status === 'uploading' && (
                  <Loader2 size={14} className="animate-spin text-muted-foreground" />
                )}
                {item.status === 'success' && (
                  <FileText size={14} className="text-muted-foreground" />
                )}
                {item.status === 'error' && (
                  <FileText size={14} className="text-destructive" />
                )}

                {/* File name */}
                <span className={cn(
                  "max-w-[120px] truncate",
                  item.status === 'error' && 'text-destructive'
                )}>
                  {item.file.name}
                </span>

                {/* Retry button for failed uploads */}
                {item.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => handleRetryUpload(item.localId)}
                    className="ml-1 rounded-full p-0.5 text-destructive hover:bg-destructive/20"
                    title={t('chat.retryUpload')}
                  >
                    <RefreshCw size={12} />
                  </button>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(item.localId)}
                  className={cn(
                    "ml-1 rounded-full p-0.5",
                    item.status === 'error'
                      ? 'text-destructive hover:bg-destructive/20'
                      : 'hover:bg-muted-foreground/20'
                  )}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Selected tool indicator */}
        {selectedTool && (
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {selectedTool.shortLabel ?? selectedTool.label}
            </span>
            <button
              type="button"
              onClick={() => setSelectedTool(null)}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-muted"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <form className="flex items-center" onSubmit={handleSubmit}>
          {/* Capsule-shaped input container */}
          <div
            className={cn(
              'flex flex-1 items-center gap-1 rounded-full',
              'bg-background border border-border shadow-sm',
              'pl-1.5 pr-1.5 py-1',
              'focus-within:border-muted-foreground/30 focus-within:shadow-md',
              'transition-shadow duration-200'
            )}
          >
            {/* Plus button inside input - left side */}
            <ComposerMenu
              composer={composer}
              onAttachmentClick={handleAttachmentClick}
              onToolSelect={handleToolSelect}
              selectedTool={selectedTool}
              disabled={stream.isLoading || missingConfig || isHistoryLoading}
            />
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={inputPlaceholder}
              disabled={stream.isLoading || missingConfig || isHistoryLoading}
              className={cn(
                'flex-1 bg-transparent text-sm text-foreground outline-none px-2',
                'placeholder:text-muted-foreground',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              autoComplete="off"
            />
            <SendButton
              disabled={isSendDisabled}
              isLoading={stream.isLoading}
              onStop={() => stream.stop()}
              stopLabel={t('chat.stop')}
              sendLabel={t('chat.send')}
            />
          </div>
        </form>

        {/* Disclaimer */}
        {disclaimer?.text && (
          <p
            className={cn(
              'mt-2 text-center text-xs',
              disclaimer.highContrast ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {disclaimer.text}
          </p>
        )}

        <p className="mt-2 text-center text-xs text-muted-foreground">
          {t('chat.poweredBy')}
        </p>
      </div>
    </div>
  );
}
