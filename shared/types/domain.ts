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

export type ArenaData = {
  schema_version: string;
  dataset_version: string;
  cases: EvaluationCase[];
  answers: ModelAnswer[];
};

