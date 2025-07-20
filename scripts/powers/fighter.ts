import {Power} from "types";
import {transform_power_ir_into_vm_representation} from "tokenizer/transform_power_ir_into_vm_representation";

const sure_strike: Power = {
    name: "Sure Strike",
    description: "You trade power for precision.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "melee_weapon",
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
        targeting_type: "melee_weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: "select_target",
                targeting_type: "adjacent",
                target_type: "enemy",
                amount: 1,
                exclude: ["primary_target"],
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
        targeting_type: "melee_weapon",
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
        targeting_type: "melee_weapon",
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
                type: "options",
                options: [
                    {
                        text: "Push",
                        consequences: [
                            {
                                type: "save_position",
                                target: "primary_target",
                                label: "primary_target_original_position"
                            },
                            {
                                type: "push",
                                amount: 1,
                                target: "primary_target"
                            },
                            {
                                type: "condition",
                                condition: "$not_equals(primary_target.position,primary_target_original_position)",
                                consequences_true: [
                                    {
                                        type: "options",
                                        options: [
                                            {
                                                text: "Follow",
                                                consequences: [
                                                    {
                                                        type: "select_target",
                                                        targeting_type: "movement",
                                                        distance: 1,
                                                        destination_requirement: "primary_target_original_position",
                                                        target_label: "path_to_follow"
                                                    },
                                                    {
                                                        type: "shift",
                                                        target: "owner",
                                                        destination: "path_to_follow"
                                                    }
                                                ]
                                            },
                                            {
                                                text: "Don't Follow",
                                                consequences: []
                                            }
                                        ]
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        text: "Don't Push",
                        consequences: []
                    }
                ],
            }
        ]
    },
}

const tide_of_iron_true = {
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
                        consequences_true: [
                            {
                                type: "save_position",
                                target: "primary_target",
                                label: "primary_target_original_position"
                            },
                            {
                                type: "push",
                                amount: 1,
                                target: "primary_target"
                            },
                            {
                                type: "condition",
                                condition: "$and($not_equals(primary_target.position,primary_target_last_position),$equals($movement_distance(owner.position,primary_target_last_position),1))",
                                consequences_true: [
                                    {
                                        type: "question_yes_no",
                                        question: "Follow?",
                                        consequences_true: [
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

export const FIGHTER_POWERS = [sure_strike, cleave, reaping_strike, tide_of_iron].map(transform_power_ir_into_vm_representation)