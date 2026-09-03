export type GameId = 'p5r' | 'p4g' | 'p3r' | 'p5' | 'p4' | 'p3p' | 'p3fes';

export interface GameInfo {
  id: GameId;
  title: string;
  series: 'p3' | 'p4' | 'p5';
  shortTitle: string;
  color: string;
  accentColor: string;
  bgGradient: string;
  badge: string;
  sub: string;
  logo?: string;
  slogan?: string;
  tagline?: string;
}

export interface PersonaSkill {
  name: string;
  level: number; // 0 or <1: innate, >=100: special/evolved, otherwise level learned
  cost?: string;
  effect?: string;
  element?: string;
}

export interface PersonaData {
  name: string;
  arcana: string;
  level: number;
  stats: [number, number, number, number, number]; // St, Ma, En, Ag, Lu
  skills: Record<string, number>;
  resists?: string; // 8 or 10 chars
  trait?: string;
  item?: string;
  itemr?: string;
  inherits?: string;
  fusion?: string;
  isDlc?: boolean;
}

export interface PersonaRawMap {
  [name: string]: {
    arcana?: string;
    race?: string;
    level?: number;
    lvl?: number;
    stats?: [number, number, number, number, number];
    skills?: Record<string, number>;
    resists?: string;
    trait?: string;
    item?: string;
    itemr?: string;
    inherits?: string;
    fusion?: string;
    isDlc?: boolean;
  };
}

export interface FusionChart {
  races: string[];
  table: string[][];
}

export type SpecialFusions = Record<string, string[][]>;

export interface FusionRecipe {
  sources: { name: string; arcana: string; level: number }[];
  isSpecial?: boolean;
  isTriangle?: boolean;
  cost?: number;
}

export interface ClassroomAnswer {
  Question: string;
  Answer: string;
  Choice?: number | string;
}

export interface ClassroomMonthData {
  [category: string]: {
    [date: string]: ClassroomAnswer[];
  };
}

export interface SocialLinkDialogue {
  Question: string;
  Choices: {
    Answer: string;
    Points: number;
    Note?: string;
  }[];
}

export interface SocialLinkRank {
  Requirements?: string;
  Benefit?: {
    Name: string;
    Description: string;
  };
  Choices?: {
    Answer: string;
    Points: number;
  }[];
  Dialogues?: SocialLinkDialogue[];
  Note?: string;
}

export interface SocialLinkData {
  character?: string;
  name?: string;
  arcana?: string;
  ranks: Record<string, SocialLinkRank>;
  notes?: string[];
  location?: string;
  schedule?: string;
  romanceWarning?: string;
}

export interface QuestRequest {
  id?: number | string;
  number?: number;
  name?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  available?: string;
  target?: string;
  demon_form?: string;
  location?: string;
  difficulty?: string;
  confusable?: string;
  weakness?: string;
  reward?: string;
  sortOrder?: number;
  details?: string;
  guide?: string;
  completed?: boolean;
  giver?: string;
  deadline?: string;
  requirement?: string;
  walkthrough?: string;
}

export interface BossGuide {
  name: string;
  level?: number;
  location?: string;
  party?: string;
  weaknesses?: string;
  resistances?: string;
  strategy: string;
  buildPrep?: string;
}

export interface DayGuideItem {
  date: string;
  title: string;
  category?: string;
  description: string;
}

export interface MonthGuide {
  month: string;
  overview?: string;
  days: DayGuideItem[];
}

export interface EnemyData {
  name: string;
  persona_name?: string;
  arcana?: string;
  level?: number;
  hp?: number;
  sp?: number;
  stats?: {
    strength?: number;
    magic?: number;
    endurance?: number;
    agility?: number;
    luck?: number;
  };
  resists?: string;
  skills?: string[];
  area?: string;
  exp?: number;
  money?: number;
  drops?: {
    gem?: string;
    item?: string;
  } | string[];
  isBoss?: boolean;
  isMiniBoss?: boolean;
  version?: string;
  episodeAigis?: boolean;
}

export interface ItemData {
  name: string;
  description: string;
  effect: string;
  price?: string;
  location?: string;
  category: string;
}

export interface SkillItem {
  name: string;
  element?: string;
  cost?: string;
  target?: string;
  effect?: string;
  personas?: Record<string, number>;
}

export interface PersonalityData {
  likes: string;
  neutral: string;
  hates: string;
  color: string;
  description: string;
  best_type: string;
  ok_type: string;
  bad_type: string;
}
