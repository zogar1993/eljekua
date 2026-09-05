import type {Expr} from "core/virtual_machine/expressions/types";
import type {Instruction} from "core/virtual_machine/instructions/instructions";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import type {GameEvents} from "core/events/GameEvents";
import {assert_are_equal, assert_is_not_empty, assert_is_not_null} from "stdlib/assert";

export const create_vm_state = ({game_events}: { game_events: GameEvents }) => {
    const instruction_frames: Array<InstructionFrame> = []
    const variable_scopes: Array<Map<string, Expr>> = []

    const push_variable_scope = (variables: Record<string, Expr>) => {
        const scope = new Map<string, Expr>(Object.entries(variables))
        variable_scopes.push(scope)
    }

    const get_current_scope = () => variable_scopes[variable_scopes.length - 1]

    const get_variable_or_null = (name: string) => {
        const variable = get_current_scope().get(name)
        return variable ?? null
    }

    const get_variable = (name: string) => {
        const variable = get_variable_or_null(name)
        assert_is_not_null(variable)
        return variable
        //TODO P3 make error handling smoother everywhere
    }

    const has_variable = (name: string): boolean => get_current_scope().has(name)

    const set_variable = (name: string, value: Expr) => {
        get_current_scope().set(name, value)
        game_events.on_vm_variable_set.raise([name, value])
    }

    const add_scoped_instruction_frame = ({instructions, variables}: {
        instructions: ReadonlyArray<Instruction>,
        variables: Record<string, Expr>
    }) => {
        const frame = {
            instructions,
            current_instruction: 0,
            variable_scope_index: variable_scopes.length,
            is_child: false
        }
        push_variable_scope(variables)
        instruction_frames.push(frame)
        game_events.on_instruction_frame_added.raise({frame, variables: get_current_scope()})
    }

    const add_child_instruction_frame = ({instructions}: { instructions: ReadonlyArray<Instruction> }) => {
        assert_is_not_empty(variable_scopes)
        assert_is_not_empty(instruction_frames)

        const frame = {
            instructions,
            current_instruction: 0,
            variable_scope_index: variable_scopes.length - 1,
            is_child: true
        }

        assert_are_equal(frame.variable_scope_index, get_current_frame().variable_scope_index)

        instruction_frames.push(frame)

        game_events.on_instruction_frame_added.raise({frame, variables: new Map()})
    }

    const get_current_frame = () => {
        if (instruction_frames.length === 0) throw Error("No frames available")
        return instruction_frames[instruction_frames.length - 1]
    }

    const pop_frame = () => {
        assert_is_not_empty(instruction_frames)
        const frame = instruction_frames.pop()

        if (!frame!.is_child) {
            assert_is_not_empty(variable_scopes)
            variable_scopes.pop()
        }
    }

    const peek = (): Instruction => {
        while (instruction_frames.length > 0) {
            const frame = get_current_frame()

            if (frame.instructions.length > frame.current_instruction) {
                game_events.on_instruction_pointer_changed.raise(frame)
                return frame.instructions[frame.current_instruction]
            }

            pop_frame()

            game_events.on_instruction_frame_popped.raise()
        }
        throw Error("no instructions left")
    }

    const get_acting_creature = () => EXPR.as_creature(get_variable(SYSTEM_KEYWORD.OWNER))

    const jump = (offset: number) => {
        const frame = get_current_frame()
        frame.current_instruction += offset
    }

    const clear = () => {
        while (instruction_frames.length > 0)
            instruction_frames.pop()
        while (variable_scopes.length > 0)
            variable_scopes.pop()
        game_events.on_vm_state_cleared.raise()
    }

    return {
        add_scoped_instruction_frame,
        add_child_instruction_frame,
        clear,

        peek,
        jump,

        get_acting_creature,

        get_variable,
        set_variable,
        has_variable,
    }
}

export type VMState = ReturnType<typeof create_vm_state>

export type InstructionFrame = {
    current_instruction: number
    instructions: ReadonlyArray<Instruction>
    variable_scope_index: number
    is_child: boolean
}
