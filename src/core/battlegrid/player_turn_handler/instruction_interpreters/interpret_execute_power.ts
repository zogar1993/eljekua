import {
    InterpretInstructionProps
} from "core/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "core/expressions/evaluator/EXPR";
import {InstructionExecutePower} from "core/expressions/parser/instructions";
import {Expr} from "core/expressions/evaluator/types";
import {SYSTEM_KEYWORD} from "core/expressions/parser/AST_NODE";

export const interpret_execute_power = ({
                                            instruction,
                                            turn_state,
                                        }: InterpretInstructionProps<InstructionExecutePower>) => {
    const owner = turn_state.get_acting_creature()
    const {name, instructions} = EXPR.as_power(turn_state.get_variable(instruction.power))

    const initialization = instruction.initialization ?? []
    const variables: Record<string, Expr> = {}
    for (const {from, to} of initialization)
        variables[to] = turn_state.get_variable(from)
    variables[SYSTEM_KEYWORD.OWNER] = {type: "creatures", value: [owner]}
    variables[SYSTEM_KEYWORD.POWER_NAME] = {type: "string", value: name}

    turn_state.add_instruction_frame({instructions, variables})
}