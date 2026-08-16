---
name: create-ui-component
description: >-
  Add a web UI component in eljekua. Use when creating or wiring DOM visuals,
  interaction UIs, or presentation layers in src/web/.
---

# Create UI Component

Read `eljekua-conventions` before starting.

Follow `eljekua-conventions` for naming and `@core-web` / `@player-interactions` boundaries.

## @checklist

1. Create `src/web/<feature>/` with a `create_*_ui` or `initialize_*_ui` factory.
2. Subscribe to `GameEvents` to drive rendering.
3. Forward input via interaction callbacks (`select`, `on_click`, `on_confirm`) or use cases — never mutate core state directly.
4. Wire in `src/main.ts`.
5. Confirm headless playability: no DOM required to advance the game; update `tests/utils/interaction_test_helpers.ts` if interactions change.

## @events

| Source | Use for |
|--------|---------|
| `on_available_interactions_changed` | Option buttons, hit-status UI, grid highlights |
| `on_creature_added_to_game` | Register creature visuals |
| `on_creature_moved` | Movement animations |
| `on_creature_received_damage` | Damage animations, action log |
| `on_creature_targeted` / `on_creature_untargeted` | Hit-chance overlay |
| `on_creature_missed` | Miss animation |
| `on_creature_attacked` | Attack action log |
| `on_turn_state_*` | Instruction visualizer, debug panels |

## @file-layout

```
src/web/<feature>/
├── <Feature>UI.ts       # create_<feature>_ui / initialize_<feature>_ui
├── <SubVisual>.ts
└── <feature>.css
```

- Visual factories: `create_visual_<name>` or `create_<name>_visual`
- DOM helper: `web/utils/create_html_element.ts`
- CSS: BEM classes (`creature__lifebar`)
- Visual return types: `export type FooVisual = ReturnType<typeof create_visual_foo>`
- Use `AnimationQueue` when animations must complete before core continues

## @reference-implementations

| Pattern | File |
|---------|------|
| Grid / path / area selection | `web/battle_grid/BattleGridUI.ts` |
| Option buttons | `web/creature_option_buttons/CreatureOptionButtons.ts` |
| Hit status picker | `web/hit_status_buttons/HitStatusButtonsUI.ts` |
| Creature sprite | `web/creature/CreatureVisual.ts` |
| Turn-state debug | `web/instruction_visualizer/instruction_visualizer.ts` |
| Headless test driver | `tests/utils/interaction_test_helpers.ts` |
