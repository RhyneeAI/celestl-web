export interface ServerDifficulty {
  ratingClass: number;
  rating: number;
  ratingPlus?: boolean;
  constant: number;
  chartDesigner: string;
  jacketDesigner: string;
  jacketOverride?: boolean;
}

export interface ServerChartRow {
  difficulty: string;
  level: string;
  constant: string;
  chart_designer: string;
  jacket_designer: string;
  ratingClass: number;
  rating: number;
  ratingPlus: boolean;
  jacketOverride?: boolean;
  jacket?: string;
}

export interface ServerSongItem {
  id: string;
  slug: string;
  title: string;
  artist: string;
  bpm: string | number;
  set: string;
  pack: string;
  side: string;
  bg: string;
  version: string;
  date: number;
  remoteDl: boolean;
  jacket: string;
  jacket_full: string;
  difficulties: ServerDifficulty[];
  diffs: ServerChartRow[];
  rawJson?: any;
}
