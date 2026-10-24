export type TabId = "home" | "dig" | "restore" | "passport" | "discover" | "settings";

export type Artifact = {
  id: string;
  name: string;
  chineseName: string;
  period: string;
  material: string;
  purpose: string;
  layer: number;
  description: string;
  symbol: string;
};

export type Layer = {
  id: number;
  title: string;
  chineseTitle: string;
  depth: string;
  description: string;
  color: string;
  artifactId?: string;
};