---
name: codebase-exploration
description: Map the repository areas relevant to a delegated scope and produce a concise SystemMap without changing production code.
---

# Codebase Exploration

Start from the delegated scope and referenced Specification. Use targeted search and focused reads; do not scan the entire repository unless the scope genuinely requires it.

Trace relevant structure, entry points, components, dependencies, interfaces, tests, configuration, and execution paths. Cite real repository paths and symbols. Separate observed facts from uncertainty and note any targeted follow-up needed.

Produce a concise `specs/<feature-id>/system-map.md` proposal useful for architecture planning. Do not modify production code or propose an implementation beyond evidence needed to describe the current system.
