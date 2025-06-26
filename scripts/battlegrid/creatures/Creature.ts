import {CreatureVisual} from "battlegrid/creatures/CreatureVisual";
import {Position} from "battlegrid/Position";
import {CreatureData} from "battlegrid/creatures/CreatureData";

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

    has_equipped = (weapon_type: string) => false

    half_level = () =>
        Math.floor(this.data.level / 2)

    attribute_mod = (attribute_code: keyof Creature["data"]["attributes"]) =>
        Math.floor((this.data.attributes[attribute_code] - 10) / 2)
}
