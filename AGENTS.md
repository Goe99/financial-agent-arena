# Agent Instructions

## Working agreement

- 开始任务前阅读 `requirement.md`、`CONTEXT.md`，以及与当前任务相关的 `docs/adr/`。
- 需求、研究和实现任务使用 GitHub Issues；不要把未追踪的工作只留在聊天记录中。
- 优先做小而可验证的改动。新增行为先写测试；修复问题时保留回归测试。
- 每次改动后运行与改动相关的检查，并在交付时说明验证结果。
- 领域术语以 `CONTEXT.md` 为准。新增或修正术语时同步更新该文件。
- 评测结果必须能追溯到题目、数据、Agent、模型、工具和评分规则的版本。
- 仅使用公开、合成或已脱敏数据；凭据、个人信息和未公开数据不得进入仓库、日志或测试快照。
- 默认只做离线评测和决策辅助；不执行真实交易，也不把评测结果表述为投资建议。

## Repository shape

- React client: `client/`
- Node.js server: `server/`
- Shared TypeScript types and schemas: `shared/`
- Built-in fixture data: `data/fixtures/`
- Tests: `tests/`
- Generated reports: `reports/generated/`
- Domain glossary: `CONTEXT.md`
- Architecture decisions: `docs/adr/`
- Agent-consumed setup: `docs/agents/`

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues and are managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Use `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository with one root `CONTEXT.md` and shared ADRs under `docs/adr/`. See `docs/agents/domain.md`.

