import type {Power} from "types.ts";
import {transform_power_ir_into_vm_representation} from "tokenizer/transform_power_ir_into_vm_representation";

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
        type: "melee_weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            }
        ]
    },
}

const sure_strike: Power = {
    name: "Sure Strike",
    description: "You trade power for precision.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        type: "melee_weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "$add(str,2)",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "{1W}",
                target: "primary_target"
            },
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
        type: "melee_weapon",
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
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            },
            {
                type: "condition",
                condition: "$exists(secondary_target)",
                consequences_true: [
                    {
                        type: "apply_damage",
                        value: "owner.str_mod",
                        target: "secondary_target",
                    },
                ]
            }
        ]
    },
}

const reaping_strike: Power = {
    name: "Reaping Strike",
    description: "You punctuate your scything attacks with wicked jabs and small cutting blows that slip through your enemy's defenses.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        type: "melee_weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            },
        ],
        miss: [
            {
                type: "condition",
                condition: `$equipped(owner,"two-handed")`,
                consequences_true: [
                    {
                        type: "apply_damage",
                        value: `owner.str_mod`,
                        target: "primary_target"
                    },
                ],
                consequences_false: [
                    {
                        type: "apply_damage",
                        value: `owner.str_mod`,
                        target: "primary_target",
                        half_damage: true
                    },
                ]
            },
        ]
    },
}

const tide_of_iron: Power = {
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
        type: "melee_weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            },
            {
                type: "condition",
                condition: "$greater_or_equals($add(owner.size,1),target.size)",
                consequences_true: [
                    {
                        type: "question_yes_no",
                        question: "Push?",
                        consequences_yes: [
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
                                condition: "$and($not_equals(primary_target.position,primary_target_last_position),$equals($movement_distance(owner.position,primary_target_last_position),1))",
                                consequences_true: [
                                    {
                                        type: "question_yes_no",
                                        question: "Follow?",
                                        consequences_yes: [
                                            {
                                                type: "shift",
                                                target: "owner",
                                                destination: "primary_target_last_position"
                                            }
                                        ]
                                    },
                                ]
                            },
                        ]
                    }
                ]
            },
        ],
    },
}

const magic_missile: Power = {
    name: "Magic Missile",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        type: "ranged",
        target_type: "creature",
        amount: 1,
        distance: "20"
    },
    effect: [
        {
            type: "apply_damage",
            value: "$add(2,owner.int_mod)",
            target: "primary_target",
            damage_types: ["force"] //TODO add vulnerabilities and resistances
        }
    ]
}

const sly_flourish = {
    name: "Sly Flourish",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        type: "melee_weapon_or_ranged_weapon",
        target_type: "creature",
        amount: 1
    },
    roll: {
        attack: "dex",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "$add({1W},owner.dex_mod,owner.cha_mod)",
                target: "primary_target"
            },
        ]
    },
}

const piercing_strike: Power = {
    name: "Piercing Strike",
    description: "You drive your weapon past your foe's guard and into a tender spot.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        type: "melee_weapon",
        target_type: "creature",
        amount: 1
    },
    roll: {
        attack: "dex",
        defense: "reflex",
        hit: [
            {
                type: "apply_damage",
                value: "$add({1W},owner.dex_mod)",
                target: "primary_target"
            },
        ]
    },
}


//holy strike
//furious smash

export const BASIC_MOVEMENT_ACTIONS = [movement, shift].map(transform_power_ir_into_vm_representation)
export const BASIC_ATTACK_ACTIONS = [melee_basic_attack, cleave, sure_strike, magic_missile, reaping_strike, piercing_strike].map(transform_power_ir_into_vm_representation)
