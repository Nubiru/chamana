export type CapaName = 'tierra' | 'fuego' | 'agua' | 'aire';

export interface MarketingPacket {
  caption: string;
  hashtags: string[];
  cta: string;
  timing: string;
  platform: string;
}
