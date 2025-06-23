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
                value: "$sum([1W],owner.str_mod)",
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
        type: "melee weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "$sum(str,2)",
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
                value: "$sum([1W],owner.str_mod)",
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
                type: "condition",
                condition: `$equipped(owner,"two-handed")`,
                consequences_true: [
                    {
                        type: "apply_damage",
                        value: `str_mod`,
                        target: "primary_target"
                    },
                ],
                consequences_false: [
                    {
                        type: "apply_damage",
                        value: `$half(str_mod)`,
                        target: "primary_target"
                    },
                ]
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
                value: "$sum([1W],owner.str_mod)",
                target: "primary_target"
            },
            {
                type: "condition",
                condition: "owner.size+1>=target.size",
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
                                condition: "primary_target.position!=primary_target_last_position&&$distance(owner.position,primary_target_last_position)==1",
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

export const BASIC_MOVEMENT_ACTIONS = [movement, shift].map(transform_power_ir_into_vm_representation)
export const BASIC_ATTACK_ACTIONS = [melee_basic_attack, cleave, sure_strike].map(transform_power_ir_into_vm_representation)
