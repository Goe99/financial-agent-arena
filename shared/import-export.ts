import type { ArenaData, ReviewRecord } from "./types/domain.js";

export type ExportSnapshot = ArenaData & { review_records: ReviewRecord[]; scoring_rules: { version: string }; exported_at: string };
export type ImportSummary = { cases: number; answers: number; reviews: number };
export function makeImportSummary(data: Pick<ArenaData, "cases" | "answers" | "review_records">): ImportSummary { return { cases: data.cases.length, answers: data.answers.length, reviews: data.review_records?.length ?? 0 }; }
