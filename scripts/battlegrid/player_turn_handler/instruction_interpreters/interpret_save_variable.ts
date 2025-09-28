import {InstructionSaveVariable} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

export const interpret_save_variable = ({instruction, context, evaluate_token}: InterpretInstructionProps<InstructionSaveVariable>) => {
    const node = evaluate_token(instruction.value)
    switch (node.type) {
        case "position":
            context.set_variable({type: "position", name: instruction.label, value: node.value})
            break
        case "number_resolved":
            context.set_variable({type: "resolved_number", name: instruction.label, value: node})
            break
        case "number_unresolved":
            context.set_variable({type: "unresolved_number", name: instruction.label, value: node})
            break
        default:
            throw Error(`Unsupported variable type to save '${node.type}'`)
    }
}
