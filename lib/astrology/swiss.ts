import "server-only";

import path from "node:path";
import { promises as fs } from "node:fs";
import SwissEPH from "sweph-wasm";

// Bugfix (l): Swiss init is server-only and ephemeris is loaded from server path when provided.
const DEFAULT_WASM_URL = "https://unpkg.com/sweph-wasm@2.6.9/dist/wasm/swisseph.wasm";
const DEFAULT_EPHE_URL = "https://ptprashanttripathi.github.io/sweph-wasm/ephe/";
const DEFAULT_EPHE_FILES = ["seas_18.se1", "semo_18.se1", "sepl_18.se1"];

let swissPromise: Promise<SwissEPH> | null = null;

async function ensureReadableDirectory(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) return false;
    await fs.access(dirPath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function getSwissEngine(): Promise<SwissEPH> {
  if (!swissPromise) {
    swissPromise = (async () => {
      const wasmUrl = process.env.SWISS_WASM_URL?.trim() || DEFAULT_WASM_URL;
      const swe = await SwissEPH.init(wasmUrl);

      const configuredPath = process.env.SWISS_EPHE_PATH?.trim();
      if (configuredPath) {
        const resolvedPath = path.resolve(configuredPath);
        const canRead = await ensureReadableDirectory(resolvedPath);
        if (canRead) {
          await swe.swe_set_ephe_path(`file://${resolvedPath.replace(/\\/g, "/")}`);
        } else {
          await swe.swe_set_ephe_path(DEFAULT_EPHE_URL, DEFAULT_EPHE_FILES);
        }
      } else {
        await swe.swe_set_ephe_path(DEFAULT_EPHE_URL, DEFAULT_EPHE_FILES);
      }

      swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
      return swe;
    })();
  }

  return swissPromise;
}
