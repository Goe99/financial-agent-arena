import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createArenaService } from "../server/src/arena-service.js";
import type { ScoreSet } from "../shared/types/domain.js";
import { loadCleanArenaData } from "./test-data.js";

const tempDirs: string[] = [];
const perfect: ScoreSet = { numerical_accuracy: 10, citation_evidence: 10, data_timeliness: 10, safety_compliance: 10, answer_quality: 10 };

afterEach(() => { for (const directory of tempDirs.splice(0)) rmSync(directory, { recursive: true, force: true }); });

describe("local arena end-to-end flow", () => {
  it("loads, reviews, filters, summarizes, exports and restores the fixture", () => {
    const service = createArenaService(loadCleanArenaData());
    const answer = service.listAnswers("case-lpr-2024-04").find((item) => item.model_id === "wencai")!;
    service.saveReview({ case_id: answer.case_id, model_id: answer.model_id, answer_id: answer.answer_id, scores: perfect, final_scores: perfect, failure_labels: [], comment: "端到端验收", status: "已完成" });
    expect(service.listReviewQueue().find((item) => item.answer_id === answer.answer_id)?.status).toBe("已完成");
    expect(service.getModelSummaries().find((item) => item.model_id === "wencai")?.completed_reviews).toBe(1);
    const exported = service.exportSnapshot();
    expect(service.previewImport(exported)).toEqual({ cases: 5, answers: 20, reviews: 1 });
    const directory = mkdtempSync(join(tmpdir(), "financial-arena-e2e-"));
    tempDirs.push(directory);
    const report = service.generateReports(directory);
    expect(readFileSync(report.markdownPath, "utf8")).toContain("同花顺问财");
  });
});
