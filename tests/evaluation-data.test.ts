import { describe, expect, it } from "vitest";
import { createArenaService } from "../server/src/arena-service.js";

describe("built-in evaluation data", () => {
  it("exposes at least five evaluation cases", () => {
    const service = createArenaService();

    expect(service.listCases()).toHaveLength(5);
  });

  it("provides four model answers and evidence for every case", () => {
    const service = createArenaService();

    for (const evaluationCase of service.listCases()) {
      const answers = service.listAnswers(evaluationCase.case_id);

      expect(answers).toHaveLength(4);
      expect(new Set(answers.map((answer) => answer.model_id)).size).toBe(4);
      expect(evaluationCase.allowed_evidence.length).toBeGreaterThan(0);
      expect(evaluationCase.cutoff_at).toMatch(/Z$/);

      for (const answer of answers) {
        expect(answer.case_id).toBe(evaluationCase.case_id);
        expect(answer.answer.trim()).not.toBe("");
        expect(answer.generated_at).toMatch(/Z$/);
      }
    }
  });
});
