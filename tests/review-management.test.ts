import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createArenaService, loadArenaData } from "../server/src/arena-service.js";
import type { ReviewInput, ScoreSet } from "../shared/types/domain.js";

const scoreSet: ScoreSet = {
  numerical_accuracy: 8,
  citation_evidence: 7,
  data_timeliness: 9,
  safety_compliance: 10,
  answer_quality: 8,
};
const tempDirs: string[] = [];

afterEach(() => {
  for (const directory of tempDirs.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function reviewInput(overrides: Partial<ReviewInput> = {}): ReviewInput {
  return {
    case_id: "case-lpr-2024-04",
    model_id: "wencai",
    answer_id: "answer-lpr-wencai",
    scores: scoreSet,
    final_scores: scoreSet,
    failure_labels: ["引用无效", "单位错误"],
    comment: "引用需要进一步核对。",
    status: "评审中",
    ...overrides,
  };
}

describe("review record persistence", () => {
  it("saves a complete review and restores it from local JSON", () => {
    const directory = mkdtempSync(join(tmpdir(), "financial-arena-review-"));
    tempDirs.push(directory);
    const filePath = join(directory, "arena-data.json");
    writeFileSync(filePath, readFileSync(join(process.cwd(), "data/fixtures/arena-data.json")));

    const service = createArenaService(loadArenaData(filePath), { persistPath: filePath });
    const saved = service.saveReview(reviewInput());
    const restored = createArenaService(loadArenaData(filePath));

    expect(saved.review_id).toBeTruthy();
    expect(restored.getReview("case-lpr-2024-04", "wencai")).toMatchObject({
      case_id: "case-lpr-2024-04",
      model_id: "wencai",
      answer_id: "answer-lpr-wencai",
      status: "评审中",
      failure_labels: ["引用无效", "单位错误"],
    });
  });

  it("modifies scores, labels, comment and status of an existing review", () => {
    const service = createArenaService(loadArenaData());
    const saved = service.saveReview(reviewInput());
    const updated = service.saveReview(reviewInput({ review_id: saved.review_id, scores: { ...scoreSet, answer_quality: 5 }, final_scores: { ...scoreSet, answer_quality: 5 }, failure_labels: ["数字错误"], comment: "已补充数字核对。", status: "已完成" }));

    expect(updated.review_id).toBe(saved.review_id);
    expect(updated.scores.answer_quality).toBe(5);
    expect(updated.failure_labels).toEqual(["数字错误"]);
    expect(updated.comment).toBe("已补充数字核对。");
    expect(updated.status).toBe("已完成");
  });

  it("rejects invalid score ranges and statuses", () => {
    const service = createArenaService(loadArenaData());

    expect(() => service.saveReview(reviewInput({ scores: { ...scoreSet, numerical_accuracy: 11 } }))).toThrow(/0 and 10/);
    expect(() => service.saveReview(reviewInput({ status: "草稿" as ReviewInput["status"] }))).toThrow(/status/);
  });
});
