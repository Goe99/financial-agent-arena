import { useEffect, useState } from "react";
import type { ArenaData, ModelAnswer } from "../../shared/types/domain.js";

export function App() {
  const [data, setData] = useState<ArenaData | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/arena")
      .then(async (response) => {
        if (!response.ok) throw new Error(`加载评测数据失败：${response.status}`);
        return (await response.json()) as ArenaData;
      })
      .then((arenaData) => {
        setData(arenaData);
        setSelectedCaseId(arenaData.cases[0]?.case_id ?? null);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "加载评测数据失败"));
  }, []);

  if (error) return <main className="shell"><p className="error">{error}</p><p>请先启动 Node.js API 服务。</p></main>;
  if (!data) return <main className="shell"><p>正在加载评测数据……</p></main>;

  const selectedCase = data.cases.find((item) => item.case_id === selectedCaseId) ?? data.cases[0];
  const answers = data.answers.filter((answer) => answer.case_id === selectedCase.case_id && answer.status === "active");

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">FINANCIAL AGENT ARENA · {data.dataset_version}</p>
        <h1>金融 Agent 评测竞技场</h1>
        <p>在统一题目、证据与数据截止时间下，浏览可复现的模型回答。</p>
      </header>
      <section className="workspace">
        <aside className="case-list">
          <h2>评测题</h2>
          {data.cases.map((evaluationCase) => (
            <button
              className={evaluationCase.case_id === selectedCase.case_id ? "case-button active" : "case-button"}
              key={evaluationCase.case_id}
              onClick={() => setSelectedCaseId(evaluationCase.case_id)}
            >
              <strong>{evaluationCase.case_id}</strong>
              <span>{evaluationCase.question}</span>
            </button>
          ))}
        </aside>
        <section className="case-detail">
          <div className="case-heading">
            <div>
              <p className="eyebrow">{selectedCase.case_id}</p>
              <h2>{selectedCase.question}</h2>
            </div>
            <span className="cutoff">数据截止 {selectedCase.cutoff_at}</span>
          </div>
          <div className="reference-card">
            <h3>参考答案</h3>
            <p>{selectedCase.reference_answer}</p>
            <div className="value-list">
              {selectedCase.reference_values.map((value) => <span key={value.name}>{value.name}：{value.value}{value.unit}</span>)}
            </div>
          </div>
          <div className="answer-grid">
            {answers.map((answer) => <AnswerCard answer={answer} key={answer.answer_id} />)}
          </div>
        </section>
      </section>
    </main>
  );
}

function AnswerCard({ answer }: { answer: ModelAnswer }) {
  return (
    <article className="answer-card">
      <div className="answer-header"><h3>{answer.model_name}</h3><span>{answer.generated_at}</span></div>
      <p>{answer.answer}</p>
      <div className="citation-list">{answer.citations.map((citation) => <span key={citation.evidence_id}>证据：{citation.evidence_id}</span>)}</div>
    </article>
  );
}
