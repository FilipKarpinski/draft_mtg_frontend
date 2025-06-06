export interface Player {
  id: number;
  name: string;
}

export interface Draft {
  id: number;
  name: string;
  date: string;
}

export interface Match {
  id: number;
  player_1_id: number;
  player_2_id: number;
  score: string | null;
  round_id: number;
  player_1: Player;
  player_2: Player;
}

export interface Round {
  id: number;
  number: number;
  draft_id: number;
  matches: Match[];
}

export interface DraftPlayer {
  draft_id: number;
  player_id: number;
  deck_colors: string[];
  points: number;
  final_place: number | null;
  order: number;
}

export interface DraftDetailData {
  id: number;
  rounds: Round[];
  draft_players: DraftPlayer[];
}

export interface UserData {
  email: string;
  is_active: boolean;
  is_admin: boolean;
} 