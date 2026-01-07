export type CardStats = {
  active: number;
  expired: number;
  used: number;
};

export type CardDto = {
  id: number;
  name: string;
  stats: CardStats;
};