import {create_power_frame, PowerFrame} from "scripts/battlegrid/player_turn_handler/PowerFrame";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {Expr} from "scripts/expressions/evaluator/types";
import {Instruction} from "scripts/expressions/parser/instructions";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {SYSTEM_KEYWORD} from "scripts/expressions/parser/AST_NODE";

export const create_turn_state = (): TurnState => {
    let power_frames: Array<PowerFrame> = []

    const add_power_frame = ({name, instructions, owner, variables = {}}: {
        name: string
        instructions: Array<Instruction>
        owner: Creature
        variables?: Record<string, Expr>
    }) => {
        const power_frame = create_power_frame({instructions, name, owner})
        for(const [key, value] of Object.entries(variables))
            power_frame.set_variable(key, value)
        power_frames.push(power_frame)
        return power_frame
    }

    // TODO AP3 Probably best to encapsulate this and not let it get out
    const get_current_power_frame = () => power_frames[power_frames.length - 1]

    const next_instruction = () => {
        while (power_frames.length > 0) {
            const current_power_frame = get_current_power_frame()
            if (current_power_frame.has_instructions())
                return current_power_frame.next_instruction()

            // We discard the current power frame if it is empty and move on to the next.
            // The reason powers frames are not removed when the last instruction is removed is because
            // an instruction can be added after that. This is a bit easier to handle.
            power_frames = power_frames.slice(0, power_frames.length - 1)
        }

        return null
    }

    const get_power_owner = () => EXPR.as_creature(get_current_power_frame().get_variable(SYSTEM_KEYWORD.OWNER))

    const get_variable = (name: string) => {
        const frame = get_current_power_frame()
        return frame.get_variable(name)
    }

    const has_variable = (name: string): boolean => {
        const frame = get_current_power_frame()
        return frame.has_variable(name)
    }

    const set_variable = (name: string, value: Expr) => {
        const frame = get_current_power_frame()
        frame.set_variable(name, value)
    }

    const add_instructions = (instructions: Array<Instruction>) => {
        const frame = get_current_power_frame()
        frame.add_instructions(instructions)
    }

    return {
        add_power_frame,
        get_current_power_frame,
        next_instruction,

        get_power_owner,
        get_variable,
        has_variable,
        set_variable,
        add_instructions,
    }
}

export type TurnState = {
    add_power_frame: (_: {
        name: string,
        instructions: Array<Instruction>,
        owner: Creature,
        variables?: Record<string, Expr>
    }) => PowerFrame
    get_current_power_frame: () => PowerFrame
    next_instruction: () => Instruction | null
    get_power_owner: () => Creature
    get_variable: (name: string) => Expr
    has_variable: (name: string) => boolean,
    set_variable: (name: string, value: Expr) => void
    add_instructions: (instructions: Array<Instruction>) => void
}