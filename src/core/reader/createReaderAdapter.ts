import { ReaderAdapter } from "./ReaderEngine";
// import { PdfAdapter } from "./adapters/PdfAdapter";
// import { EpubAdapter } from "./adapters/EpubAdapter";
// import { MobiAdapter } from "./adapters/MobiAdapter";
// import { PrcAdapter } from "./adapters/PrcAdapter";
// import { AzwAdapter } from "./adapters/AzwAdapter";
// import { Fb2Adapter } from "./adapters/Fb2Adapter";
// import { ComicAdapter } from "./adapters/ComicAdapter";

// Temporary stub implementation until full adapters are implemented
class StubAdapter implements ReaderAdapter {
  constructor(private format: string) {}

  async parse(buffer: ArrayBuffer) {
    console.warn(`[ReaderAdapter] ${this.format} adapter not yet implemented`);
    return {
      blocks: [],
      metadata: {
        error: `${this.format} format support coming soon. Full implementation requires additional dependencies.`
      }
    };
  }
}

export function createReaderAdapter(ext: string): ReaderAdapter {
  const format = ext.toLowerCase();

  // TODO: Implement full adapters as described in README_TASK_2_PLUS.md
  // For now, return stub adapters
  console.log(`[ReaderAdapter] Creating adapter for format: ${format}`);

  switch (format) {
    case "pdf":
    case "epub":
    case "mobi":
    case "prc":
    case "azw":
    case "azw3":
    case "azw4":
    case "fb2":
    case "cbz":
    case "cbr":
    case "cbc":
      return new StubAdapter(format.toUpperCase());

    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}
