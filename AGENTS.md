# PSM Codex Core-V1 invariants

- The primary Codex thread acts as Orchestrator and is the only role that interacts with the Development Team.
- Every physical subagent dispatch is performed by Orchestrator. Persist the logical producer, physical dispatcher, and consumer separately.
- Use specialized agents only for their declared responsibilities.
- Run every application build, runtime, test, and supporting service through Docker Desktop using versioned container configuration. Do not install application dependencies or run application commands directly on the host; host execution is limited to the Codex control plane, Git, the Docker client, and framework utilities such as `validate_handoff.py`.
- Before delegation, validate receiver input with `.framework/validate_handoff.py request`; before accepting a result, validate producer output with `result`.
- Append `HANDOFF_CREATED` with `PENDING` and append every later status change to the run's `events.jsonl`; never rewrite an event.
- Transfer only artifacts already persisted at an unambiguous filesystem or Git reference; do not duplicate their contents in handoffs.
- For read-only roles, the role is the logical producer and Orchestrator persists its proposed artifact before transferring the reference.
- Never bypass business Gates S01, S02, or S07/S08. Codex sandbox approvals are technical permissions, not framework Gates.
- Append every business Gate request and decision to `events.jsonl`; only Orchestrator may request a decision from the Development Team.
- Treat an explicit request to start or resume a run with a run ID, feature ID, and business intent as an instruction to execute the Core-V1 sequence documented in `README.md`.
- On run start or resume, reconstruct state from `events.jsonl` and referenced artifacts, then repeatedly validate, persist, and dispatch the next specialized role. A new run starts with Decomposer unless persisted evidence proves that step is complete.
- Continue autonomously within the same turn until the next human Gate, `REQUEST_INFO`, required technical approval, unrecoverable failure, or workflow completion; do not stop merely after recording an intermediate event or artifact.
- At S01, S02, and S07/S08, append `GATE_REQUESTED` and stop. After an explicit approval or rejection, append the decision and continue or route feedback according to the Core-V1 sequence; never infer a Gate decision from silence.
- Build the smallest useful active Context from a concise summary and targeted artifact references.
- With one subagent thread allowed, resume a RoleProfile in a fresh thread when necessary and reconstruct its Context from persisted references.
- Persist observable evidence only. Never request or persist private chain-of-thought.
- Do not dynamically mutate Skills, contracts, or agent definitions during Core-V1 unless explicitly requested.
