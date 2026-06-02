import { apiFetch } from "./client";
import type {
  AuthResponse, LoginRequest, RegisterRequest,
  LocationResponse, PropertyResponse, PageResponse, PropertySearchParams,
  StanRequest, ApartmanRequest, KucaRequest, VilaRequest, ZemljisteRequest,
  CommentResponse, CommentRequest, CommentUpdateRequest, ReplyRequest,
  MessageResponse, MessageRequest,
} from "./types";

export const authApi = {
  login: (data: LoginRequest) => apiFetch<AuthResponse>("/api/auth/login", { method: "POST", body: data, auth: false }),
  register: (data: RegisterRequest) => apiFetch<AuthResponse>("/api/auth/register", { method: "POST", body: data, auth: false }),
};

export const locationsApi = {
  getAll: () => apiFetch<LocationResponse[]>("/api/locations", { auth: false }),
};

export const propertiesApi = {
  search: (p: PropertySearchParams) =>
    apiFetch<PageResponse<PropertyResponse>>("/api/properties", { params: p as Record<string, unknown>, auth: false }),
  getById: (id: number) => apiFetch<PropertyResponse>(`/api/properties/${id}`, { auth: false }),
  createStan: (b: StanRequest) => apiFetch<PropertyResponse>("/api/properties/stan", { method: "POST", body: b }),
  createApartman: (b: ApartmanRequest) => apiFetch<PropertyResponse>("/api/properties/apartman", { method: "POST", body: b }),
  createKuca: (b: KucaRequest) => apiFetch<PropertyResponse>("/api/properties/kuca", { method: "POST", body: b }),
  createVila: (b: VilaRequest) => apiFetch<PropertyResponse>("/api/properties/vila", { method: "POST", body: b }),
  createZemljiste: (b: ZemljisteRequest) => apiFetch<PropertyResponse>("/api/properties/zemljiste", { method: "POST", body: b }),
  updateStan: (id: number, b: StanRequest) => apiFetch<PropertyResponse>(`/api/properties/stan/${id}`, { method: "PUT", body: b }),
  updateApartman: (id: number, b: ApartmanRequest) => apiFetch<PropertyResponse>(`/api/properties/apartman/${id}`, { method: "PUT", body: b }),
  updateKuca: (id: number, b: KucaRequest) => apiFetch<PropertyResponse>(`/api/properties/kuca/${id}`, { method: "PUT", body: b }),
  updateVila: (id: number, b: VilaRequest) => apiFetch<PropertyResponse>(`/api/properties/vila/${id}`, { method: "PUT", body: b }),
  updateZemljiste: (id: number, b: ZemljisteRequest) => apiFetch<PropertyResponse>(`/api/properties/zemljiste/${id}`, { method: "PUT", body: b }),
  delete: (id: number) => apiFetch<void>(`/api/properties/${id}`, { method: "DELETE" }),
};

export const commentsApi = {
  getByProperty: (id: number) => apiFetch<CommentResponse[]>(`/api/properties/${id}/comments`, { auth: false }),
  create: (id: number, b: CommentRequest) => apiFetch<CommentResponse>(`/api/properties/${id}/comments`, { method: "POST", body: b }),
  update: (id: number, b: CommentUpdateRequest) => apiFetch<CommentResponse>(`/api/comments/${id}`, { method: "PUT", body: b }),
  delete: (id: number) => apiFetch<void>(`/api/comments/${id}`, { method: "DELETE" }),
  reply: (id: number, b: ReplyRequest) => apiFetch<CommentResponse>(`/api/comments/${id}/reply`, { method: "POST", body: b }),
};

export const messagesApi = {
  sendToOwner: (propertyId: number, b: MessageRequest) =>
    apiFetch<MessageResponse>(`/api/properties/${propertyId}/messages`, { method: "POST", body: b }),
  getReceived: () => apiFetch<MessageResponse[]>("/api/my-messages"),
  getSent: () => apiFetch<MessageResponse[]>("/api/my-messages/sent"),
  getConversation: (userId: number) => apiFetch<MessageResponse[]>(`/api/my-messages/conversation/${userId}`),
  reply: (id: number, b: MessageRequest) => apiFetch<MessageResponse>(`/api/messages/${id}/reply`, { method: "POST", body: b }),
  markAsRead: (id: number) => apiFetch<MessageResponse>(`/api/messages/${id}/read`, { method: "PUT" }),
  unreadCount: () => apiFetch<{ count?: number; unread?: number; unreadCount?: number } & Record<string, number>>("/api/messages/unread/count"),
};