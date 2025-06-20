import {CreatureVisual} from "battlegrid/creatures/CreatureVisual";
import {Position} from "battlegrid/Position";
import {CreatureData} from "battlegrid/creatures/CreatureData";
import {ResolvedNumberValue} from "formulas/IntFormulaFromTokens";

export class Creature {
    private visual: CreatureVisual
    data: CreatureData

    constructor({data, visual}: { data: CreatureData, visual: CreatureVisual }) {
        this.data = data
        this.visual = visual
    }

    move_to(position: Position) {
        this.data.position = position
        this.visual.place_at(position)
    }

    receive_damage(value: number) {
        this.data.hp_current -= value
        this.visual.receive_damage({hp: this.data.hp_current, damage: value})
    }

    display_miss() {
        this.visual.display_miss()
    }

    display_hit_chance_on_hover = ({attack, defense, chance}: { attack: number, defense: number, chance: number }) => {
        this.visual.display_hit_chance_on_hover({attack, defense, chance})
    }

    remove_hit_chance_on_hover = () => {
        this.visual.remove_hit_chance_on_hover()
    }

    get_resolved_property = (property: string): ResolvedNumberValue => {
        if (property === "movement") return {value: this.data.movement, description: "movement"}
        if (property === "str_mod") return this.resolve_attribute_mod("str")
        throw Error(`Invalid property ${property}`)
    }

    resolve_half_level = (): ResolvedNumberValue => ({
        value: Math.floor(this.data.level / 2),
        description: "half level"
    })
    resolve_attribute_mod = (attribute_code: keyof Creature["data"]["attributes"]): ResolvedNumberValue => ({
        value: Math.floor((this.data.attributes[attribute_code] - 10) / 2),
        description: `${attribute_code} mod`
    })
}
