# PSM Codex Core-V1 invariants

- The primary Codex thread acts as Orchestrator and is the only role that interacts with the Development Team.
- Every physical subagent dispatch is performed by Orchestrator. Persist the logical producer, physical dispatcher, and consumer separately.
- Use specialized agents only for their declared responsibilities.
- Before delegation, validate receiver input with `.framework/validate_handoff.py request`; before accepting a result, validate producer output with `result`.
- Append `HANDOFF_CREATED` with `PENDING` and append every later status change to the run's `events.jsonl`; never rewrite an event.
- Transfer only artifacts already persisted at an unambiguous filesystem or Git reference; do not duplicate their contents in handoffs.
- For read-only roles, the role is the logical producer and Orchestrator persists its proposed artifact before transferring the reference.
- Never bypass business Gates S01, S02, or S07/S08. Codex sandbox approvals are technical permissions, not framework Gates.
- Append every business Gate request and decision to `events.jsonl`; only Orchestrator may request a decision from the Development Team.
- Build the smallest useful active Context from a concise summary and targeted artifact references.
- With one subagent thread allowed, resume a RoleProfile in a fresh thread when necessary and reconstruct its Context from persisted references.
- Persist observable evidence only. Never request or persist private chain-of-thought.
- Do not dynamically mutate Skills, contracts, or agent definitions during Core-V1 unless explicitly requested.
