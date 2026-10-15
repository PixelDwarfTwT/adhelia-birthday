export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      birthday_content: {
        Row: {
          id: "draft" | "published";
          content: Json;
          published_at: string | null;
          updated_at: string;
        };
        Insert: {
          id: "draft" | "published";
          content: Json;
          published_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: "draft" | "published";
          content?: Json;
          published_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
