import type { FailureLabel, ReviewRecord, ReviewStatus } from "./types/domain.js";

export type ReviewQueueItem = {
  case_id: string;
  model_id: string;
  answer_id: string;
  status: ReviewStatus;
  failure_labels: FailureLabel[];
  review?: ReviewRecord;
};

export type ReviewQueueFilters = {
  case_id?: string;
  model_id?: string;
  status?: ReviewStatus;
  failure_labels?: FailureLabel[];
};

export function filterReviewQueue(items: ReviewQueueItem[], filters: ReviewQueueFilters): ReviewQueueItem[] {
  return items.filter((item) => {
    if (filters.case_id && item.case_id !== filters.case_id) return false;
    if (filters.model_id && item.model_id !== filters.model_id) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.failure_labels?.length && !filters.failure_labels.some((label) => item.failure_labels.includes(label))) return false;
    return true;
  });
}
