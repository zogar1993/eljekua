import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import {Creature} from "battlegrid/creatures/Creature";

export class TurnContext {
    power_contexts: Array<PowerContext> = []
    expended_opportunity_actions: Array<Creature> = []

    add_power_context = (context: PowerContext) => {
        this.power_contexts.push(context)
    }

    has_consequences = () => this.power_contexts.length > 0

    next_consequence = () => {
        while (this.power_contexts.length > 0) {
            const last = this.power_contexts[this.power_contexts.length - 1]
            if (last.has_consequences())
                return last.next_consequence()
            this.power_contexts = this.power_contexts.slice(0, this.power_contexts.length - 1)
        }

        return null
    }

    get_current_context = () => this.power_contexts[this.power_contexts.length - 1]

    expend_opportunity_action = (creature: Creature) => this.expended_opportunity_actions.push(creature)
    has_opportunity_action = (creature: Creature) => !this.expended_opportunity_actions.includes(creature)
}