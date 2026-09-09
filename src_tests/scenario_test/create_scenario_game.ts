import {create_game_events} from "core/events/GameEvents";
import {create_game_state} from "core/game_state/GameState";
import {create_instruction_loop} from "core/instruction_loop";
import {create_add_creature_to_game} from "core/use_cases/add_creature_to_game";
import {create_set_current_turn_to_creature} from "core/use_cases/gameplay/set_current_turn_to_creature";
import {create_start_battle} from "core/use_cases/start_battle";
import {build_evaluate_ast} from "core/virtual_machine/expressions/evaluate_ast";

export const create_scenario_game = ({
                                         battle_grid_size = {x: 10, y: 10},
                                     }: {
    battle_grid_size?: { x: number, y: number }
} = {}) => {
    const game_events = create_game_events()
    const game_state = create_game_state({game_events, battle_grid_size})
    game_state.settings.attack_roll_resolution_is_random = false

    const evaluate_ast = build_evaluate_ast({game_state})
    const instruction_loop = create_instruction_loop({game_state, evaluate_ast, game_events})
    const add_creature_to_game = create_add_creature_to_game({game_state, game_events})
    const start_battle = create_start_battle({game_state, instruction_loop, game_events})
    const set_current_turn_to_creature = create_set_current_turn_to_creature({game_state, game_events})

    return {
        game_events,
        game_state,
        instruction_loop,
        add_creature_to_game,
        start_battle,
        set_current_turn_to_creature,
    }
}

export type ScenarioGame = ReturnType<typeof create_scenario_game>
