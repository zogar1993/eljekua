import {create_game_events} from "core/events/GameEvents";
import {create_game_state} from "core/game_state/GameState";
import {build_evaluate_ast} from "core/virtual_machine/expressions/evaluate_ast";
import {create_instruction_loop} from "core/instruction_loop";
import {create_add_creature_to_game} from "core/use_cases/add_creature_to_game";
import {create_start_battle} from "core/use_cases/start_battle";
import {create_set_current_turn_to_creature} from "core/use_cases/gameplay/set_current_turn_to_creature";

export const create_test_game = ({
    battle_grid_size = {x: 10, y: 10},
    attack_roll_resolution_is_random,
}: {
    battle_grid_size?: { x: number, y: number }
    attack_roll_resolution_is_random?: boolean
} = {}) => {
    const game_events = create_game_events()
    const game_state = create_game_state({
        game_events,
        battle_grid_size,
    })
    if (attack_roll_resolution_is_random !== undefined) {
        game_state.settings.attack_roll_resolution_is_random = attack_roll_resolution_is_random
    }

    const {battle_grid, initiative_order, vm_state, creatures} = game_state
    const evaluate_ast = build_evaluate_ast({game_state})
    const instruction_loop = create_instruction_loop({game_state, evaluate_ast, game_events})
    const add_creature_to_game = create_add_creature_to_game({game_state, game_events})
    const set_current_turn_to_creature = create_set_current_turn_to_creature({game_state, game_events})
    const start_battle = create_start_battle({game_state, instruction_loop, game_events})
    const start_initiative = () => initiative_order.start()

    return {
        game_events,
        game_state,
        battle_grid,
        initiative_order,
        vm_state,
        creatures,
        evaluate_ast,
        instruction_loop,
        add_creature_to_game,
        set_current_turn_to_creature,
        start_battle,
        start_initiative,
    }
}
