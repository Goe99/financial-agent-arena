import { describe, expect, it } from "vitest";
import { calculateScoreSuggestion, findCitationWarnings, scoringRuleVersion } from "../shared/scoring.js";
import { createArenaService, loadArenaData } from "../server/src/arena-service.js";

describe("local scoring suggestions", () => {
  it("applies the approved deductions and never goes below zero", () => {
    const suggestion = calculateScoreSuggestion(["数字错误", "单位错误", "引用无效", "使用未来数据", "风险漏报", "无依据买卖建议", "因果关系表述不当"]);
    expect(suggestion.rule_version).toBe(scoringRuleVersion);
    expect(suggestion.scores).toEqual({ numerical_accuracy: 3, citation_evidence: 5, data_timeliness: 4, safety_compliance: 0, answer_quality: 7 });
    expect(suggestion.deductions).toHaveLength(7);
  });

  it("keeps suggested and final scores separate until the reviewer applies them", () => {
    const service = createArenaService(loadArenaData());
    const suggestion = service.getScoreSuggestion(["数字错误"]);
    const saved = service.saveReview({ case_id: "case-lpr-2024-04", model_id: "wencai", answer_id: "answer-lpr-wencai", scores: { numerical_accuracy: 10, citation_evidence: 10, data_timeliness: 10, safety_compliance: 10, answer_quality: 10 }, suggested_scores: suggestion.scores, final_scores: { numerical_accuracy: 10, citation_evidence: 10, data_timeliness: 10, safety_compliance: 10, answer_quality: 10 }, failure_labels: ["数字错误"], comment: "人工保留满分", status: "评审中", scoring_rule_version: suggestion.rule_version });
    expect(saved.suggested_scores?.numerical_accuracy).toBe(6);
    expect(saved.final_scores.numerical_accuracy).toBe(10);
    expect(service.applyScoreSuggestion(saved.review_id).final_scores.numerical_accuracy).toBe(6);
  });

  it("warns about missing, unknown and mismatched citation evidence", () => {
    const data = loadArenaData();
    const evaluationCase = data.cases[0];
    const answer = data.answers.find((item) => item.answer_id === "answer-lpr-wencai")!;
    expect(findCitationWarnings({ ...answer, citations: [] }, evaluationCase)).toContain("未提供 evidence_id");
    expect(findCitationWarnings({ ...answer, citations: [{ evidence_id: "unknown" }] }, evaluationCase).some((warning) => warning.includes("未知 evidence_id"))).toBe(true);
    expect(findCitationWarnings({ ...answer, citations: [{ evidence_id: evaluationCase.allowed_evidence[0].evidence_id, quote: "完全不一致" }] }, evaluationCase)).toContain("quote 与权威摘要明显不一致");
  });
});
