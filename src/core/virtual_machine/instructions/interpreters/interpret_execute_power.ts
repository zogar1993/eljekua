import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionExecutePower} from "core/virtual_machine/instructions/instructions";
import type {Expr} from "core/virtual_machine/expressions/types";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";

export const interpret_execute_power = ({
                                            instruction,
                                            game_state,
                                            game_queries,
                                        }: InterpretInstructionProps<InstructionExecutePower>) => {
    const {vm_state} = game_state
    const {name, instructions} = game_queries.evaluate_power(vm_state.get_variable(instruction.power_label))

    const initialization = instruction.initialization ?? []
    const variables: Record<string, Expr> = {}

    for (const {from_label, to_label} of initialization)
        variables[to_label] = vm_state.get_variable(from_label)

    if (!initialization.some(({to_label}) => to_label === SYSTEM_KEYWORD.OWNER)) {
        let owner = vm_state.get_acting_creature()
        variables[SYSTEM_KEYWORD.OWNER] = {type: "creatures", value: [owner]}
    }

    variables[SYSTEM_KEYWORD.POWER_NAME] = {type: "string", value: name}

    vm_state.add_scoped_instruction_frame({instructions, variables})
}