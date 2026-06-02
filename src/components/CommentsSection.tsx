import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { commentsApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { CommentResponse } from "@/lib/api/types";
import { Pencil, Reply, Trash2 } from "lucide-react";

export function CommentsSection({ propertyId }: { propertyId: number }) {
  const { user, isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const key = ["comments", propertyId];

  const { data, isLoading } = useQuery({ queryKey: key, queryFn: () => commentsApi.getByProperty(propertyId) });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const [text, setText] = useState("");
  const [rating, setRating] = useState("5");
  const create = useMutation({
    mutationFn: () => commentsApi.create(propertyId, { content: text, rating: Number(rating) }),
    onSuccess: () => {
      setText("");
      setRating("5");
      invalidate();
      toast.success("Komentar dodat");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Komentari</h2>
      {isAuthenticated ? (
        <Card className="p-4 space-y-3">
          <Textarea placeholder="Vas komentar" value={text} onChange={(e) => setText(e.target.value)} rows={3} />
          <div>
            <Label className="text-xs">Ocena (1-5)</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger className="w-32 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => create.mutate()} disabled={!text.trim() || create.isPending}>
              {create.isPending ? "Slanje..." : "Posalji"}
            </Button>
          </div>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Prijavite se da biste ostavili komentar.</p>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Ucitavanje...</p>
      ) : (
        <div className="space-y-3">
          {data?.length ? (
            data.map((c) => <CommentItem key={c.id} c={c} currentEmail={user?.email} onChange={invalidate} />)
          ) : (
            <p className="text-muted-foreground text-sm">Jos nema komentara.</p>
          )}
        </div>
      )}
    </section>
  );
}

function CommentItem({
  c,
  currentEmail,
  onChange,
}: {
  c: CommentResponse;
  currentEmail?: string;
  onChange: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState(c.content);
  const [editRating, setEditRating] = useState(String(c.rating));

  const reply = useMutation({
    mutationFn: () => commentsApi.reply(c.id, { content: text }),
    onSuccess: () => {
      setText("");
      setReplying(false);
      onChange();
      toast.success("Odgovor poslat");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: () => commentsApi.update(c.id, { content: editText, rating: Number(editRating) }),
    onSuccess: () => {
      setEditing(false);
      onChange();
      toast.success("Izmenjeno");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: () => commentsApi.delete(c.id),
    onSuccess: () => {
      onChange();
      toast.success("Obrisano");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mine = currentEmail && currentEmail === c.userEmail;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{c.userEmail}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(c.createdAt)} - ocena {c.rating}/5
          </p>
        </div>
        <div className="flex items-center gap-1">
          {currentEmail && (
            <Button size="sm" variant="ghost" onClick={() => setReplying((r) => !r)}>
              <Reply className="h-4 w-4" />
            </Button>
          )}
          {mine && (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing((e) => !e)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => del.mutate()}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <div className="mt-2 space-y-2">
          <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} />
          <Select value={editRating} onValueChange={setEditRating}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setEditText(c.content);
                setEditRating(String(c.rating));
              }}
            >
              Otkazi
            </Button>
            <Button size="sm" onClick={() => update.mutate()} disabled={update.isPending}>
              Sacuvaj
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm whitespace-pre-wrap">{c.content}</p>
      )}
      {replying && (
        <div className="mt-3 pl-4 border-l">
          <Textarea placeholder="Odgovor" value={text} onChange={(e) => setText(e.target.value)} rows={2} />
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>
              Otkazi
            </Button>
            <Button size="sm" onClick={() => reply.mutate()} disabled={!text.trim() || reply.isPending}>
              Posalji
            </Button>
          </div>
        </div>
      )}
      {c.replies && c.replies.length > 0 && (
        <div className="mt-3 space-y-2 pl-4 border-l">
          {c.replies.map((r) => (
            <CommentItem key={r.id} c={r} currentEmail={currentEmail} onChange={onChange} />
          ))}
        </div>
      )}
    </Card>
  );
}
