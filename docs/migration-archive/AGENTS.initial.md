# Agent Instructions

## Working agreement

- 先阅读 `CONTEXT.md`，再阅读与当前任务相关的 `docs/adr/`。
- 需求、研究和实现任务使用 GitHub Issues；不要把未追踪的工作只留在聊天记录中。
- 优先做小而可验证的改动。新增行为先写测试，再实现；修复问题时保留回归测试。
- 每次改动后运行与改动相关的测试，并在交付前说明未运行的检查。
- 领域术语以 `CONTEXT.md` 为准。新增或修正术语时，同步更新该文件。
- 任何评测结果都必须能追溯到任务、数据、Agent、模型、工具和评分规则的版本。
- 使用公开、合成或已脱敏的数据。凭据、个人信息和未公开数据不得进入仓库、日志或测试快照。
- 默认只做离线评测和决策辅助；涉及真实交易、真实账户或金融建议的行为必须先停下并要求明确授权与安全设计。

## Repository shape

- Python package: `src/financial_agent_arena/`
- Tests: `tests/`
- Domain glossary: `CONTEXT.md`
- Architecture decisions: `docs/adr/`
- Agent-consumed setup: `docs/agents/`

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues and are managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository with one root `CONTEXT.md` and shared ADRs under `docs/adr/`. See `docs/agents/domain.md`.

