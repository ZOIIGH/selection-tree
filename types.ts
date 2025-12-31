export type TagType = '引流' | '流行' | '小眾';

export interface MerchandiseNode {
  name: string;
  tag?: TagType;
  children?: MerchandiseNode[];
}

export interface SimilarStore {
  name: string;
  platform: 'shopee' | 'momo' | 'official';
  description?: string;
}

export interface SimilarStores {
  marketplace: SimilarStore[];  // 蝦皮/momo stores
  officialBrands: SimilarStore[];  // 自有品牌官網
}

export interface TreeResponse {
  name: string;
  children: MerchandiseNode[];
  similarStores?: SimilarStores;
}

export interface SelectionFormData {
  category: string;
  style: string;
}

export interface InspirationSuggestion {
  category: string;
  targetAudience: string;
  productTags: string[];
  pros: string[];
  cons: string[];
  referenceStores: string[];
}

export interface InspirationResponse {
  suggestions: InspirationSuggestion[];
}
