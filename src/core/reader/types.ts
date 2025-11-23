export type BlockType = "text" | "image";

export interface ReaderBlock {
  id: string;
  type: BlockType;
  content: string;
  order: number;
  meta?: any;
}

export interface ParseResult {
  blocks: ReaderBlock[];
  metadata?: { title?: string; author?: string; cover?: string; error?: string };
}
