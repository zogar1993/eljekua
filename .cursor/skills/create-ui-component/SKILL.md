---
name: create-ui-component
description: >-
  Add a web UI component in eljekua. Use when creating or wiring DOM visuals,
  interaction UIs, or presentation layers in src/web/.
---

# Create UI Component

Follow project conventions for naming and `@core-web` / `@player-interactions` boundaries.

## @checklist

1. Create `src/web/<feature>/` with a `create_*_ui` or `initialize_*_ui` factory.
2. Subscribe to `GameEvents` for core-driven updates; handle presentation-only state (hover previews, highlights) internally.
3. Forward input via interaction callbacks (`select`, `on_click`, `on_confirm`) or use cases — never mutate core state directly.
4. Wire in `src/main.ts`.
5. Confirm headless playability: no DOM required to advance the game; update `tests/utils/interaction_test_helpers.ts` if interactions change.
6. Run `@checklist` — required; includes `git add` for any new files.

## @events

The event catalog is `core/events/GameEvents.ts` (`create_game_events`). Read that file for the current `on_*` managers and payload types — do not duplicate the list here.

- Architecture: `@core-web`
- Subscribe with `game_events.on_<name>.add_handler(...)` in `create_*_ui` or `main.ts`
- Find existing subscribers: grep `src/web/` for `game_events.on_`
- Reference: `BattleGridUI.ts` (creatures, combat, interactions), `instruction_visualizer/instruction_visualizer.ts` (turn state)

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
