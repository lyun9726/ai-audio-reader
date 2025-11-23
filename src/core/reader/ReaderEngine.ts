import { ParseResult } from "./types";

export interface ReaderAdapter {
  parse(buffer: ArrayBuffer): Promise<ParseResult>;
}

export class ReaderEngine {
  constructor(private adapter: ReaderAdapter) {}

  async parse(buffer: ArrayBuffer) {
    return await this.adapter.parse(buffer);
  }
}
