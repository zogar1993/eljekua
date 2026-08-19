---
name: create-skill
description: >-
  Author or edit Cursor Agent Skills (SKILL.md). Use when creating, modifying,
  or reviewing skills — structure, frontmatter, wording, and redundancy checks.
---

# Create / Modify Skill

Read this before writing or editing any `SKILL.md`. Follow `@git` when adding skill files to the repo.

## @principles

Every line must earn its place:

- **Succinct** — bullets over paragraphs; omit what a capable agent already knows.
- **Unambiguous** — one term per concept; imperative verbs; every rule has a single default action.
- **Non-redundant** — each rule appears once. Policy in one section; executable verification in the checklist only.

## @structure

```
skill-name/
└── SKILL.md    # required
```

Add `reference.md`, `examples.md`, or `scripts/` only when the main file would exceed ~100 lines.

### Frontmatter

```yaml
---
name: skill-name       # lowercase, hyphens, max 64 chars
description: >-        # third person; WHAT + WHEN (include trigger terms)
  ...
---
```

### Body

| Section | Use for |
|---------|---------|
| Policy / principles | Timeless rules |
| Workflow | Ordered steps when sequence matters |
| Checklist | Final pass before finishing — verifications not stated elsewhere |

Never repeat a workflow step in the checklist.

## @workflow

1. **Scope** — one skill, one job; split if triggers or audiences differ.
2. **Description first** — drives discovery; must include trigger terms.
3. **Draft minimum** — only sections the task needs.
4. **De-duplicate** — merge overlapping bullets; delete checklist items that restate workflow steps.
5. **Verify** — body under 500 lines; consistent terminology; `/` paths not `\`.

## @anti-patterns

- Same instruction in a numbered workflow **and** a checklist item
- Generic tutorials (basic git, language syntax)
- Vague descriptions ("helps with code")
- Optional fields described as both forbidden and allowed in different sections

## @editing

- Match existing section style in that skill (`@`-tags, headings).
- Prefer tightening over adding; if you add a rule, merge or remove something nearby.
- User-supplied wording: keep **verbatim** — do not paraphrase.
