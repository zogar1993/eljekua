---
name: create-ui-component
description: >-
  Add a web UI component in eljekua. Use when creating or wiring DOM visuals,
  interaction UIs, or presentation layers in src/web/. Covers core/web
  boundaries, events, use cases, and headless playability.
---

# Create UI Component

UI lives in `src/web/`. Core owns game logic and state; web renders it and forwards player input back through core APIs.

## Architecture

```
core (headless)                    web (presentation)
─────────────────                  ────────────────────
use cases, VM, battle grid    ←──  query/read state
GameEvents.raise()          ──→  subscribe, update DOM
Interaction callbacks       ←──  user clicks / input
creature.events.raise()     ──→  subscribe, animate
```

- Core must stay **fully playable without web** (tests drive interactions headlessly).
- Core **never imports** from `web/`.
- Web **may read** core state directly.
- Web **must not mutate** core state directly — only call core functions that perform mutations.

## @allowed-web-to-core

| Action | How | Example |
|--------|-----|---------|
| Read state | Query core objects | `battle_grid.creatures`, `turn_state.get_acting_creature()` |
| Read pending input | `player_turn_handler.get_interaction()` | Check `interactions?.type` |
| Resolve player choice | Call callbacks on the interaction | `interactions.select(position)`, `option.on_click()` |
| Trigger game actions | Call use cases | `add_creature({data})`, `start_battle()`, `gameplay_use_cases.set_current_turn_to_creature({creature})` |

## @forbidden-web-to-core

- Assigning to core model fields (`creature.data.hp_current = …`, `battle_grid.board[…] = …`)
- Calling core mutators that bypass use cases/interactions when a use case exists
- Importing `web/` from `core/`

## @core-to-web

Core notifies web **only via events**:

- **`GameEvents`** (`core/events/GameEvents.ts`) — global game lifecycle and turn state
  - `on_available_interactions_changed` — show/hide option buttons, hit-status UI, grid highlights
  - `on_creature_added_to_game` — create creature visuals, wire per-creature handlers
  - `on_turn_state_*` — instruction visualizer, debug panels
- **`creature.events`** — per-creature visuals (movement, damage, targeting, attacks)

Web subscribes in the component factory; core raises from interpreters, use cases, and turn state.

```typescript
game_events.on_available_interactions_changed.add_handler((interactions) => {
    if (interactions?.type === "option_select")
        display_options(interactions.available_options)
    else
        remove_options()
})
```

Player input calls the callbacks bundled in the interaction object — core resumes the instruction loop after cleanup.

## @player-interactions

Player input is modeled as a **discriminated union** in `core/instruction_loop.ts` (`Interaction`). Each distinct selection UX gets its own interaction type — do **not** add optional fields to an existing type for edge cases.

| Interaction | `type` | When | Web handler |
|-------------|--------|------|-------------|
| `InteractionsSelectPosition` | `position_select` | Single tile / creature click | `BattleGridUI` |
| `InteractionsSelectPath` | `select_path` | Movement path preview | `BattleGridUI` |
| `InteractionsSelectArea` | `select_area` | Area burst origin + AoE preview | `BattleGridUI` |
| `InteractionsSelectOption` | `option_select` | Power / action buttons | `CreatureOptionButtons` |
| `InteractionsSelectHitStatus` | `hit_status_select` | Hit/miss/crit per target | `HitStatusButtonsUI` |

### Adding a new interaction type

1. **Define the type** in `instruction_loop.ts` and add it to the `Interaction` union.
2. **Wire cleanup** in `add_cleanup_to_interaction_confirmation` (wrap `select` / `on_confirm` / `on_click` with `add_cleanup_to_function`).
3. **Emit it** from the relevant interpreter via `player_turn_handler.set_available_interactions(...)`.
4. **Handle it in web** — subscribe in the appropriate UI module; branch on `interactions.type`.
5. **Update test helpers** in `tests/utils/interaction_test_helpers.ts` so headless tests can drive the same API.

Reference: `interpret_select_target.ts` branches on targeting type → `select_path`, `select_area`, or `position_select`.

## @file-layout

```
src/web/<feature>/
├── <Feature>UI.ts          # factory: create_<feature>_ui or initialize_<feature>_ui
├── <SubVisual>.ts          # smaller visual pieces
└── <feature>.css           # co-located styles
```

- Entry factory: `create_<name>_ui` or `initialize_<name>_ui`
- Visual factory: `create_visual_<name>` or `create_<name>_visual`
- Shared DOM helper: `web/utils/create_html_element.ts`
- Wire new components in `src/main.ts`

## @checklist

1. **Create the web module** under `src/web/<feature>/`
   - Export a `create_*` / `initialize_*` factory
   - Accept `game_events` and any core handles needed for reads (`battle_grid`, `turn_state`, `player_turn_handler`)
   - Keep DOM manipulation inside the web module

2. **Subscribe to core events** to drive rendering
   - Prefer `GameEvents` for global UI state
   - Prefer `creature.events` (wired from `on_creature_added_to_game`) for per-creature animations
   - Clean up visuals when interaction/event state clears

3. **Forward user input through core APIs**
   - Interaction UIs: call `interactions.select(...)`, `option.on_click()`, `on_confirm()`, etc.
   - Setup / cheats / dev tools: call use cases (`create_add_creature_to_game`, `create_start_battle`, `create_gameplay_use_cases`)

4. **Wire in `main.ts`**
   ```typescript
   create_my_feature_ui({game_events, battle_grid, player_turn_handler})
   ```

5. **Verify headless playability**
   - No new logic that requires DOM to advance the game
   - Tests can drive the same interactions via `tests/utils/interaction_test_helpers.ts`
   - Tests import only from `core/` and `tests/` — never `web/`

## @reference-implementations

| Component | File | Pattern |
|-----------|------|---------|
| Interaction-driven buttons | `web/creature_option_buttons/CreatureOptionButtons.ts` | `on_available_interactions_changed` → render → `on_click` |
| Hit status picker | `web/hit_status_buttons/HitStatusButtonsUI.ts` | interaction callbacks for input |
| Grid selection | `web/battle_grid/BattleGridUI.ts` | read core + `get_interaction()` + `select()` |
| Area burst selection | `web/battle_grid/BattleGridUI.ts` | `select_area` interaction + `get_area_for_position` preview |
| Turn-state debug | `web/instruction_visualizer/instruction_visualizer.ts` | multiple `on_turn_state_*` events |
| Creature sprite | `web/creature/CreatureVisual.ts` | pure visual; wired from `main.ts` via `creature.events` |
| Headless test driver | `tests/utils/interaction_test_helpers.ts` | same interaction API without DOM |

## @conventions

Follow `eljekua-conventions` for naming and formatting. Additional UI rules:

- Visual return types: `export type FooVisual = ReturnType<typeof create_visual_foo>`
- CSS class names: `block__element` BEM-style (e.g. `creature__lifebar`)
- Use `AnimationQueue` when animations must complete before core continues
- Comments only for non-obvious presentation logic
