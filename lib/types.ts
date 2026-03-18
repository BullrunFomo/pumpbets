export type MarketType = 'binary' | 'multiple';
export type Category = 'All' | 'Crypto' | 'PumpFun' | 'Memes' | 'Business';
export type SortOption = 'Trending' | 'New' | 'Volume' | 'Expiring';

export interface BinaryMarket {
  id: string;
  type: 'binary';
  category: Category;
  question: string;
  yesPercent: number;
  noPercent: number;
  totalBet: string;
  comments: number;
  expiresAt: string;
  icon?: string;
  iconText?: string;
  image?: string;
  createdAt: string;
  volume: number;
  resolved?: boolean;
  winningOption?: string | null;
}

export interface MultipleChoiceOption {
  label: string;
  percent: number;
}

export interface MultipleMarket {
  id: string;
  type: 'multiple';
  category: Category;
  question: string;
  options: MultipleChoiceOption[];
  totalBet: string;
  comments: number;
  expiresAt: string;
  icon?: string;
  iconText?: string;
  image?: string;
  createdAt: string;
  volume: number;
  resolved?: boolean;
  winningOption?: string | null;
}

export type Market = BinaryMarket | MultipleMarket;
