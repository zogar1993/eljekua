import {InstructionPush} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "expressions/token_evaluator/NODE";

export const interpret_push = ({
                                   instruction,
                                   context,
                                   player_turn_handler,
                                   battle_grid,
                                   evaluate_token
                               }: InterpretInstructionProps<InstructionPush>) => {
    const attacker = context.owner()
    const defender = context.get_creature(instruction.target)

    const alternatives = battle_grid.get_push_positions({
        attacker_origin: attacker.data.position,
        defender_origin: defender.data.position,
        amount: NODE.as_number_resolved(evaluate_token(instruction.amount)).value
    })

    if (alternatives.length === 0) return

    if (alternatives.length === 1) {
        battle_grid.push_creature({creature: defender, position: alternatives[0]})
        return
    }

    //TODO rework push
    player_turn_handler.set_awaiting_position_selection({
        clickable: alternatives,
        highlighted_area: [],
        target: null,
        on_click: (position) => {
            battle_grid.push_creature({creature: defender, position})
        },
        on_hover: () => {
        }
    })
}