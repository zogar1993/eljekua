export type Power = {
    name: string
    level?: 1
    class?: "Cleric"
    action: "standard" | "movement" | "minor" | "free"
    range: RangeRanged | RangeAreaBurst | Movement | Melee
    target: {
        "type": "enemy" | "creature" | "unoccupied_terrain",
        "amount": "all" | number
    }
    happenings: Array<{
        type: "attack"
        attack: AttributeModFormula
        defense: Defense
        hit: Array<
            {
                type: "apply_condition"
                passive_effects: [
                    {
                        type: "modify_defenses",
                        defenses: Array<Defense>
                        value: -2
                    }
                ]
                reactive_effects: [
                    {
                        type: "trigger",
                        trigger: "hit_by_ally",
                        effect: [{
                            type: "regain_hit_points"
                            target: AttributeOwner
                            value: AttributeModFormulaOwned
                            consume_self: true
                        }]
                    }]
                duration: "EoNT"
            } |
            {
                type: "apply_damage",
                value: "4"
            }
        >
    } | {
        type: "move" | "shift",
        target: "owner",
        destination: "target"
    }>
}


type RangeRanged = {
    type: "ranged"
    range: number
}

type RangeAreaBurst = {
    type: "area_burst"
    size: number
    range: number
}

type Movement = {
    type: "movement" | "shift"
    range: string
}

type Melee = {
    type: "melee weapon"
}

type Attribute = "strength" | "constitution" | "dexterity" | "intelligence" | "wisdom" | "charisma"
type AttributeMod = `${Attribute}_mod`
type AttributeModFormula = AttributeMod | string


type AttributeOwner = "triggerer" | "owner"
type AttributeModOwned = `${AttributeOwner}(${AttributeMod})`
type AttributeModFormulaOwned = AttributeModOwned | string


type Defense = "ac" | "fortitude" | "reflex" | "will"
export const ALL_DEFENSES: Array<Defense> = ["ac", "fortitude", "reflex", "will"]