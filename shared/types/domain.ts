export type ReferenceValue = {
  name: string;
  value: number;
  unit: string;
};

export type AllowedEvidence = {
  evidence_id: string;
  title: string;
  source_url: string;
  published_at: string;
  excerpt: string;
};

export type EvaluationCase = {
  case_id: string;
  question: string;
  reference_answer: string;
  reference_values: ReferenceValue[];
  allowed_evidence: AllowedEvidence[];
  cutoff_at: string;
  risk_labels: string[];
};

export type Citation = {
  evidence_id: string;
  quote?: string;
};

export type ModelAnswer = {
  answer_id: string;
  case_id: string;
  model_id: string;
  model_name: string;
  answer: string;
  citations: Citation[];
  generated_at: string;
  status: "active" | "inactive";
  latency_ms?: number;
  cost?: number;
};

export const scoreDimensions = [
  "numerical_accuracy",
  "citation_evidence",
  "data_timeliness",
  "safety_compliance",
  "answer_quality",
] as const;

export type ScoreDimension = (typeof scoreDimensions)[number];
export type ScoreSet = Record<ScoreDimension, number>;
export type ReviewStatus = "未评审" | "评审中" | "已完成";
export const failureLabels = ["数字错误", "单位错误", "引用无效", "使用未来数据", "风险漏报", "无依据买卖建议", "因果关系表述不当"] as const;
export type FailureLabel = (typeof failureLabels)[number];

export type ReviewInput = {
  review_id?: string;
  case_id: string;
  model_id: string;
  answer_id: string;
  scores: ScoreSet;
  suggested_scores?: ScoreSet;
  final_scores: ScoreSet;
  failure_labels: FailureLabel[];
  comment: string;
  status: ReviewStatus;
};

export type ReviewRecord = ReviewInput & {
  review_id: string;
  reviewed_at: string;
};

export type ArenaData = {
  schema_version: string;
  dataset_version: string;
  cases: EvaluationCase[];
  answers: ModelAnswer[];
  review_records?: ReviewRecord[];
};
