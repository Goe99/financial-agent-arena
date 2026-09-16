import type { ArenaData } from "../shared/types/domain.js";
import { loadArenaData } from "../server/src/arena-service.js";

export function loadCleanArenaData(filePath?: string): ArenaData {
  const data = loadArenaData(filePath);
  return { ...data, review_records: [] };
}
