export type LocationDistrict = string;
export type PropertyStatus = "AVAILABLE" | "SOLD";
export type PropertyType = "STAN" | "APARTMAN" | "KUCA" | "VILA" | "ZEMLJISTE";

export interface AuthResponse {
  token: string;
  email: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LocationResponse {
  code: LocationDistrict;
  label: string;
}

export interface PropertyResponse {
  id: number;
  propertyType?: PropertyType;
  type?: PropertyType;
  title: string;
  description: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms?: number;
  location: LocationDistrict;
  status: PropertyStatus;
  imageUrl?: string;
  imageUrls?: string[];
  ownerId?: number;
  ownerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  averageRating?: number;
  sprat?: number;
  lift?: boolean;
  grejanje?: string;
  energetskiRazred?: string;
  povrsinaPlaca?: number;
  brojSpratova?: number;
  bazen?: boolean;
  garaza?: boolean;
  dvoriste?: boolean;
  namena?: string;
  prikljucci?: string;
}

interface BasePropertyRequest {
  title: string;
  description: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: LocationDistrict;
  status: PropertyStatus;
  imageUrl?: string;
  imageUrls?: string[];
}

export interface StanRequest extends BasePropertyRequest {
  sprat?: number;
  lift?: boolean;
  grejanje?: string;
  energetskiRazred?: string;
}

export interface ApartmanRequest extends BasePropertyRequest {
  sprat?: number;
  lift?: boolean;
  grejanje?: string;
  energetskiRazred?: string;
}

export interface KucaRequest extends BasePropertyRequest {
  povrsinaPlaca: number;
  brojSpratova?: number;
  bazen?: boolean;
  garaza?: boolean;
  dvoriste?: boolean;
}

export interface VilaRequest extends BasePropertyRequest {
  povrsinaPlaca: number;
  brojSpratova?: number;
  bazen?: boolean;
  garaza?: boolean;
  dvoriste?: boolean;
}

export interface ZemljisteRequest extends BasePropertyRequest {
  povrsinaPlaca: number;
  namena?: string;
  prikljucci?: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  rating: number;
  userId: number;
  userEmail: string;
  propertyId: number;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  parentCommentId?: number | null;
  replies?: CommentResponse[];
}

export interface CommentRequest {
  content: string;
  rating: number;
}

export interface CommentUpdateRequest {
  content: string;
  rating: number;
}

export interface ReplyRequest {
  content: string;
}

export interface MessageResponse {
  id: number;
  content: string;
  senderId: number;
  senderEmail: string;
  receiverId: number;
  receiverEmail: string;
  propertyId?: number;
  propertyTitle?: string;
  sentAt?: string;
  createdAt?: string;
  isRead?: boolean;
  read?: boolean;
  parentMessageId?: number | null;
}

export interface MessageRequest {
  content: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface PropertySearchParams {
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  location?: LocationDistrict;
  bedrooms?: number;
  status?: PropertyStatus;
  propertyType?: PropertyType;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  size?: number;
}
