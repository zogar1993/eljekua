# Visual Tests — Specification

This document describes what visual tests are, what they must cover, and the rules we follow when creating and maintaining them. It is written for anyone defining or reviewing tests, without assuming technical background.

---

## What visual tests are for

Visual tests are **recorded battle scenarios**. Each test sets up a small fight on the board, walks through a series of player actions, and checks that the game ends up in the right state at important moments.

They answer questions like:

- After the player moves, is the creature standing where it should be?
- After an attack, did the target lose the right amount of health?

Visual tests are **not** about comparing screenshots or judging colors and fonts. They verify **what happened in the game** after the player (or the automated replay) takes action.

---

## What we expect from every visual test

Every visual test must:

1. **Have one clear purpose.** One scenario, one thing being proven. Do not combine unrelated checks in a single test.
2. **Be replayable without a person.** Once recorded, anyone (or an automated run) should be able to press replay and get a pass or fail with no manual steps.
3. **Use only the setup needed.** Include the fewest creatures, powers, and board positions required to demonstrate the behavior.
4. **Check outcomes at the right moments.** After something meaningful changes—movement, damage, and similar—add an expectation with the values you expect, not whatever happens to be on screen at that moment.
5. **Use clear, descriptive names.** A reader should understand what the test proves from the name alone.

---

## How a visual test is structured

Each test has two main parts.

### Part 1 — Level setup (before the battle starts)

This is the starting scene:

- Which creatures are on the board
- Where each one stands
- Their health, team, size, and other relevant details
- Any special abilities assigned to them for this test

Level setup is fixed. It does not change when the test runs. Think of it as “the opening frame of the scene.”

**Rules for level setup:**

- Place creatures only where the scenario requires. Do not clutter the board.
- Give creatures **distinct names** so expectations and steps can refer to them unambiguously (for example, “Attacker” and “Target”, not two creatures both named “Goblin”).
- If a test needs custom abilities, define them for that test’s folder rather than relying on unrelated game content.

### Part 2 — Steps (during the battle)

Once the battle starts, everything the player does is recorded as a step: choosing an action, picking a target, selecting a path to move, confirming hit or miss, and so on.

Steps run **in order**. The replay performs them one after another, the same way they were recorded.

**Rules for steps:**

- Record steps in the order a real player would take them. Do not skip required choices.
- If the test needs a specific creature to act first, make sure that creature’s turn is set before their actions.
- Do not record steps before the battle has started. Setup belongs in level setup, not in steps.

---

## Expectations

Expectations are the **pass/fail criteria** of a visual test. Each expectation says what the game **should** look like at that point in the scenario.

During replay, the test compares the live game against those declared values. The expectation passes only if they match.

### What you define yourself

You **choose the expected values**. An expectation is not a snapshot of whatever happened to be true when you clicked a button. You decide:

- **Which creature** the expectation applies to — by clicking that creature on the battle grid
- **Which board square** that creature should occupy — by clicking that square on the battle grid
- **How much health** that creature should have left — by typing the number after selecting the creature

Write down the outcome the scenario is supposed to produce. If the game shows something different during replay, the test fails.

This matters because the point of a test is to prove intended behavior—not to lock in accidental results.

### How to add an expectation

After the battle has started:

1. Click **Add expectation**.
2. Choose the type: **Position** or **Health**.
3. Follow the prompts:
   - **Position** — click the creature on the grid, then click the square where that creature should be.
   - **Health** — click the creature on the grid, then type the expected health amount and confirm.
4. The expectation is added to the test steps. Use **Cancel** at any time to stop without adding one.

The battle grid highlights clickable squares while you are selecting a creature or position. For health, only the number is typed; the creature is still chosen on the grid.

### Expectation types we use today

| Expectation | What you set | What it verifies |
|---|---|---|
| **Creature position** | Creature and board square, chosen on the grid | That creature is standing on that square. |
| **Creature health** | Creature chosen on the grid, health typed in | That creature has exactly that much health remaining. |

Other kinds of expectations may be added later. For now, position and health are the only ones we rely on.

### Rules for expectations

- Add an expectation **after** the action that should cause the outcome—not before.
- **Choose values deliberately.** For position, click the square the creature should end up on—not merely where it happens to stand now unless that is what you intend to prove. For health, type the amount the rules imply.
- One expectation checks **one creature and one value** (one position or one health total). If several creatures move or take damage, add a separate expectation for each.
- A test with actions but **no** expectations does not prove anything. Every test must include at least one expectation.
- If an expectation fails during replay, either the game is wrong or the expected value you wrote down is wrong. Fix one or the other—do not ignore a failing test.

---

## Test organization and naming

Tests are organized in **folders by topic**, with one test file per scenario.

**Naming rules:**

- Use plain, lowercase words separated by underscores.
- Group related tests under a folder name that describes the area (for example, movement, combat, targeting).
- The full name should read like a short sentence about what is being tested.

**Good examples:**

- `movement/walk_to_adjacent_square`
- `combat/basic_melee_hit_reduces_hp`
- `targeting/cannot_target_out_of_range`

**Poor examples:**

- `test1` — does not say what is being tested
- `everything_combat_and_movement` — too many concerns in one name
- `FixBugFromMarch` — describes a ticket, not player-visible behavior

**Powers for a test folder:**

When a test needs custom abilities, they belong to the **folder** that contains those tests, not to the whole game. All tests in the same folder may share that folder’s abilities. Keep abilities minimal and named for what they do in the scenario.

---

## Recording workflow

This is the intended way to create a test:

1. **Create a new test** with a proper name and folder.
2. **Add creatures** to the board and configure them for the scenario.
3. **Add test abilities** if the scenario needs powers that do not already exist for that folder.
4. **Start the battle.** Recording of steps begins here.
5. **Play through the scenario** as a player would: select actions, targets, paths, and confirmations.
6. **Add expectations** at each moment where something important should have changed. Use **Add expectation**, pick the type, then click on the grid (and type health when asked).
7. **Run visual replay** and confirm the result is **passed**. If it fails, check whether the game is wrong or your expected values need adjusting.
8. **Save** the test. It should remain passing on future replays unless the game is deliberately changed.

If replay fails, read the failure message: it indicates which step did not match. Either the game has a bug, or the test needs to be corrected to match updated requirements.

---

## Deterministic combat

During visual testing, attack outcomes are **not random**. Hits, misses, and critical hits are chosen explicitly when recording (via the hit/miss/crit selection). This keeps tests stable and replayable.

**Rules:**

- Do not design tests that depend on luck or repeated rerolls.
- When recording an attack step, choose the intended outcome (hit, miss, or crit) as part of the scenario.
- Expectations for health should reflect the damage (or healing) implied by the chosen outcome.

---

## What visual tests should cover

Add or update visual tests when:

- A **new player interaction** is introduced (new way to select targets, paths, areas, or options).
- A **combat or movement rule** changes player-visible behavior.
- A **bug fix** addressed behavior that could break again without notice.
- **Movement** places a creature somewhere that should be verified on the board.
- **Damage or healing** changes a creature’s health in a way that should be verified.

Each test should focus on **player-visible behavior**—what someone playing the game would see and experience.

---

## What visual tests should not cover

Do not use visual tests for:

- **Pure layout or styling** (colors, spacing, fonts, animations). Those belong to separate design or screenshot processes if needed.
- **Internal logic with no board interaction** (calculations that never surface in a battle scenario).
- **Performance or load testing.**
- **Multiple unrelated features in one scenario.** Split them into separate tests.
- **Scenarios that require manual judgment during replay** (for example, “look at the screen and decide if it feels right”).

---

## Pass and fail

| Result | Meaning |
|---|---|
| **Passed** | Every expectation in the test matched the game state during replay. |
| **Failed** | At least one expectation did not match, or a step could not be completed. The failure identifies the step number and a short explanation. |

A test is **not done** until replay passes. Saving a test that fails replay is only acceptable temporarily while work is in progress—not as a finished deliverable.

---

## Maintaining tests over time

When game behavior **intentionally** changes:

1. Decide whether the old test still describes valid behavior.
2. If yes, update the expected positions and health values (and steps if needed) so replay passes again.
3. If the behavior is replaced by something new, add a new test for the new behavior rather than overloading an old one beyond recognition.
4. Remove or rewrite tests that no longer apply. Do not leave obsolete scenarios that always fail.

When fixing a bug:

1. Add a visual test that **would have failed before the fix** and **passes after**, if the bug was player-visible on the board.
2. Keep that test focused on the regression only.

---

## Quality checklist (before considering a test complete)

Use this list when reviewing a test:

- [ ] The name and folder clearly state what behavior is being tested.
- [ ] Level setup contains only what the scenario needs.
- [ ] Every creature has a unique, meaningful name.
- [ ] Custom abilities are defined at the folder level when needed.
- [ ] Steps reflect a realistic player sequence after battle start.
- [ ] At least one expectation exists, with creatures and positions chosen on the grid and health typed in where needed—not added without thinking about the intended outcome.
- [ ] Each expectation names the correct creature and states the value the scenario is meant to prove.
- [ ] Visual replay reports **passed**.
- [ ] The test does not depend on random dice outcomes.
- [ ] The test does not mix unrelated features.

---

## Summary for agents and implementers

When working on visual tests, treat this document as the source of **intent**:

- **One test = one behavior**, minimal setup, explicit expectations with grid-selected creatures and positions and typed health values.
- **Record after battle start; setup before battle start.**
- **Replay must pass** before the test is considered complete.
- **Names and folders** should be understandable to someone who has not read the code.
- Prefer **updating or adding focused tests** over broad “kitchen sink” scenarios.

If implementation details are needed (file locations, step types, or APIs), refer to the visual test tooling in the repository alongside this specification. This document defines **what** good tests look like; the codebase defines **how** they are stored and executed.
