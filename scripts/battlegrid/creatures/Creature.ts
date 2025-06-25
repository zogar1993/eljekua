import {CreatureVisual} from "battlegrid/creatures/CreatureVisual";
import {Position} from "battlegrid/Position";
import {CreatureData} from "battlegrid/creatures/CreatureData";
import {ResolvedNumberValue} from "expression_parsers/parse_expression_to_number_values";

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
        const attributes = ["str", "con", "dex", "int", "wis", "cha"]
        if (property === "movement") return {value: this.data.movement, description: "movement"}
        //TODO clean up the attribute mess
        if (attributes.some(attribute => `${attribute}_mod` === property)) return this.resolve_attribute_mod(property.slice(0, 3) as any)
        if (attributes.some(attribute => `${attribute}_mod_lvl` === property)) return this.resolve_attribute_mod_plus_half_level(property.slice(0, 3) as any)
        throw Error(`Invalid property ${property}`)
    }

    resolve_half_level = (): ResolvedNumberValue => ({
        value: this.half_level(),
        description: "half level"
    })
    resolve_attribute_mod = (attribute_code: keyof Creature["data"]["attributes"]): ResolvedNumberValue => ({
        value: this.attribute_mod(attribute_code),
        description: `${attribute_code} mod`
    })
    resolve_attribute_mod_plus_half_level = (attribute_code: keyof Creature["data"]["attributes"]): ResolvedNumberValue => ({
        value: this.attribute_mod(attribute_code) + this.half_level(),
        description: `${attribute_code} mod lvl`
    })

    has_equipped = (weapon_type: string) => false

    half_level = () =>
        Math.floor(this.data.level / 2)

    attribute_mod = (attribute_code: keyof Creature["data"]["attributes"]) =>
        Math.floor((this.data.attributes[attribute_code] - 10) / 2)
}
