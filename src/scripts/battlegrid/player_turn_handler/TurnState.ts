import {PowerFrame} from "scripts/battlegrid/player_turn_handler/PowerFrame";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {Instruction} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {Expr} from "scripts/expressions/evaluator/types";

export const create_turn_state = (): TurnState => {
    let power_frames: Array<PowerFrame> = []

    const add_power_frame = ({name, instructions, owner}: {
        name: string,
        instructions: Array<Instruction>,
        owner: Creature
    }) => {
        const power_frame = new PowerFrame({instructions, name, owner})
        power_frames.push(power_frame)
        return power_frame
    }

    // TODO P3 Probably best to encapsulate this and not let it get out
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

    //TODO AP3 there are two ways of getting the current turn owner
    const get_turn_owner = () => {
        if (power_frames.length === 0) throw Error(`can't get owner without setting a power frame`)
        return power_frames[0].owner()
    }

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
        return frame.set_variable(name, value)
    }

    const add_instructions = (instructions: Array<Instruction>) => {
        const frame = get_current_power_frame()
        return frame.add_instructions(instructions)
    }

    return {
        add_power_frame,
        get_current_power_frame,
        next_instruction,
        get_turn_owner,

        get_variable,
        has_variable,
        set_variable,
        add_instructions
    }
}

export type TurnState = {
    add_power_frame: (_: { name: string, instructions: Array<Instruction>, owner: Creature }) => PowerFrame
    get_current_power_frame: () => PowerFrame
    next_instruction: () => Instruction | null
    get_turn_owner: () => Creature

    get_variable: (name: string) => Expr
    has_variable: (name: string) => boolean,
    set_variable: (name: string, value: Expr) => void
    add_instructions: (instructions: Array<Instruction>) => void
}