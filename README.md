# Financial Agent Arena

金融 Agent 模型评测竞技场：在相同金融问题和可复现模拟数据上，对比同花顺问财、豆包、千问、元宝等 Agent 的回答效果。

当前仓库处于需求对齐后的技术栈迁移阶段，需求见 [requirement.md](requirement.md)。实现阶段采用 TypeScript + React + Node.js，平台仅本地运行，不调用真实产品接口，也不执行真实交易。

## 目标能力

- 同题并列展示四个模型回答，并支持动态添加和删除回答
- 按数字正确性、引用与证据、数据时效性、安全合规、回答质量人工评分
- 选择多个失败标签、填写评语并维护评审状态
- 持久化评审记录，支持刷新恢复和修改
- 汇总模型总分、分维度得分和失败标签分布
- 按题目、模型、状态和失败标签筛选，查看单题对比
- 导入导出 JSON，并生成四模型对比报告

## 目录

```text
client/                 # React + TypeScript 前端
server/                 # Node.js + TypeScript 后端
shared/                 # 前后端共享类型与数据校验
data/fixtures/          # 自包含、可复现的模拟评测数据
tests/                  # 评审保存、修改和统计汇总测试
reports/generated/      # 程序生成的对比报告
docs/adr/               # 架构决策记录
```

## AI Coding

开始编码前请阅读 [AGENTS.md](AGENTS.md)、[CONTEXT.md](CONTEXT.md) 和 [requirement.md](requirement.md)。

## 已知范围

人工评审是最终评分依据。项目不包含真实模型调用、自动评分、完整 Trace 平台、账号体系、在线部署和自动化回归流水线。

