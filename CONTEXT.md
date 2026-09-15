# Financial Agent Arena — Domain Context

这是一个单一领域上下文。本文只定义项目中的业务和评测概念，不记录具体实现方式。

## Glossary

### Arena

Arena 是用于对多个金融 Agent 进行同口径评测、比较和复盘的整体环境。它包含任务、数据、评分规则、运行记录和排行榜，但不等同于交易平台。

### Financial Agent

Financial Agent 是能够在金融任务中理解目标、使用允许的工具、产生分析或决策辅助结果的智能体。Agent 的模型、提示词、工具权限和运行配置共同构成一次可评测的提交。

### Evaluation Task

Evaluation Task 是一个可重复执行的评测问题，规定输入、允许的上下文、完成条件和输出要求。一个 Task 可以包含多个 Task Instance。

### Task Instance

Task Instance 是 Evaluation Task 的一次具体实例，绑定特定数据、时间截面、市场背景或情境约束。实例必须足够明确，使不同 Agent 面对的是同一个问题。

### Dataset

Dataset 是供一组 Task Instance 使用的、具有版本边界的数据集合。Dataset 的来源、时间范围、许可和变更记录属于评测结果的可追溯信息。

### Agent Submission

Agent Submission 是提交到 Arena 参加一次评测的 Agent 配置及其版本标识。它不是单独的模型名称；同一模型在不同提示词、工具或权限下属于不同提交。

### Evaluation Run

Evaluation Run 是对一个 Agent Submission 在指定 Task、Dataset 和评测配置下的一次完整执行。它产生原始输出、工具轨迹、评分结果和运行元数据。

### Evaluation Criterion

Evaluation Criterion 是衡量输出质量或风险的一个明确维度，例如事实准确性、引用完整性、推理一致性、成本、延迟或风险控制。Criterion 应尽量可观察、可解释。

### Judge

Judge 是依据 Evaluation Criterion 对 Agent 输出进行评价的机制或角色。Judge 可以是确定性规则、人工评审或模型裁判；不同 Judge 的结果不能未经说明直接混为同一分数。

### Score

Score 是 Judge 针对一个 Evaluation Run 或其子结果给出的评价值。Score 必须带有 Criterion、量表或计算规则以及必要的证据，单一总分不能替代分项结果。

### Leaderboard

Leaderboard 是按明确排序规则展示多个 Evaluation Run 或 Agent Submission 的比较视图。排行榜必须展示评测范围、数据版本、评分版本和不确定性，避免把局部结果表述成普遍能力。

### Reproducibility

Reproducibility 是在相同版本、输入、配置和外部依赖约束下，能够重新得到可比结果的能力。随机性、外部 API 变化和数据漂移都必须被记录为复现边界。

## Boundaries

- Arena 评测金融 Agent，不执行真实交易。
- Evaluation Run 记录研究与决策辅助证据，不构成投资建议。
- Leaderboard 比较已声明范围内的结果，不代表未来收益或普遍金融能力。

