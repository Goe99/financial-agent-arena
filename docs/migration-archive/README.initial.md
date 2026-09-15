# Financial Agent Arena

金融 Agent 模型评测竞技场：用可复现、可解释、风险敏感的评测协议，比较不同金融 Agent 在研究、分析与决策辅助任务上的能力。

## 项目目标

本项目面向金融 Agent 的模型评测，而不是实盘交易系统。核心目标是让一次评测能够被复现、审计和公平比较：

- 统一任务与数据集定义
- 记录 Agent、模型、工具和提示词版本
- 支持规则评分与模型裁判评分，并保留评分依据
- 同时观察质量、成本、延迟、引用完整性和风险控制
- 用排行榜与实验记录沉淀可复用结论

## MVP 范围

1. 评测任务格式与样例数据
2. Agent 提交协议
3. 可重复执行的评测运行器
4. 基础评分器和结果报告
5. 本地排行榜数据模型

## 预期目录

```text
src/financial_agent_arena/  # 核心领域模型与评测运行器
tests/                      # 单元测试与集成测试
data/                       # 仅存放公开或合成数据；原始数据不入库
docs/                       # 设计文档与 ADR
.scratch/                   # GitHub Issues 对应的规格与过程材料
```

## 开发

项目使用 Python 3.12+。安装开发依赖后运行：

```powershell
python -m pip install -e ".[dev]"
python -m pytest
```

## 安全边界

仓库不得提交 API key、账户凭据、未公开行情数据或真实客户信息。除非明确设计并审核，评测结果只用于研究和决策辅助，不构成投资建议，也不执行真实交易。

## AI Coding

开始编码前请阅读 [AGENTS.md](AGENTS.md) 和 [CONTEXT.md](CONTEXT.md)。项目约定、Issue tracker 和 triage 规则分别记录在 `docs/agents/` 中。

