import {Creature} from "battlegrid/creatures/Creature";
import type {AstNodeNumberResolved} from "expression_parsers/token_to_node";
import {roll_d} from "randomness/dice";

export class InitiativeOrder {
    initiative_order: Array<{ creature: Creature, initiative: AstNodeNumberResolved }> = []

    private current_index = 0

    add_creature = (creature: Creature) => {
        const initiative = roll_d(20)
        this.initiative_order.push({creature, initiative})
    }

    get_current_creature = (): Creature => {
        if (this.current_index >= this.initiative_order.length)
            throw Error(`Initiative index ${this.current_index} out of bounds`)
        return this.initiative_order[this.current_index].creature
    }

    next_turn = () => {
        if (this.current_index + 1 === this.initiative_order.length)
            this.current_index = 0
        else
            this.current_index++
    }
}