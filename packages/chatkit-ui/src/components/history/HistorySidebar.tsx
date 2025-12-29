import * as React from 'react';
import { History, MessageSquare, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useChatkitTranslation } from '../../i18n/useChatkitTranslation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

export type Conversation = {
  id: string;
  title: string;
  lastMessageAt?: Date;
  threadId?: string | null;
};

export type HistorySidebarProps = {
  conversations?: Conversation[];
  currentConversationId?: string;
  onNewConversation?: () => void;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  showDelete?: boolean;
  disabled?: boolean;
};

export function HistorySidebar({
  conversations = [],
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  showDelete = true,
  disabled = false,
}: HistorySidebarProps) {
  const { t } = useChatkitTranslation();
  const [open, setOpen] = React.useState(false);

  const handleNewConversation = () => {
    onNewConversation?.();
    setOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    onSelectConversation?.(id);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-8 w-8 cursor-pointer"
        >
          <History size={18} />
          <span className="sr-only">{t('history.conversationHistory')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>{t('history.title')}</SheetTitle>
        </SheetHeader>

        <div className="p-4">
          <Button
            onClick={handleNewConversation}
            className="w-full justify-start gap-2"
            variant="secondary"
          >
            <PlusCircle size={16} />
            {t('history.newChat')}
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="px-4 pb-4">
            {conversations.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t('history.empty')}
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                      'hover:bg-muted cursor-pointer',
                      currentConversationId === conversation.id && 'bg-muted'
                    )}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <span className="text-muted-foreground">
                      <MessageSquare size={16} />
                    </span>
                    <span className="flex-1 truncate">{conversation.title}</span>
                    {showDelete && onDeleteConversation && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default HistorySidebar;
