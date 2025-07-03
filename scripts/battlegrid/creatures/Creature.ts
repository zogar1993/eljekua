import {CreatureVisual} from "battlegrid/creatures/CreatureVisual";
import {CreatureData} from "battlegrid/creatures/CreatureData";
import {AnimationQueue} from "AnimationQueue";

export class Creature {
    visual: CreatureVisual
    data: CreatureData

    constructor({data, visual}: { data: CreatureData, visual: CreatureVisual }) {
        this.data = data
        this.visual = visual
    }

    receive_damage(value: number) {
        this.data.hp_current -= value
        AnimationQueue.add_animation(() => this.visual.receive_damage({hp: this.data.hp_current, damage: value}))
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
