import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { messagesApi } from "@/lib/api/endpoints";
import { MessageSquare } from "lucide-react";

export function MessageOwnerDialog({ propertyId }: { propertyId: number }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const m = useMutation({
    mutationFn: () => messagesApi.sendToOwner(propertyId, { content: text }),
    onSuccess: () => { setOpen(false); setText(""); toast.success("Poruka poslata"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full"><MessageSquare className="mr-2 h-4 w-4" /> Pošalji poruku vlasniku</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Poruka vlasniku</DialogTitle></DialogHeader>
        <Textarea placeholder="Vaše pitanje ili poruka…" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Otkaži</Button>
          <Button onClick={() => m.mutate()} disabled={!text.trim() || m.isPending}>Pošalji</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}