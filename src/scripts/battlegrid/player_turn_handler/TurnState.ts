import {PowerContext} from "scripts/battlegrid/player_turn_handler/PowerContext";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {Instruction} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";

export const create_turn_state = (): TurnState => {
    let power_contexts: Array<PowerContext> = []

    const add_power_context = ({name, instructions, owner}: {
        name: string,
        instructions: Array<Instruction>,
        owner: Creature
    }) => {
        const context = new PowerContext({instructions, name, owner})
        power_contexts.push(context)
        return context
    }

    const get_current_context = () => power_contexts[power_contexts.length - 1]

    const next_instruction = () => {
        while (power_contexts.length > 0) {
            const current_power_context = get_current_context()
            if (current_power_context.has_instructions())
                return current_power_context.next_instruction()

            // We discard the current power context if it is empty and move on to the next.
            // The reason powers contexts are not removed when the last instruction is removed is because
            // an instruction can be added after that. This is a bit easier to handle.
            power_contexts = power_contexts.slice(0, power_contexts.length - 1)
        }

        return null
    }

    //TODO P3 there are two ways of getting the current turn owner
    const get_turn_owner = () => {
        if (power_contexts.length === 0) throw Error(`can't get owner without setting a power context`)
        return power_contexts[0].owner()
    }

    return {
        add_power_context,
        get_current_context,
        next_instruction,
        get_turn_owner
    }
}

export type TurnState = {
    add_power_context: (_: { name: string, instructions: Array<Instruction>, owner: Creature }) => PowerContext
    get_current_context: () => PowerContext
    next_instruction: () => Instruction | null
    get_turn_owner: () => Creature
}