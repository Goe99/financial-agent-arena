import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ArenaData, EvaluationCase, ModelAnswer } from "../../shared/types/domain.js";

const defaultFixturePath = resolve(process.cwd(), "data/fixtures/arena-data.json");

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

  const activeAnswerCount = new Map<string, number>();
  for (const answer of data.answers) {
    if (!caseIds.has(answer.case_id) || !answer.answer.trim()) {
      throw new Error(`Invalid model answer: ${answer.answer_id}`);
    }
    assertUtcTimestamp(answer.generated_at, `${answer.answer_id}.generated_at`);
    if (answer.status === "active") {
      activeAnswerCount.set(answer.case_id, (activeAnswerCount.get(answer.case_id) ?? 0) + 1);
    }
  }

  for (const evaluationCase of data.cases) {
    if ((activeAnswerCount.get(evaluationCase.case_id) ?? 0) !== 4) {
      throw new Error(`${evaluationCase.case_id} must contain four active model answers`);
    }
  }

  return data;
}

export function loadArenaData(filePath = defaultFixturePath): ArenaData {
  const data = JSON.parse(readFileSync(filePath, "utf8")) as ArenaData;
  return validateData(data);
}

export type ArenaService = {
  getSnapshot(): ArenaData;
  listCases(): EvaluationCase[];
  listAnswers(caseId: string): ModelAnswer[];
};

export function createArenaService(data = loadArenaData()): ArenaService {
  validateData(data);

  return {
    getSnapshot: () => data,
    listCases: () => data.cases,
    listAnswers: (caseId) => data.answers.filter((answer) => answer.case_id === caseId && answer.status === "active"),
  };
}

