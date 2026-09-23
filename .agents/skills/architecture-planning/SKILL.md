---
name: architecture-planning
description: Produce an executable TechnicalPlan from an approved Specification and targeted SystemMap evidence without implementing code.
---

# Architecture Planning

Read only the necessary parts of the referenced Specification, TaskList, SystemMap, and Codebase. Confirm that S01 is approved before planning.

Identify constraints, affected components and files, interfaces, data/control flow, dependencies, migration or compatibility concerns, verification approach, risks, and unresolved decisions. Prefer existing project patterns and the smallest design that satisfies the Specification.

Produce a concise `specs/<feature-id>/technical-plan.md` proposal with ordered implementation steps and explicit artifact references. Distinguish evidence from assumptions. Do not implement code or expand the approved scope.
