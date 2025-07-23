import {interpret_select_target} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_select_target";
import {interpret_attack_roll} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_attack_roll";
import {interpret_apply_damage} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_apply_damage";
import {interpret_move} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_move";
import {interpret_shift} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_shift";
import {interpret_push} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_push";
import {interpret_save_position} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_save_position";
import {interpret_options} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_options";
import {interpret_condition} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_condition";
import {Consequence} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";
import {
    interpret_save_resolved_number
} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_save_resolved_number";
import {interpret_copy_variable} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_copy_variable";
import {interpret_execute_power} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_execute_power";
import {interpret_add_powers} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_add_powers";

export const interpret_consequence = (props: InterpretConsequenceProps<Consequence>) => {
    const {consequence} = props
    switch (consequence.type) {
        case "select_target":
            interpret_select_target({...props, consequence})
            break
        case "attack_roll":
            interpret_attack_roll({...props, consequence})
            break
        case "apply_damage":
            interpret_apply_damage({...props, consequence})
            break
        case "move":
            interpret_move({...props, consequence})
            break
        case "shift":
            interpret_shift({...props, consequence})
            break
        case "push":
            interpret_push({...props, consequence})
            break
        case "save_position":
            interpret_save_position({...props, consequence})
            break
        case "save_resolved_number":
            interpret_save_resolved_number({...props, consequence})
            break
        case "copy_variable":
            interpret_copy_variable({...props, consequence})
            break
        case "options":
            interpret_options({...props, consequence})
            break;
        case "condition":
            interpret_condition({...props, consequence})
            break
        case "add_powers":
            interpret_add_powers({...props, consequence})
            break
        case "execute_power":
            interpret_execute_power({...props, consequence})
            break
        default:
            throw Error("action not implemented " + JSON.stringify(consequence))
    }
}