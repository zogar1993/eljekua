import {PowerContext} from "scripts/battlegrid/player_turn_handler/PowerContext";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {Instruction} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";

export class TurnContext {
    power_contexts: Array<PowerContext> = []

    add_power_context = ({name, instructions, owner}: {
        name: string,
        instructions: Array<Instruction>,
        owner: Creature
    }) => {
        const context = new PowerContext({instructions, name, owner})
        this.power_contexts.push(context)
    }

    has_instructions = () => this.power_contexts.length > 0

    next_instruction = () => {
        while (this.power_contexts.length > 0) {
            const last = this.power_contexts[this.power_contexts.length - 1]
            if (last.has_instructions())
                return last.next_instruction()
            this.power_contexts = this.power_contexts.slice(0, this.power_contexts.length - 1)
        }

        return null
    }

    get_current_context = () => this.power_contexts[this.power_contexts.length - 1]


    //TODO P3 there are two ways of getting the current turn owner
    get_turn_owner = () => {
        if (this.power_contexts.length === 0) throw Error(`can't get owner without setting a power context`)
        return this.power_contexts[0].owner()
    }
}