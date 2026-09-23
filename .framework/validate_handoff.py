"""Validate Core-V1 handoff artifact types against the logical contracts."""

from __future__ import annotations

import argparse
import sys
import tomllib
from pathlib import Path


CONTRACTS_PATH = Path(__file__).with_name("contracts.toml")


def role_key(value: str) -> str:
    return value.strip().lower().replace("-", "_")


def artifact(value: str) -> tuple[str, str]:
    artifact_type, separator, reference = value.partition("=")
    artifact_type = artifact_type.strip()
    reference = reference.strip()
    if not separator or not artifact_type or not reference:
        raise argparse.ArgumentTypeError("artifact must use ArtifactSubtype=reference")
    return artifact_type, reference


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(
        description="Validate Core-V1 request and result handoffs."
    )
    commands = root.add_subparsers(dest="operation", required=True)

    request = commands.add_parser("request", help="validate receiver input allowlist")
    request.add_argument("--sender", required=True)
    request.add_argument("--receiver", required=True)
    request.add_argument("--intent", required=True)
    request.add_argument("--artifact", action="append", default=[], type=artifact)

    result = commands.add_parser("result", help="validate producer output allowlist")
    result.add_argument("--producer", required=True)
    result.add_argument("--intent", default="PROVIDE_RESULT")
    result.add_argument("--artifact", action="append", default=[], type=artifact)
    return root


def fail(message: str) -> int:
    print(f"INVALID: {message}", file=sys.stderr)
    return 2


def main() -> int:
    args = parser().parse_args()
    with CONTRACTS_PATH.open("rb") as stream:
        contracts = tomllib.load(stream)

    enums = contracts["enums"]
    if args.intent not in enums["handoff_intents"]:
        return fail(f"unknown HandoffIntent {args.intent!r}")

    artifacts = args.artifact
    known_types = set(enums["artifact_subtypes"])
    unknown = sorted({kind for kind, _ in artifacts} - known_types)
    if unknown:
        return fail(f"unknown ArtifactSubtype(s): {', '.join(unknown)}")

    contracts_by_role = contracts["io_contracts"]
    known_roles = set(contracts_by_role) | {"orchestrator"}
    if args.operation == "request":
        sender = role_key(args.sender)
        if sender not in known_roles:
            return fail(f"unknown logical sender role {args.sender!r}")
        key = role_key(args.receiver)
        if key not in contracts_by_role:
            return fail(f"unknown receiver role {args.receiver!r}")
        allowed = set(contracts_by_role[key]["input"])
        direction = "input"
        role = args.receiver
    else:
        key = role_key(args.producer)
        if key not in contracts_by_role:
            return fail(f"unknown producer role {args.producer!r}")
        allowed = set(contracts_by_role[key]["output"])
        direction = "output"
        role = args.producer

    denied = sorted({kind for kind, _ in artifacts} - allowed)
    if denied:
        return fail(
            f"{role} {direction} disallows {', '.join(denied)} "
            f"for intent {args.intent}"
        )

    print(f"VALID: {args.operation} handoff ({len(artifacts)} artifact(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
