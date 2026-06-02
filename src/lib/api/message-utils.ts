import type { MessageResponse } from "./types";
import { messageDate, messageIsRead } from "@/lib/format";

export { messageDate, messageIsRead };

export function sortMessagesNewestFirst(messages: MessageResponse[]): MessageResponse[] {
  return [...messages].sort(
    (a, b) => new Date(messageDate(b) ?? 0).getTime() - new Date(messageDate(a) ?? 0).getTime(),
  );
}
