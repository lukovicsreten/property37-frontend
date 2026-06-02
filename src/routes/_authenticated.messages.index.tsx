import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, Send, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { messagesApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth";
import { formatDate, messageDate, messageIsRead } from "@/lib/format";
import type { MessageResponse } from "@/lib/api/types";

export const Route = createFileRoute("/_authenticated/messages/")({
  component: MessagesPage,
});

/** Group messages by the other participant's userId */
function groupByUser(messages: MessageResponse[], myEmail: string) {
  const map = new Map<number, MessageResponse>();
  for (const m of messages) {
    const otherId = m.senderEmail === myEmail ? m.receiverId : m.senderId;
    const existing = map.get(otherId);
    // Keep the most-recent message per conversation
    if (!existing || new Date(messageDate(m) ?? 0) > new Date(messageDate(existing) ?? 0)) {
      map.set(otherId, m);
    }
  }
  return [...map.entries()].sort(
    (a, b) =>
      new Date(messageDate(b[1]) ?? 0).getTime() -
      new Date(messageDate(a[1]) ?? 0).getTime()
  );
}

interface ConversationRowProps {
  userId: number;
  last: MessageResponse;
  myEmail: string;
  showUnread?: boolean;
}

function ConversationRow({ userId, last, myEmail, showUnread }: ConversationRowProps) {
  const otherEmail =
    last.senderEmail === myEmail ? last.receiverEmail : last.senderEmail;
  const unread = showUnread && !messageIsRead(last) && last.receiverEmail === myEmail;

  return (
    <Link to="/messages/$userId" params={{ userId: String(userId) }}>
      <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {unread && <Circle className="h-2 w-2 fill-primary text-primary flex-shrink-0" />}
              <p className={`text-sm font-medium truncate ${unread ? "font-semibold" : ""}`}>
                {otherEmail}
              </p>
            </div>
            {last.propertyTitle && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Nekretnina: {last.propertyTitle}
              </p>
            )}
            <p className="text-sm text-muted-foreground truncate mt-1">{last.content}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs text-muted-foreground">{formatDate(messageDate(last))}</span>
            {unread && <Badge variant="default" className="text-xs px-1.5 py-0">Novo</Badge>}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function MessagesPage() {
  const { user } = useAuth();

  const { data: received, isLoading: loadingReceived } = useQuery({
    queryKey: ["msg-received"],
    queryFn: () => messagesApi.getReceived(),
    refetchInterval: 15000,
  });

  const { data: sent, isLoading: loadingSent } = useQuery({
    queryKey: ["msg-sent"],
    queryFn: () => messagesApi.getSent(),
    refetchInterval: 15000,
  });

  const myEmail = user?.email ?? "";

  const receivedConversations = received ? groupByUser(received, myEmail) : [];
  const sentConversations = sent ? groupByUser(sent, myEmail) : [];

  const unreadCount = received?.filter(
    (m) => !messageIsRead(m) && m.receiverEmail === myEmail
  ).length ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Poruke</h1>
        <p className="text-muted-foreground">Vaše primljene i poslate poruke.</p>
      </div>

      <Tabs defaultValue="received">
        <TabsList className="mb-4">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Primljene
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-1 text-xs px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Poslate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {loadingReceived ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : receivedConversations.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">Nema primljenih poruka.</p>
          ) : (
            <div className="space-y-2">
              {receivedConversations.map(([uid, last]) => (
                <ConversationRow
                  key={uid}
                  userId={uid}
                  last={last}
                  myEmail={myEmail}
                  showUnread
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {loadingSent ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : sentConversations.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">Nema poslatih poruka.</p>
          ) : (
            <div className="space-y-2">
              {sentConversations.map(([uid, last]) => (
                <ConversationRow
                  key={uid}
                  userId={uid}
                  last={last}
                  myEmail={myEmail}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
