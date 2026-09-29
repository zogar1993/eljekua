---
name: create-test
description: >-
  Add or update tests in eljekua. Use when creating algorithm or use case tests.
  Covers granularity, abstracting irrelevant details, thoroughness, minimal setup,
  and avoiding redundancy.
---

# Create Test

Guidelines for all tests — algorithm and use case alike.

## @when-required

- Follow this skill when the user asks for tests.
- **`create-spec` always requires tests** when you add or modify a spec — do not skip them.
- Tests for spec work go in `src/tests/use_cases/` only. Do **not** add algorithm tests under `src/tests/algorithms/` for spec changes.

## @structure

- One subject per file, named after what is under test.
- Group related files in folders when it helps navigation.
- **Algorithm tests** isolate a single function, evaluator, or computation.
- **Use case tests** exercise a player-visible scenario or game rule end-to-end.
- Do not test content data or monster-specific abilities — test the behavior.

## @granularity

- One scenario per test — one behavior, one assertion when reasonable.
- Do not combine unrelated outcomes in a single test (e.g. allies and enemies in one `test`).
- Split happy paths, edge cases, and errors into separate tests.
- Reuse setup across tests only when each test still stands alone.

## @focus

- Include only details that matter to the scenario under test.
- Abstract irrelevant values into named constants (e.g. a shared list of positions used only to keep creatures distinct).
- Use semantically named constants when a value **is** part of the scenario (e.g. an isolated position with no neighbors).
- Do not hardcode incidental values inline when a named constant communicates intent better.

## @thoroughness

Cover every category the subject can reach:

| Category | What to verify |
|----------|----------------|
| Happy path | Primary correct outcome |
| Edge cases | Empty inputs, zero counts, null or absent data, isolation, boundaries |
| Errors | Invalid arguments, wrong counts, type mismatches, missing prerequisites |

Assert failures explicitly — do not only test success paths.

Skip a category only when the subject cannot reach that case.

When a failure can occur at different stages (e.g. validation before execution), test the stage that actually applies — do not mislabel one kind of failure as another.

## @no-redundancy

- Do not repeat the same assertion in multiple files.
- Test the subject directly; do not rely on another test file as the only coverage.
- Using minimal plumbing to reach the subject is fine when it keeps setup short.

## @minimal-setup

- Create only state the test needs.
- Reuse existing test helpers and fixtures — do not duplicate wiring.
- Short names; every setup step should support an assertion.
- Remove decorative setup and unused bindings.

## @readability

- Test names state the single behavior under test.
- Local helpers are fine when they shorten repetition without hiding intent.
- Keep inputs as small as possible while remaining valid.

## @workflow

1. Read the subject under test; list happy path, edges, and errors.
2. Check existing tests — extend or split; do not duplicate.
3. Write one scenario per test; abstract irrelevant details.
4. Run the affected test files.
5. Run `@checklist` (`git add` new files).
