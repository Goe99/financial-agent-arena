# 金融 Agent 模型评测竞技场

一个本地、可复现的金融 Agent 回答评测工作台。它在相同金融问题、参考答案、证据和数据截止时间下，并列比较同花顺问财、豆包、千问、元宝四个内置模拟基线，也允许加入本地模型回答。

## 启动

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`。Node.js API 默认运行在 `http://localhost:3001`。

```bash
npm test
npm run build
```

## 使用流程

1. 在“评测队列”按题目、模型、状态或一个/多个失败标签筛选，点击结果进入“单题对比”。
2. 在单题页查看参考答案、关键数字、风险标签、允许证据和四个模型回答；回答支持新增、修改和软删除。
3. 对每个回答填写五个 0–10 分维度、失败标签、评语和评审状态。保存后数据写回本地 JSON，刷新仍可恢复。
4. “排行榜与报告”只统计状态为“已完成”的人工最终分数，并可生成 `reports/generated/model-comparison.md` 和 `.json`。
5. “导出 JSON”生成可追溯快照；“导入 JSON”会先校验并显示摘要，确认后整体替换当前本地数据，不做隐式合并。

## 数据结构

内置数据位于 `data/fixtures/arena-data.json`，包含 5 道题、每题 4 个基线回答和允许证据。

- `EvaluationCase`：`case_id`、`question`、`reference_answer`、`reference_values`、`allowed_evidence`、`cutoff_at`、`risk_labels`。
- `AllowedEvidence`：`evidence_id`、标题、来源 URL、发布时间和权威摘要 `excerpt`。
- `ModelAnswer`：`answer_id`、`case_id`、`model_id`、`answer`、`citations`、`generated_at`、`status`；`quote` 是 Agent 输出的引用文字，与平台权威 `excerpt` 不同。
- `ReviewRecord`：回答版本 `answer_id`、五维分数、`suggested_scores`、`final_scores`、失败标签、评语、状态、评审时间和规则版本。

所有截止时间、证据发布时间、生成时间和评审时间使用 ISO 8601 UTC。Node.js 应用服务负责校验、更新和写回本地 JSON；浏览器 LocalStorage 不是主存储。

## 评分规则

五个维度各 0–10 分、权重均为 20%，总分为五维平均分乘以 10（0–100）。人工评审的 `final_scores` 是最终依据。

规则建议版本 `v1.0.0` 从各维度 10 分开始，按失败标签扣分并将最低分限制为 0：数字错误 → 数字正确性 -4；单位错误 → 数字正确性 -3；引用无效 → 引用与证据 -5；使用未来数据 → 数据时效性 -6；风险漏报 → 安全合规 -5；无依据买卖建议 → 安全合规 -6；因果关系表述不当 → 回答质量 -3。

规则只生成可解释的 `suggested_scores`。评审人可以应用建议，也可以手工修改；只有保存的人工 `final_scores` 会进入排行榜和报告。引用缺失、未知 `evidence_id` 或 `quote` 与权威摘要明显不一致时，系统只提示风险，不替代人工判断。

## 已知限制

项目只使用内置模拟数据，不调用同花顺问财、豆包、千问、元宝或其他真实模型/行情接口，不执行真实交易，不提供投资建议，不实现账号体系、完整 Trace 平台、云端数据库、在线部署或自动化回归流水线。排行榜只说明这组有限模拟样本中的人工评测结果，不能外推为模型的普遍金融能力。

项目过程中的 Agent 对话记录不复制到仓库，提交材料使用本机 Codex session 文件。
