import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {InstructionExecutePower} from "scripts/expressions/parser/instructions";
import {Expr} from "scripts/expressions/evaluator/types";

export const interpret_execute_power = ({
                                            instruction,
                                            turn_state,
                                        }: InterpretInstructionProps<InstructionExecutePower>) => {
    const owner = turn_state.get_power_owner()
    const {name, instructions} = EXPR.as_power(turn_state.get_variable(instruction.power))

    const initialization = instruction.initialization ?? []
    const variables: Record<string, Expr> = {}
    for (const {from, to} of initialization)
        variables[to] = turn_state.get_variable(from)

    turn_state.add_power_frame({name, instructions, owner, variables})
}