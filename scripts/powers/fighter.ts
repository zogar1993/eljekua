import {Power} from "types";
import {
    transform_power_ir_into_vm_representation
} from "expressions/tokenizer/transform_power_ir_into_vm_representation";

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
                instructions_true: [
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
                instructions_true: [
                    {
                        type: "apply_damage",
                        value: `owner.str_mod`,
                        target: "primary_target"
                    },
                ],
                instructions_false: [
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
                        instructions: [
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
                                instructions_true: [
                                    {
                                        type: "options",
                                        options: [
                                            {
                                                text: "Follow",
                                                instructions: [
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
                                                instructions: []
                                            }
                                        ]
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        text: "Don't Push",
                        instructions: []
                    }
                ],
            }
        ]
    },
}

const brash_strike: Power = {
    name: "Brash Strike",
    description: "With a battle cry, you throw your whole body behind your attack.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "melee_weapon",
        target_type: "creature",
        amount: 1
    },
    roll: {
        attack: "$add(str,2)",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            },
            {
                type: "condition",
                condition: `$or($equipped(owner, "hammer"), $equipped(owner, "axe"), $equipped(owner, "mace"))`,
                instructions_true: [
                    {
                        type: "apply_damage",
                        value: "owner.con_mod",
                        target: "primary_target"
                    },//TODO revisit that these damages are all dealt as one chunk instead of parts
                ]
            }
        ],
    },
    effect: [
        {
            type: "grant_combat_advantage",
            target: "owner",
            beneficiaries: "primary_target",
            duration: "start_of_your_next_turn"
        }
    ]
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
                instructions_true: [
                    {
                        type: "question_yes_no",
                        question: "Push?",
                        instructions_true: [
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
                                instructions_true: [
                                    {
                                        type: "question_yes_no",
                                        question: "Follow?",
                                        instructions_true: [
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

export const FIGHTER_POWERS = [sure_strike, cleave, reaping_strike, tide_of_iron, brash_strike].map(transform_power_ir_into_vm_representation)