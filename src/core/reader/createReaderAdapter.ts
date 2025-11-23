import { ReaderAdapter } from "./ReaderEngine";
import { PdfAdapter } from "./adapters/PdfAdapter";
import { EpubAdapter } from "./adapters/EpubAdapter";
import { MobiAdapter } from "./adapters/MobiAdapter";
import { PrcAdapter } from "./adapters/PrcAdapter";
import { AzwAdapter } from "./adapters/AzwAdapter";
import { Fb2Adapter } from "./adapters/Fb2Adapter";
import { ComicAdapter } from "./adapters/ComicAdapter";

export function createReaderAdapter(ext: string): ReaderAdapter {
  switch (ext.toLowerCase()) {
    case "pdf":
      return new PdfAdapter();
    case "epub":
      return new EpubAdapter();
    case "mobi":
      return new MobiAdapter();
    case "prc":
      return new PrcAdapter();
    case "azw":
    case "azw3":
    case "azw4":
      return new AzwAdapter();
    case "fb2":
      return new Fb2Adapter();
    case "cbz":
      return new ComicAdapter("cbz");
    case "cbr":
      return new ComicAdapter("cbr");
    case "cbc":
      return new ComicAdapter("cbc");

    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}
