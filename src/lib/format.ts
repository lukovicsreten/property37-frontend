export const formatPrice = (n?: number) =>
  n === undefined || n === null ? "—" : new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 }).format(n) + " €";

export const formatArea = (n?: number) =>
  n === undefined || n === null ? "—" : new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 1 }).format(n) + " m²";

export const formatDate = (s?: string) => {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString("sr-RS", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return s;
  }
};

export const messageDate = (m: { sentAt?: string; createdAt?: string }) => m.sentAt ?? m.createdAt;

export const messageIsRead = (m: { isRead?: boolean; read?: boolean }) => m.isRead ?? m.read ?? false;

export const statusLabel = (s?: string) => {
  switch (s) {
    case "AVAILABLE":
      return "Dostupno";
    case "SOLD":
      return "Prodata";
    default:
      return s ?? "";
  }
};

export const typeLabel = (s?: string) => {
  switch (s) {
    case "STAN":
      return "Stan";
    case "APARTMAN":
      return "Apartman";
    case "KUCA":
      return "Kuća";
    case "VILA":
      return "Vila";
    case "ZEMLJISTE":
      return "Zemljište";
    default:
      return s ?? "";
  }
};
