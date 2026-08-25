import type {Expr} from "core/virtual_machine/expressions/types";
import type {Instruction} from "core/virtual_machine/instructions/instructions";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import type {GameEvents} from "core/events/GameEvents";

export const create_vm_state = ({game_events}: { game_events: GameEvents }) => {
    let frames: Array<InstructionFrame> = []

    const add_instruction_frame = ({instructions, variables = {}}: {
        instructions: ReadonlyArray<Instruction>
        variables?: Record<string, Expr>
    }) => {
        const frame_variables = new Map<string, Expr>()
        for (const [key, value] of Object.entries(variables))
            frame_variables.set(key, value)

        const frame = {instructions: [...instructions], variables: frame_variables, current_instruction: 0}
        frames.push(frame)

        game_events.on_instruction_frame_added.raise(frame)
    }

    const get_current_frame = () => {
        if (frames.length === 0) throw Error("No frames available")
        return frames[frames.length - 1]
    }

    const peek = (): Instruction => {
        while (frames.length > 0) {
            const frame = get_current_frame()

            if (frame.instructions.length > frame.current_instruction) {
                game_events.on_instruction_pointer_changed.raise(frame)
                return frame.instructions[frame.current_instruction]
            }

            frames.pop()
            game_events.on_instruction_frame_popped.raise()
        }
        throw Error("no instructions left")
    }

    const get_variable = (name: string) => {
        for (let i = frames.length - 1; i >= 0; i--) {
            const frame = frames[i]
            const variable = frame.variables.get(name)
            if (variable) return variable
        }
        throw Error(`variable '${name}' not found in frame.'`)
        //TODO P3 make error handling smoother everywhere
    }


    const get_acting_creature = () => EXPR.as_creature(get_variable(SYSTEM_KEYWORD.OWNER))

    const has_variable = (name: string): boolean => {
        const frame = get_current_frame()
        return frame.variables.has(name)
    }

    const set_variable = (name: string, value: Expr) => {
        const frame = get_current_frame()
        frame.variables.set(name, value)
        game_events.on_vm_variable_set.raise([name, value])
    }

    const jump = (offset: number) => {
        const frame = get_current_frame()
        frame.current_instruction += offset
    }

    const clear = () => {
        frames = []
        game_events.on_vm_state_cleared.raise()
    }

    return {
        add_instruction_frame,
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
    variables: Map<string, Expr>
}
