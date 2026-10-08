import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InstructionAssert} from "core/virtual_machine/instructions/instructions";
import {assert_is_true} from "stdlib/assert";

export const interpret_assert = ({
                                     instruction,
                                     game_queries,
                                 }: InterpretInstructionProps<InstructionAssert>) => {
    assert_is_true(EXPR.as_boolean(game_queries.evaluate(instruction.condition)))
}
