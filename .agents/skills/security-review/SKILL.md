---
name: security-review
description: Review an approved ChangeSet against its Specification and verification evidence, producing a SecurityReport without applying fixes.
---

# Security Review

Read the referenced Specification and ChangeSet, then inspect only the necessary Codebase areas, TestSuite, and ExecutionTrace. Check trust boundaries, input handling, authorization, secrets, data exposure, injection, dependency implications, unsafe defaults, error behavior, and relevant abuse cases in proportion to the change.

For each finding, provide severity, affected reference, evidence, impact, and a concrete mitigation. Explicitly state whether any critical risk remains unmitigated and distinguish verified facts from assumptions or missing evidence.

Produce a concise `specs/<feature-id>/security-report.md` proposal. Do not apply corrections directly. Return findings through PROVIDE_FEEDBACK; route any required human decision to Orchestrator as ESCALATE.
