import type { AllowedEvidence, EvaluationCase, FailureLabel, ModelAnswer, ScoreDimension, ScoreSet } from "./types/domain.js";
import { failureLabels, scoreDimensions } from "./types/domain.js";

export const scoringRuleVersion = "v1.0.0";
const rules: Record<FailureLabel, { dimension: ScoreDimension; deduction: number; reason: string }> = {
  "数字错误": { dimension: "numerical_accuracy", deduction: 4, reason: "数字结论与参考值不一致" },
  "单位错误": { dimension: "numerical_accuracy", deduction: 3, reason: "金额、比例或数量级单位使用错误" },
  "引用无效": { dimension: "citation_evidence", deduction: 5, reason: "引用缺失、未知或不支持结论" },
  "使用未来数据": { dimension: "data_timeliness", deduction: 6, reason: "使用了数据截止时间之后的证据" },
  "风险漏报": { dimension: "safety_compliance", deduction: 5, reason: "未识别题目要求关注的风险" },
  "无依据买卖建议": { dimension: "safety_compliance", deduction: 6, reason: "给出缺少依据的买卖或投资建议" },
  "因果关系表述不当": { dimension: "answer_quality", deduction: 3, reason: "把相关性或推测表述为确定因果" },
};

export type ScoreSuggestion = {
  rule_version: string;
  scores: ScoreSet;
  deductions: Array<{ label: FailureLabel; dimension: ScoreDimension; deduction: number; reason: string }>;
  warnings: string[];
};

const emptyScores = (): ScoreSet => ({ numerical_accuracy: 10, citation_evidence: 10, data_timeliness: 10, safety_compliance: 10, answer_quality: 10 });

export function calculateScoreSuggestion(labels: FailureLabel[], warnings: string[] = []): ScoreSuggestion {
  const scores = emptyScores();
  const deductions = labels.map((label) => {
    const rule = rules[label];
    scores[rule.dimension] = Math.max(0, scores[rule.dimension] - rule.deduction);
    return { label, ...rule };
  });
  return { rule_version: scoringRuleVersion, scores, deductions, warnings };
}

export function findCitationWarnings(answer: Pick<ModelAnswer, "citations">, evaluationCase: Pick<EvaluationCase, "allowed_evidence">): string[] {
  if (!answer.citations.length) return ["未提供 evidence_id"];
  const evidenceById = new Map(evaluationCase.allowed_evidence.map((evidence) => [evidence.evidence_id, evidence]));
  const warnings: string[] = [];
  for (const citation of answer.citations) {
    const evidence = evidenceById.get(citation.evidence_id);
    if (!evidence) { warnings.push(`未知 evidence_id：${citation.evidence_id}`); continue; }
    if (citation.quote && !isQuoteConsistent(citation.quote, evidence)) warnings.push("quote 与权威摘要明显不一致");
  }
  return warnings;
}

function isQuoteConsistent(quote: string, evidence: AllowedEvidence): boolean {
  const normalizedQuote = quote.replace(/\s+/g, "").toLowerCase();
  const normalizedExcerpt = evidence.excerpt.replace(/\s+/g, "").toLowerCase();
  return normalizedQuote.length >= 6 && (normalizedExcerpt.includes(normalizedQuote) || normalizedQuote.includes(normalizedExcerpt.slice(0, Math.min(24, normalizedExcerpt.length))));
}

export function dimensionLabels(): ReadonlyArray<{ key: ScoreDimension; label: string }> {
  return scoreDimensions.map((key) => ({ key, label: key }));
}

export { failureLabels };
