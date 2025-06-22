import type {IRConsequence, Power} from "types.ts";
import {Token, tokenize} from "tokenizer/tokenize";

const shift: Power = {
    name: "Shift",
    type: {
        action: "movement",
        cooldown: "at-will",
        attack: false,
    },
    targeting: {
        type: "movement",
        distance: "1",
        target_type: "terrain",
        terrain_prerequisite: "unoccupied",
        amount: 1
    },
    effect: [
        {
            type: "shift",
            target: "owner",
            destination: "primary_target"
        }
    ]
}

const movement: Power = {
    name: "Move",
    type: {
        action: "movement",
        cooldown: "at-will",
        attack: false,
    },
    targeting: {
        type: "movement",
        distance: "owner.movement",
        target_type: "terrain",
        terrain_prerequisite: "unoccupied",
        amount: 1
    },
    effect: [
        {
            type: "move",
            target: "owner",
            destination: "primary_target"
        }
    ]
}

const melee_basic_attack: Power = {
    name: "Melee Basic Attack",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        type: "melee weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "[1W]+owner.str_mod",
                target: "primary_target"
            }
        ]
    },
}

const cleave: Power = {
    name: "Cleave",
    description: "You hit one enemy, then cleave into another.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        type: "melee weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: "select_target",
                targeting: {
                    type: "adjacent",
                    target_type: "enemy",
                    amount: 1,
                    exclude: ["primary_target"]
                },
                target_label: "secondary_target"
            },
            {
                type: "apply_damage",
                value: "[1W]+owner.str_mod",
                target: "primary_target"
            },
            {
                type: "apply_damage",
                value: "owner.str_mod",
                target: "secondary_target",
                condition: "secondary_target",
            },
        ]
    },
}

const sure_strike = {
    name: "Sure Strike",
    description: "You trade power for precision.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        type: "melee weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "str+2",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "[1W]",
                target: "primary_target"
            },
        ]
    },
}

const reaping_strike = {
    name: "Reaping Strike",
    description: "You punctuate your scything attacks with wicked jabs and small cutting blows that slip through your enemy's defenses.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        type: "melee weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "[1W]+owner.str_mod",
                target: "primary_target"
            },
        ],
        miss: [
            {
                type: "apply_damage",
                value: `owner.weapon.type=="two-handed"?str_mod:$half(str_mod)`,
                target: "primary_target"
            },
        ]
    },
}

const tide_of_iron = {
    name: "Tide of Iron",
    description: "You punctuate your scything attacks with wicked jabs and small cutting blows that slip through your enemy's defenses.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    prerequisites: [
        `$equipped(owner,"shield")`
    ],
    targeting: {
        type: "melee weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "[1W]+owner.str_mod",
                target: "primary_target"
            },
            {
                type: "condition",
                condition: "owner.size+1>=target.size",
                consequences_true: [
                    {
                        type: "option",
                        question: "Push?",
                        answers: [
                            {
                                text: "Yes",
                                consequences: [
                                    {
                                        type: "save_position",
                                        target: "primary_target",
                                        label: "primary_target_original_position"
                                    },
                                    {
                                        type: "push",
                                        value: 1,
                                        target: "primary_target"
                                    },
                                    {
                                        type: "condition",
                                        condition: "primary_target.position!=primary_target_last_position"

                                    }
                                ]
                            },
                            {
                                text: "No",
                                consequences: []
                            }
                        ]
//                "and you can push the target 1 square if it is no larger than one size category larger than you. You can then shift 1 square into the space that the target left."
                    }
                ]
            },

        ],
    },
}

const PRIMARY_TARGET_LABEL = "primary_target"

const transform_power_ir_into_vm_representation = (power: Power): PowerVM => {
    const consequences: Array<Consequence> = [
        transform_primary_targeting(power.targeting),
        ...(power.roll ? [transform_roll(power.roll)] : []),
        ...(power.effect ? power.effect.map(transform_generic_consequence) : [])
    ]
    return {
        name: power.name,
        description: power.description,
        type: power.type,
        consequences: consequences
    }

}

export type PowerVM = {
    name: string
    description?: string
    type: {
        action: "standard" | "movement" | "minor" | "free"
        cooldown: "at-will" | "encounter" | "daily"
        attack: boolean
    }
    consequences: Array<Consequence>
}

export type ConsequenceSelectTarget = {
    type: "select_target"
    //TODO unbox
    targeting: {
        target_type: "enemy" | "terrain"
        amount: 1,
        exclude: Array<string>
        label: string
    } & ({
        type: "movement"
        distance: Array<Token>
    } | {
        type: "adjacent" | "melee weapon"
    }),
}


export type ConsequenceAttackRoll = {
    type: "attack_roll"
    attack: "str" | "con" | "dex" | "int" | "wis" | "cha"
    defense: string
    hit: Array<Consequence>
}

export type Consequence =
    {
        type: "apply_damage"
        value: Array<Token>
        target: string
    } |
    ConsequenceSelectTarget |
    ConsequenceAttackRoll |
    {
        type: "move" | "shift"
        target: string
        destination: string
    }

const transform_primary_targeting = (targeting: Power["targeting"]): ConsequenceSelectTarget => {
//TODO make this cleaner
    if (targeting.type === "movement") {
        return {
            type: "select_target",
            targeting: {
                type: targeting.type,
                target_type: targeting.target_type,
                amount: targeting.amount,
                label: PRIMARY_TARGET_LABEL,
                exclude: [],
                distance: tokenize(targeting.distance)
            }
        }
    } else {
        return {
            type: "select_target",
            targeting: {
                type: targeting.type,
                target_type: targeting.target_type,
                amount: targeting.amount,
                label: PRIMARY_TARGET_LABEL,
                exclude: []
            }
        }
    }
}

const transform_roll = (roll: Required<Power>["roll"]): ConsequenceAttackRoll => {
    return {
        type: "attack_roll",
        attack: roll.attack,
        defense: roll.defense,
        hit: roll.hit.map(transform_generic_consequence)
    }
}

const transform_generic_consequence = (consequence: IRConsequence): Consequence => {
    switch (consequence.type) {
        case "apply_damage":
            return {
                type: "apply_damage",
                value: tokenize(consequence.value),
                target: consequence.target
            }
        case "select_target":
            return {
                type: "select_target",
                targeting: {
                    type: consequence.targeting.type,
                    target_type: consequence.targeting.target_type,
                    amount: consequence.targeting.amount,
                    label: consequence.target_label,
                    exclude: consequence.targeting.exclude ?? [],
                }
            }
        case "move":
            return {
                type: "move",
                target: consequence.target,
                destination: consequence.destination
            }
        case "shift":
            return {
                type: "shift",
                target: consequence.target,
                destination: consequence.destination
            }
        default:
            throw Error(`consequence invalid ${JSON.stringify(consequence)}`)
    }
}

export const BASIC_MOVEMENT_ACTIONS = [movement, shift].map(transform_power_ir_into_vm_representation)
export const BASIC_ATTACK_ACTIONS = [melee_basic_attack].map(transform_power_ir_into_vm_representation)
