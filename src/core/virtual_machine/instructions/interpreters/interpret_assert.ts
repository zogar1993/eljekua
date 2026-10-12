import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionAssert} from "core/virtual_machine/instructions/instructions";
import {assert_is_true} from "stdlib/assert";

export const interpret_assert = ({
                                     instruction,
                                     game_queries,
                                 }: InterpretInstructionProps<InstructionAssert>) => {
    assert_is_true(game_queries.evaluate_boolean(instruction.condition))
}
