import type { FailureLabel, ReviewRecord, ScoreDimension, ScoreSet } from "./types/domain.js";

export type ModelSummary = { model_id: string; model_name: string; total_score: number | null; dimension_scores: ScoreSet; failure_label_counts: Partial<Record<FailureLabel, number>>; completed_reviews: number; total_samples: number };
export type ReportPayload = { generated_at: string; dataset_version: string; scoring_rule_version: string; completion: { completed: number; total: number }; models: ModelSummary[] };

export function summarizeModels(models: Array<{ model_id: string; model_name: string }>, activeAnswers: Array<{ model_id: string }>, reviews: ReviewRecord[]): ModelSummary[] {
  return models.map(({ model_id, model_name }) => {
    const completed = reviews.filter((review) => review.model_id === model_id && review.status === "已完成");
    const dimensionScores = {} as ScoreSet;
    for (const dimension of ["numerical_accuracy", "citation_evidence", "data_timeliness", "safety_compliance", "answer_quality"] as ScoreDimension[]) dimensionScores[dimension] = completed.length ? round(completed.reduce((sum, review) => sum + review.final_scores[dimension], 0) / completed.length) : 0;
    const failureCounts: Partial<Record<FailureLabel, number>> = {};
    for (const review of completed) for (const label of review.failure_labels) failureCounts[label] = (failureCounts[label] ?? 0) + 1;
    return { model_id, model_name, total_score: completed.length ? round(Object.values(dimensionScores).reduce((sum, score) => sum + score, 0) * 2) : null, dimension_scores: dimensionScores, failure_label_counts: failureCounts, completed_reviews: completed.length, total_samples: activeAnswers.filter((answer) => answer.model_id === model_id).length };
  });
}

export function createMarkdownReport(report: ReportPayload): string {
  const lines = [`# 金融 Agent 模型对比报告`, ``, `- 数据版本：${report.dataset_version}`, `- 评分规则版本：${report.scoring_rule_version}`, `- 评审完成度：${report.completion.completed}/${report.completion.total}`, `- 生成时间：${report.generated_at}`, ``, `| 模型 | 总分 | 数字正确性 | 引用与证据 | 数据时效性 | 安全合规 | 回答质量 | 完成数/样本数 |`, `|---|---:|---:|---:|---:|---:|---:|---:|`];
  for (const model of report.models) lines.push(`| ${model.model_name} | ${model.total_score === null ? "—" : model.total_score.toFixed(1)} | ${model.dimension_scores.numerical_accuracy.toFixed(1)} | ${model.dimension_scores.citation_evidence.toFixed(1)} | ${model.dimension_scores.data_timeliness.toFixed(1)} | ${model.dimension_scores.safety_compliance.toFixed(1)} | ${model.dimension_scores.answer_quality.toFixed(1)} | ${model.completed_reviews}/${model.total_samples} |`);
  lines.push("", "> 仅已完成的人工评审进入总分和排名；本报告基于内置模拟数据，不代表模型的普遍金融能力。", "");
  return lines.join("\n");
}

function round(value: number): number { return Math.round(value * 10) / 10; }
