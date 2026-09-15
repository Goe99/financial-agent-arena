import { describe, expect, it } from "vitest";
import { createArenaService, loadArenaData } from "../server/src/arena-service.js";
import type { ModelAnswer } from "../shared/types/domain.js";

const caseId = "case-lpr-2024-04";

function newAnswer(overrides: Partial<Omit<ModelAnswer, "answer_id" | "status">> = {}): Omit<ModelAnswer, "answer_id" | "status"> {
  return {
    case_id: caseId,
    model_id: "local-agent",
    model_name: "本地 Agent",
    answer: "本地回答：4 月 LPR 为 3.45% 和 3.95%。",
    citations: [{ evidence_id: "evidence-pbc-lpr-20240422", quote: "2024 年 4 月贷款市场报价利率" }],
    generated_at: "2025-04-08T09:00:00Z",
    ...overrides,
  };
}

describe("model answer management", () => {
  it("displays the four baseline answers for one case", () => {
    const service = createArenaService(loadArenaData());

    expect(service.listAnswers(caseId)).toHaveLength(4);
    expect(service.listAnswers(caseId).map((answer) => answer.model_id)).toEqual(
      expect.arrayContaining(["wencai", "doubao", "qwen", "yuanbao"]),
    );
  });

  it("adds a local answer and soft-deletes it without losing history", () => {
    const service = createArenaService(loadArenaData());

    const created = service.addAnswer(newAnswer());
    expect(service.listAnswers(caseId)).toHaveLength(5);

    service.deactivateAnswer(created.answer_id);

    expect(service.listAnswers(caseId)).toHaveLength(4);
    expect(service.getSnapshot().answers.find((answer) => answer.answer_id === created.answer_id)?.status).toBe("inactive");
  });

  it("replaces the previous active answer for the same model and updates content", () => {
    const service = createArenaService(loadArenaData());

    const first = service.addAnswer(newAnswer({ model_id: "review-model", model_name: "评测模型" }));
    const second = service.addAnswer(newAnswer({ model_id: "review-model", model_name: "评测模型 v2", answer: "修订后的回答" }));
    const updated = service.updateAnswer(second.answer_id, { answer: "最终修订后的回答" });

    expect(updated.answer).toBe("最终修订后的回答");
    expect(service.listAnswers(caseId).filter((answer) => answer.model_id === "review-model")).toEqual([updated]);
    expect(service.getSnapshot().answers.find((answer) => answer.answer_id === first.answer_id)?.status).toBe("inactive");
  });
});
