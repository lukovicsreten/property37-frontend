import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { messagesApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth";
import { formatDate, messageDate, messageIsRead } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/messages/$userId")({ component: ConversationPage });

function ConversationPage() {
  const { userId } = Route.useParams();
  const uid = Number(userId);
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["conversation", uid],
    queryFn: () => messagesApi.getConversation(uid),
    refetchInterval: 10000,
  });

  // Označi poruke kao pročitane
  useEffect(() => {
    data?.forEach((m) => {
      if (!messageIsRead(m) && m.receiverEmail === user?.email) {
        messagesApi.markAsRead(m.id).catch(() => {});
      }
    });
  }, [data, user?.email]);

  // Auto-scroll na dno kada stignu nove poruke
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  const lastMessageId = data && data.length > 0 ? data[data.length - 1].id : null;
  const otherEmail = data?.find((m) => m.senderEmail !== user?.email)?.senderEmail
    ?? data?.find((m) => m.receiverEmail !== user?.email)?.receiverEmail;
  const propertyTitle = data?.[0]?.propertyTitle;

  const send = useMutation({
    mutationFn: () => {
      if (!lastMessageId) throw new Error("Nema konteksta za odgovor");
      return messagesApi.reply(lastMessageId, { content: text });
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["conversation", uid] });
      qc.invalidateQueries({ queryKey: ["msg-received"] });
      qc.invalidateQueries({ queryKey: ["msg-sent"] });
      qc.invalidateQueries({ queryKey: ["unread-count"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() && lastMessageId && !send.isPending) send.mutate();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      {/* Zaglavlje */}
      <div className="mb-4 flex-shrink-0">
        <Link to="/messages" className="text-sm text-muted-foreground hover:text-foreground">← Sve poruke</Link>
        <div className="mt-2">
          <h1 className="text-2xl font-semibold tracking-tight">{otherEmail ?? "Konverzacija"}</h1>
          {propertyTitle && (
            <p className="text-sm text-muted-foreground">Nekretnina: {propertyTitle}</p>
          )}
        </div>
      </div>

      {/* Poruke */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Učitavanje…</p>
        ) : !data?.length ? (
          <p className="text-muted-foreground text-center py-8">Nema poruka.</p>
        ) : (
          data.map((m) => {
            const mine = m.senderEmail === user?.email;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] space-y-1`}>
                  <Card className={`p-3 ${mine ? "bg-accent text-accent-foreground" : "bg-card"}`}>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  </Card>
                  <p className={`text-[10px] ${mine ? "text-right" : "text-left"} text-muted-foreground px-1`}>
                    {formatDate(messageDate(m))}
                    {mine && (messageIsRead(m) ? " · Pročitano" : " · Poslato")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Polje za odgovor */}
      <div className="flex-shrink-0 mt-4 border-t pt-4">
        <div className="flex gap-2 items-end">
          <Textarea
            placeholder="Napišite odgovor… (Enter za slanje, Shift+Enter za novi red)"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none"
          />
          <Button
            size="icon"
            className="h-[72px] w-12 flex-shrink-0"
            onClick={() => send.mutate()}
            disabled={!text.trim() || send.isPending || !lastMessageId}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Enter — pošalji · Shift+Enter — novi red</p>
      </div>
    </div>
  );
}
