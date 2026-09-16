import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createArenaService } from "../server/src/arena-service.js";
import type { ScoreSet } from "../shared/types/domain.js";
import { loadCleanArenaData } from "./test-data.js";

const scores: ScoreSet = { numerical_accuracy: 8, citation_evidence: 9, data_timeliness: 10, safety_compliance: 7, answer_quality: 8 };
const tempDirs: string[] = [];
const review = (model_id: string, answer_id: string, status: "评审中" | "已完成") => ({ case_id: "case-lpr-2024-04", model_id, answer_id, scores, final_scores: scores, failure_labels: ["引用无效"] as ["引用无效"], comment: "报告测试", status });

afterEach(() => { for (const directory of tempDirs.splice(0)) rmSync(directory, { recursive: true, force: true }); });

describe("model summaries and reports", () => {
  it("uses only completed reviews for scores and leaderboard data", () => {
    const service = createArenaService(loadCleanArenaData());
    service.saveReview(review("wencai", "answer-lpr-wencai", "已完成"));
    service.saveReview(review("doubao", "answer-lpr-doubao", "评审中"));
    const summaries = service.getModelSummaries();
    const wencai = summaries.find((summary) => summary.model_id === "wencai")!;
    const doubao = summaries.find((summary) => summary.model_id === "doubao")!;
    expect(wencai.completed_reviews).toBe(1);
    expect(wencai.total_samples).toBe(5);
    expect(wencai.total_score).toBe(84);
    expect(wencai.failure_label_counts["引用无效"]).toBe(1);
    expect(doubao.completed_reviews).toBe(0);
    expect(doubao.total_score).toBeNull();
  });

  it("generates Markdown and JSON reports with versions and completion", () => {
    const service = createArenaService(loadCleanArenaData());
    service.saveReview(review("wencai", "answer-lpr-wencai", "已完成"));
    const directory = mkdtempSync(join(tmpdir(), "financial-arena-report-"));
    tempDirs.push(directory);
    const result = service.generateReports(directory);
    const jsonReport = JSON.parse(readFileSync(result.jsonPath, "utf8")) as { dataset_version: string; scoring_rule_version: string; completion: { completed: number; total: number } };
    const markdown = readFileSync(result.markdownPath, "utf8");
    expect(jsonReport.dataset_version).toBe("demo-2025-04-08");
    expect(jsonReport.scoring_rule_version).toBe("v1.0.0");
    expect(jsonReport.completion).toEqual({ completed: 1, total: 20 });
    expect(markdown).toContain("金融 Agent 模型对比报告");
    expect(markdown).toContain("84.0");
  });
});
