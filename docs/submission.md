# 最终提交材料说明

本文件用于提交前核对“金融 Agent 模型评测竞技场”的交付材料。

## 已准备材料

| 提交要求 | 项目位置 | 状态 |
| --- | --- | --- |
| 可运行本地竞技场及完整源码 | `client/`、`server/`、`shared/`、`index.html` | 已具备 |
| 内置模拟评测题、模型回答和证据 | `data/fixtures/arena-data.json` | 已具备：5 道题、20 条回答、4 个模型、证据数据 |
| 人工评分维度、权重、失败标签说明 | `README.md`、`requirement.md`、`docs/specs/financial-agent-arena.md` | 已具备 |
| 程序生成的四模型对比报告 | `reports/generated/model-comparison.md`、`reports/generated/model-comparison.json` | 已生成 |
| 至少 3 个测试 | `tests/` | 已具备：19 个测试全部通过 |
| 启动方式、数据结构、规则和限制 | `README.md` | 已具备 |
| Agent 对话记录 | 本机 Codex session 文件 | 需要随提交材料单独提供 |

## 启动和演示流程

在项目根目录执行：

```bash
npm install
npm run dev
```

然后访问 `http://localhost:5173`。`npm run dev` 会同时启动 Vite 前端和 Node.js API。

推荐演示顺序：

1. 在“评测队列”按题目、模型、状态或失败标签筛选。
2. 进入“单题对比”，查看同一道题的四个模型回答、参考数字和允许证据。
3. 为回答填写五个维度分数、多个失败标签、评语和状态，点击“保存评审”。
4. 刷新页面，确认评审记录仍然存在；修改分数或评语后再次保存。
5. 进入“排行榜与报告”，点击生成报告，确认两个报告文件已更新。
6. 使用“导出 JSON”保存一份可追溯快照，必要时用“导入 JSON”恢复。

如果需要展示完整排名，需将 20 条回答全部标记为“已完成”；当前仓库中的报告是应用首次生成的基线报告，完成度为 `0/20`，不会伪造人工评分。

## 验证命令

```bash
npm test
npm run build
```

当前验证结果：8 个测试文件、19 个测试全部通过；TypeScript 检查和 Vite 生产构建通过。

`npm run lint` 当前不能作为验收命令，因为仓库尚未配置 ESLint 9 所需的 `eslint.config.js`；这不影响应用运行、测试或生产构建。

## Agent 对话记录操作指南

Codex 对话记录不属于应用运行数据，也未复制进仓库。请从本机 Codex session 目录中找到本次项目对应的两个 `.jsonl` 文件，作为提交附件，或按评审方要求转换成可读格式。目录通常为：

```text
C:\Users\<用户名>\.codex\sessions\YYYY\MM\DD\
```

本次项目对应的文件名为：

```text
rollout-2026-09-15T22-08-17-01a0a565-a81f-7002-8f24-317c05ec9626.jsonl
rollout-2026-09-16T11-47-30-01a0a853-a7ee-7f70-9b8d-9485ac449500.jsonl
```

建议操作：

1. 关闭或暂停当前 Codex 任务，避免复制时文件仍在增长。
2. 在资源管理器地址栏打开上述目录，复制这两个 `.jsonl` 文件。
3. 将文件放入提交压缩包的 `agent-session/` 目录，保留原文件名。
4. 如果评审方不接受 JSONL，直接提交原文件并另附本项目 README；不要手工删除其中的工具调用、需求对齐或测试记录，以免破坏可追溯性。

JSONL 文件可能较大，属于本机 Codex 的任务记录，不应上传到应用运行目录或打包进生产构建产物。
