import {create_hit_status_buttons_ui} from "web/core/hit_status_buttons/HitStatusButtonsUI";
import {create_initiative_order_ui} from "web/core/initiative_order/InitiativeOrderUI";
import {create_add_creature_to_game} from "core/use_cases/add_creature_to_game";
import {create_start_battle} from "core/use_cases/start_battle";
import {create_instruction_loop} from "core/instruction_loop";
import {build_evaluate_ast} from "core/virtual_machine/expressions/evaluate_ast";
import {create_set_current_turn_to_creature} from "core/use_cases/gameplay/set_current_turn_to_creature";
import {create_game_events} from "core/events/GameEvents";
import {create_game_state} from "core/game_state/GameState";
import {initialize_battle_grid_ui} from "web/core/battle_grid/BattleGridUI";
import {create_option_buttons_ui} from "web/core/creature_option_buttons/CreatureOptionButtons";
import {create_visual_tests_ui} from "web/visual_tests/create_visual_tests_ui";

const game_events = create_game_events()
const game_state = create_game_state({game_events, battle_grid_size: {x: 10, y: 10}})
game_state.settings.attack_roll_resolution_is_random = false

const evaluate_ast = build_evaluate_ast({game_state})
const instruction_loop = create_instruction_loop({game_state, evaluate_ast, game_events})

const battle_grid_ui = initialize_battle_grid_ui({game_state, game_events, game_input: instruction_loop})
create_option_buttons_ui({game_events, game_input: instruction_loop})
create_hit_status_buttons_ui({game_events, game_inputs: instruction_loop})
create_initiative_order_ui({game_events})

const set_current_turn_to_creature = create_set_current_turn_to_creature({game_state, game_events})
const add_creature_to_game = create_add_creature_to_game({game_state, game_events})
const start_battle = create_start_battle({game_state, instruction_loop, game_events})

const visual_tests = create_visual_tests_ui({
    game_events,
    game_state,
    instruction_loop,
    add_creature_to_game,
    start_battle,
    set_current_turn_to_creature,
    click_overlay: battle_grid_ui.click_overlay,
    board: battle_grid_ui.board,
})

;(window as any).set_current_turn = (name: string) => {
    const creature = game_state.creatures.get_all().find(entry => entry.data.name === name)
    if (!creature) {
        console.log(`Creature with name '${name}' not found`)
        return
    }
    set_current_turn_to_creature({creature})
    instruction_loop.run()
    visual_tests.expose_set_current_turn(name)
}

void visual_tests.run_replay_if_scheduled()
