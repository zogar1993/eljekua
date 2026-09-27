import {create_game_events} from "core/events/GameEvents";
import {create_game_state} from "core/game_state/GameState";
import {build_evaluate_ast} from "core/virtual_machine/expressions/evaluate_ast";
import {to_ast} from "core/expressions/parser/to_ast";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import type {Position} from "core/battlegrid/Position";
import {ATTRIBUTES} from "core/character_sheet/attributes";

export const ISOLATED_POSITION = {x: 3, y: 3, footprint: 1} as const satisfies Position

export const ADJACENT_TO_ISOLATED_POSITION = {x: 4, y: 3, footprint: 1} as const satisfies Position

export const IRRELEVANT_POSITIONS = [
    {x: 1, y: 1, footprint: 1},
    {x: 2, y: 1, footprint: 1},
    {x: 3, y: 1, footprint: 1},
    {x: 4, y: 1, footprint: 1},
] as const satisfies ReadonlyArray<Position>

export const create_expression_test_context = () => {
    const game_events = create_game_events()
    const game_state = create_game_state({game_events, battle_grid_size: {x: 10, y: 10}})
    const evaluate_ast = build_evaluate_ast({game_state})

    game_state.vm_state.add_scoped_instruction_frame({instructions: [], variables: {}})

    const evaluate_expression = (expression: string) => evaluate_ast(to_ast(expression))

    const bind_creature = (keyword: string, creature: Creature) => {
        game_state.vm_state.set_variable(keyword, {type: "creatures", value: [creature]})
    }

    const create_test_creature = (
        overrides: Partial<CreatureData> & Pick<CreatureData, "name"> & { position?: Position },
    ) => {
        const data: CreatureData = {
            name: overrides.name,
            template: overrides.template ?? null,
            position: overrides.position ?? ISOLATED_POSITION,
            size: overrides.size ?? "medium",
            image: "",
            movement: overrides.movement ?? 5,
            hp_current: overrides.hp_current ?? 10,
            hp_max: overrides.hp_max ?? 10,
            level: overrides.level ?? 1,
            team: overrides.team ?? null,
            race: overrides.race ?? null,
            attributes: overrides.attributes ?? Object.fromEntries(
                Object.values(ATTRIBUTES).map(attribute => [attribute, 10]),
            ) as CreatureData["attributes"],
            trained_skills: overrides.trained_skills ?? [],
            skills: overrides.skills ?? {},
            powers: overrides.powers ?? [],
            archetypes: overrides.archetypes ?? [],
            constant_effects: overrides.constant_effects ?? [],
            modifiers: overrides.modifiers ?? [],
            languages: overrides.languages ?? [],
        }

        return game_state.creatures.create(data)
    }

    const bind_owner = (creature: Creature) => bind_creature(SYSTEM_KEYWORD.OWNER, creature)
    const bind_primary_target = (creature: Creature) => bind_creature(SYSTEM_KEYWORD.PRIMARY_TARGET, creature)

    return {
        game_state,
        evaluate_ast,
        evaluate_expression,
        create_test_creature,
        bind_creature,
        bind_owner,
        bind_primary_target,
    }
}
