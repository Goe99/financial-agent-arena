import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ArenaData, EvaluationCase, ModelAnswer } from "../../shared/types/domain.js";

export const defaultFixturePath = resolve(process.cwd(), "data/fixtures/arena-data.json");

export type NewModelAnswer = Omit<ModelAnswer, "answer_id" | "status">;
export type ModelAnswerPatch = Partial<NewModelAnswer>;

function assertUtcTimestamp(value: string, field: string): void {
  if (!value.endsWith("Z")) {
    throw new Error(`${field} must be an ISO 8601 UTC timestamp`);
  }
}

function validateData(data: ArenaData): ArenaData {
  if (!Array.isArray(data.cases) || data.cases.length < 5) {
    throw new Error("The fixture must contain at least five evaluation cases");
  }

  const caseIds = new Set<string>();
  for (const evaluationCase of data.cases) {
    if (!evaluationCase.case_id || caseIds.has(evaluationCase.case_id)) {
      throw new Error(`Invalid or duplicate case_id: ${evaluationCase.case_id}`);
    }
    caseIds.add(evaluationCase.case_id);
    assertUtcTimestamp(evaluationCase.cutoff_at, `${evaluationCase.case_id}.cutoff_at`);
    if (evaluationCase.allowed_evidence.length === 0) {
      throw new Error(`${evaluationCase.case_id} must contain allowed evidence`);
    }
  }

  const answerIds = new Set<string>();
  for (const answer of data.answers) {
    if (answerIds.has(answer.answer_id) || !caseIds.has(answer.case_id) || !answer.answer.trim()) {
      throw new Error(`Invalid or duplicate model answer: ${answer.answer_id}`);
    }
    if (answer.status !== "active" && answer.status !== "inactive") {
      throw new Error(`Invalid answer status: ${answer.answer_id}`);
    }
    answerIds.add(answer.answer_id);
    assertUtcTimestamp(answer.generated_at, `${answer.answer_id}.generated_at`);
  }

  return data;
}

export function loadArenaData(filePath = defaultFixturePath): ArenaData {
  const data = JSON.parse(readFileSync(filePath, "utf8")) as ArenaData;
  return validateData(data);
}

export type ArenaServiceOptions = {
  persistPath?: string;
};

export type ArenaService = {
  getSnapshot(): ArenaData;
  listCases(): EvaluationCase[];
  listAnswers(caseId: string): ModelAnswer[];
  addAnswer(input: NewModelAnswer): ModelAnswer;
  updateAnswer(answerId: string, patch: ModelAnswerPatch): ModelAnswer;
  deactivateAnswer(answerId: string): ModelAnswer;
};

export function createArenaService(data = loadArenaData(), options: ArenaServiceOptions = {}): ArenaService {
  const mutableData = structuredClone(data);
  validateData(mutableData);

  const persist = () => {
    if (options.persistPath) {
      writeFileSync(options.persistPath, `${JSON.stringify(mutableData, null, 2)}\n`, "utf8");
    }
  };

  const findAnswer = (answerId: string) => {
    const answer = mutableData.answers.find((item) => item.answer_id === answerId);
    if (!answer) throw new Error(`Unknown answer_id: ${answerId}`);
    return answer;
  };

  const deactivateOtherActiveAnswers = (modelId: string, caseId: string, exceptAnswerId?: string) => {
    for (const answer of mutableData.answers) {
      if (answer.case_id === caseId && answer.model_id === modelId && answer.answer_id !== exceptAnswerId) {
        answer.status = "inactive";
      }
    }
  };

  return {
    getSnapshot: () => structuredClone(mutableData),
    listCases: () => structuredClone(mutableData.cases),
    listAnswers: (caseId) => structuredClone(mutableData.answers.filter((answer) => answer.case_id === caseId && answer.status === "active")),
    addAnswer: (input) => {
      if (!mutableData.cases.some((evaluationCase) => evaluationCase.case_id === input.case_id)) {
        throw new Error(`Unknown case_id: ${input.case_id}`);
      }
      if (!input.answer.trim()) throw new Error("answer must not be empty");
      assertUtcTimestamp(input.generated_at, "generated_at");
      deactivateOtherActiveAnswers(input.model_id, input.case_id);
      const answer: ModelAnswer = { ...structuredClone(input), answer_id: `answer-${randomUUID()}`, status: "active" };
      mutableData.answers.push(answer);
      persist();
      return structuredClone(answer);
    },
    updateAnswer: (answerId, patch) => {
      const current = findAnswer(answerId);
      const updated: ModelAnswer = { ...current, ...structuredClone(patch), answer_id: current.answer_id, status: current.status };
      if (!updated.answer.trim()) throw new Error("answer must not be empty");
      assertUtcTimestamp(updated.generated_at, "generated_at");
      if (updated.status === "active") deactivateOtherActiveAnswers(updated.model_id, updated.case_id, answerId);
      Object.assign(current, updated);
      persist();
      return structuredClone(current);
    },
    deactivateAnswer: (answerId) => {
      const answer = findAnswer(answerId);
      answer.status = "inactive";
      persist();
      return structuredClone(answer);
    },
  };
}
