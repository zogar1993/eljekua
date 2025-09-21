import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import {Creature} from "battlegrid/creatures/Creature";
import {Instruction} from "expressions/tokenizer/transform_power_ir_into_vm_representation";

export class TurnContext {
    power_contexts: Array<PowerContext> = []
    expended_opportunity_actions: Array<Creature> = []

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

    expend_opportunity_action = (creature: Creature) => this.expended_opportunity_actions.push(creature)
    has_opportunity_action = (creature: Creature) => !this.expended_opportunity_actions.includes(creature)
    refresh_opportunity_actions = () => this.expended_opportunity_actions = []
}