import { describe, expect, it } from "vitest";
import { createArenaService } from "../server/src/arena-service.js";
import { filterReviewQueue } from "../shared/filters.js";
import { loadCleanArenaData } from "./test-data.js";

describe("review queue filters", () => {
  it("combines case, model, status and failure-label filters", () => {
    const service = createArenaService(loadCleanArenaData());
    service.saveReview({ case_id: "case-lpr-2024-04", model_id: "wencai", answer_id: "answer-lpr-wencai", scores: { numerical_accuracy: 8, citation_evidence: 8, data_timeliness: 8, safety_compliance: 8, answer_quality: 8 }, final_scores: { numerical_accuracy: 8, citation_evidence: 8, data_timeliness: 8, safety_compliance: 8, answer_quality: 8 }, failure_labels: ["引用无效"], comment: "待复核", status: "评审中" });
    service.saveReview({ case_id: "case-gdp-2024", model_id: "qwen", answer_id: "answer-gdp-qwen", scores: { numerical_accuracy: 10, citation_evidence: 10, data_timeliness: 10, safety_compliance: 10, answer_quality: 10 }, final_scores: { numerical_accuracy: 10, citation_evidence: 10, data_timeliness: 10, safety_compliance: 10, answer_quality: 10 }, failure_labels: ["数字错误"], comment: "完成", status: "已完成" });
    const queue = service.listReviewQueue();
    expect(filterReviewQueue(queue, { case_id: "case-lpr-2024-04", model_id: "wencai", status: "评审中", failure_labels: ["引用无效"] })).toHaveLength(1);
    expect(filterReviewQueue(queue, { status: "未评审", failure_labels: ["数字错误"] })).toHaveLength(0);
    expect(filterReviewQueue(queue, { failure_labels: ["数字错误", "引用无效"] })).toHaveLength(2);
  });

  it("keeps unreviewed answer pairs in the queue for navigation", () => {
    const service = createArenaService(loadCleanArenaData());
    const queue = service.listReviewQueue();
    expect(queue).toHaveLength(20);
    expect(queue.every((item) => item.status === "未评审" && item.answer_id)).toBe(true);
  });
});
