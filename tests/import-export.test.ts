import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createArenaService } from "../server/src/arena-service.js";
import { loadCleanArenaData } from "./test-data.js";

const tempDirs: string[] = [];
afterEach(() => { for (const directory of tempDirs.splice(0)) rmSync(directory, { recursive: true, force: true }); });

describe("JSON import and export", () => {
  it("exports a traceable snapshot with answers, reviews, rules and timestamp", () => {
    const snapshot = createArenaService(loadCleanArenaData()).exportSnapshot();
    expect(snapshot.schema_version).toBe("1.0.0");
    expect(snapshot.cases).toHaveLength(5);
    expect(snapshot.answers).toHaveLength(20);
    expect(snapshot.review_records).toEqual([]);
    expect(snapshot.scoring_rules.version).toBe("v1.0.0");
    expect(snapshot.exported_at).toMatch(/Z$/);
  });

  it("rejects invalid data without changing the current snapshot", () => {
    const service = createArenaService(loadCleanArenaData());
    const before = service.getSnapshot();
    const invalid = { ...service.exportSnapshot(), answers: [{ ...service.exportSnapshot().answers[0], case_id: "missing-case" }] };
    expect(() => service.previewImport(invalid)).toThrow(/Invalid/);
    expect(service.getSnapshot()).toEqual(before);
  });

  it("previews, replaces and restores the complete local JSON snapshot", () => {
    const directory = mkdtempSync(join(tmpdir(), "financial-arena-import-"));
    tempDirs.push(directory);
    const filePath = join(directory, "arena-data.json");
    writeFileSync(filePath, readFileSync(join(process.cwd(), "data/fixtures/arena-data.json")));
    const source = createArenaService(loadCleanArenaData(filePath), { persistPath: filePath });
    const exported = source.exportSnapshot();
    exported.dataset_version = "imported-demo";
    expect(source.previewImport(exported)).toEqual({ cases: 5, answers: 20, reviews: 0 });
    source.importSnapshot(exported);
    expect(createArenaService(loadCleanArenaData(filePath)).getSnapshot().dataset_version).toBe("imported-demo");
  });
});
