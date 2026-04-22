export type Database = {
  public: {
    Tables: {
      Discipline: {
        Row: {
          id: string;
          name: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Record<string, unknown>;
        Relationships: [];
      };
      Category: {
        Row: {
          id: string;
          name: string;
          gender: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          gender: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Record<string, unknown>;
        Relationships: [];
      };
      Establishment: {
        Row: {
          id: string;
          name: string;
          comuna: string | null;
          logoUrl: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          comuna?: string | null;
          logoUrl?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Record<string, unknown>;
        Relationships: [];
      };
      Team: {
        Row: {
          id: string;
          name: string;
          establishmentId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          establishmentId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Record<string, unknown>;
        Relationships: [
          {
            foreignKeyName: "Team_establishmentId_fkey";
            columns: ["establishmentId"];
            isOneToOne: false;
            referencedRelation: "Establishment";
            referencedColumns: ["id"];
          },
        ];
      };
      Tournament: {
        Row: {
          id: string;
          name: string;
          format: string | null;
          status: string;
          disciplineId: string;
          categoryId: string;
          scheduleStartDate: string | null;
          scheduleEndDate: string | null;
          scheduleMatchesPerMatchday: number | null;
          scheduleAllowedWeekdays: number[] | null;
          scheduleDailyStartTime: string | null;
          scheduleDailyEndTime: string | null;
          scheduleMatchDurationMinutes: number | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          disciplineId: string;
          categoryId: string;
          format?: string | null;
          status?: string;
          scheduleStartDate?: string | null;
          scheduleEndDate?: string | null;
          scheduleMatchesPerMatchday?: number | null;
          scheduleAllowedWeekdays?: number[] | null;
          scheduleDailyStartTime?: string | null;
          scheduleDailyEndTime?: string | null;
          scheduleMatchDurationMinutes?: number | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Record<string, unknown>;
        Relationships: [
          {
            foreignKeyName: "Tournament_disciplineId_fkey";
            columns: ["disciplineId"];
            isOneToOne: false;
            referencedRelation: "Discipline";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Tournament_categoryId_fkey";
            columns: ["categoryId"];
            isOneToOne: false;
            referencedRelation: "Category";
            referencedColumns: ["id"];
          },
        ];
      };
      TournamentTeam: {
        Row: {
          id: string;
          tournamentId: string;
          teamId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          tournamentId: string;
          teamId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Record<string, unknown>;
        Relationships: [
          {
            foreignKeyName: "TournamentTeam_tournamentId_fkey";
            columns: ["tournamentId"];
            isOneToOne: false;
            referencedRelation: "Tournament";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "TournamentTeam_teamId_fkey";
            columns: ["teamId"];
            isOneToOne: false;
            referencedRelation: "Team";
            referencedColumns: ["id"];
          },
        ];
      };
      Match: {
        Row: {
          id: string;
          tournamentId: string;
          homeTeamId: string | null;
          awayTeamId: string | null;
          date: string | null;
          location: string | null;
          homeScore: number | null;
          awayScore: number | null;
          isFinished: boolean;
          status: string | null;
          incidentType: string | null;
          incidentNotes: string | null;
          round: number | null;
          groupName: string | null;
          matchLogicIdentifier: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          tournamentId: string;
          homeTeamId?: string | null;
          awayTeamId?: string | null;
          date?: string | null;
          location?: string | null;
          homeScore?: number | null;
          awayScore?: number | null;
          isFinished?: boolean;
          status?: string | null;
          incidentType?: string | null;
          incidentNotes?: string | null;
          round?: number | null;
          groupName?: string | null;
          matchLogicIdentifier?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Record<string, unknown>;
        Relationships: [
          {
            foreignKeyName: "Match_tournamentId_fkey";
            columns: ["tournamentId"];
            isOneToOne: false;
            referencedRelation: "Tournament";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Match_homeTeamId_fkey";
            columns: ["homeTeamId"];
            isOneToOne: false;
            referencedRelation: "Team";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Match_awayTeamId_fkey";
            columns: ["awayTeamId"];
            isOneToOne: false;
            referencedRelation: "Team";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
