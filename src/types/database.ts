/**
 * Hand-crafted Supabase Database types matching 001_schema.sql.
 * Each table must include `Relationships` to satisfy postgrest-js GenericTable.
 */

export type GameStatus = "lobby" | "reading" | "answering" | "leaderboard" | "finished";

export type Database = {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          text: string;
          options: string[];
          correct_option_index: number;
          time_limit: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          options: string[];
          correct_option_index: number;
          time_limit?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          options?: string[];
          correct_option_index?: number;
          time_limit?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      games: {
        Row: {
          id: string;
          status: GameStatus;
          current_question_index: number;
          question_start_time: string | null;
          settings: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          status?: GameStatus;
          current_question_index?: number;
          question_start_time?: string | null;
          settings?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          status?: GameStatus;
          current_question_index?: number;
          question_start_time?: string | null;
          settings?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };

      game_questions: {
        Row: {
          id: string;
          game_id: string;
          question_id: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          game_id: string;
          question_id: string;
          order_index: number;
        };
        Update: {
          id?: string;
          game_id?: string;
          question_id?: string;
          order_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: "game_questions_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };

      players: {
        Row: {
          id: string;
          game_id: string;
          nickname: string;
          avatar: string;
          score: number;
          current_streak: number;
          joined_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          nickname: string;
          avatar?: string;
          score?: number;
          current_streak?: number;
          joined_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          nickname?: string;
          avatar?: string;
          score?: number;
          current_streak?: number;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "players_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };

      answers: {
        Row: {
          id: string;
          player_id: string;
          question_id: string;
          game_id: string;
          selected_option: number | null;
          is_correct: boolean;
          response_time_ms: number | null;
          points_earned: number;
          answered_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          question_id: string;
          game_id: string;
          selected_option?: number | null;
          is_correct?: boolean;
          response_time_ms?: number | null;
          points_earned?: number;
          answered_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          question_id?: string;
          game_id?: string;
          selected_option?: number | null;
          is_correct?: boolean;
          response_time_ms?: number | null;
          points_earned?: number;
          answered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answers_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
    };

    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      game_status: GameStatus;
    };
  };
};
