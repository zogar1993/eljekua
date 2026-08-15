import {Expr} from "core/expressions/evaluator/types";
import {Instruction} from "core/expressions/parser/instructions";
import {EXPR} from "core/expressions/evaluator/EXPR";
import {SYSTEM_KEYWORD} from "core/expressions/parser/AST_NODE";
import {assert} from "stdlib/assert";
import {GameEvents} from "core/events/GameEvents";

export const create_turn_state = ({game_events}: { game_events: GameEvents }) => {
    let frames: Array<InstructionFrame> = []

    const add_instruction_frame = ({instructions, variables = {}}: {
        instructions: Array<Instruction>
        variables?: Record<string, Expr>
    }) => {
        const frame_variables = new Map<string, Expr>()
        for (const [key, value] of Object.entries(variables))
            frame_variables.set(key, value)

        const frame = {instructions: [...instructions], variables: frame_variables}
        frames.push(frame)

        game_events.on_instruction_frame_added.raise(frame)
    }

    const get_current_frame = () => {
        if (frames.length === 0) throw Error("No frames available")
        return frames[frames.length - 1]
    }

    const peek_instruction = (): Instruction => {
        const frame = get_current_frame()
        assert(frame.instructions.length > 0, () => "no instructions left when calling peek instruction")
        return frame.instructions[0]
    }

    const next_instruction = () => {
        while (frames.length > 0) {
            const frame = get_current_frame()
            if (frame.instructions.length > 0) {
                assert(frame.instructions.length > 0, () => "no instructions left when calling next instruction")
                const [next, ...instructions] = frame.instructions
                frame.instructions = instructions
                game_events.on_instruction_consumed.raise(next)
                return next
            }

            // We discard the current frame if it is empty and move on to the next.
            // The reason instruction frames aren't automatically removed alongside their last instruction is that
            // an instruction can be added after that. This is a bit easier to handle.
            frames = frames.slice(0, frames.length - 1)
            game_events.on_instruction_frame_popped.raise()
        }

        return null
    }

    const get_variable = (name: string) => {
        const frame = get_current_frame()
        const variable = frame.variables.get(name)
        //TODO P3 make error handling smoother everywhere
        if (!variable)
            throw Error(`variable '${name}' not found in frame. Variables: ${to_formatted_json_string(frame.variables)}.'`)
        return variable
    }


    const get_acting_creature = () => EXPR.as_creature(get_variable(SYSTEM_KEYWORD.OWNER))

    const has_variable = (name: string): boolean => {
        const frame = get_current_frame()
        return frame.variables.has(name)
    }

    const set_variable = (name: string, value: Expr) => {
        const frame = get_current_frame()
        frame.variables.set(name, value)
        game_events.on_turn_state_variable_set.raise([name, value])
    }

    const add_instructions = (instructions: Array<Instruction>) => {
        const frame = get_current_frame()
        frame.instructions = [...instructions, ...frame.instructions]
        game_events.on_instructions_prepended.raise(instructions)
    }

    const clear = () => {
        frames = []
        game_events.on_turn_state_cleared.raise()
    }

    return {
        add_instruction_frame,
        clear,

        peek_instruction,
        next_instruction,
        add_instructions,

        get_acting_creature,

        get_variable,
        set_variable,
        has_variable,
    }
}

export type TurnState = ReturnType<typeof create_turn_state>

export type InstructionFrame = {
    instructions: Array<Instruction>
    variables: Map<string, Expr>
}

const to_formatted_json_string = (obj: object) => JSON.stringify(obj, null, 2)
