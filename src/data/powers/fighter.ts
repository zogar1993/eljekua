import type {IRPower} from "core/types";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {INSTRUCTION_TYPE} from "core/expressions/parser/instructions";
import {power_resolute_shield} from "data/powers/fighter/resolute_shield";
import {power_shield_faint} from "data/powers/fighter/shield_faint";

const sure_strike: IRPower = {
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
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "{1W}",
                target: "primary_target"
            },
        ]
    },
}

const cleave: IRPower = {
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
                type: INSTRUCTION_TYPE.SELECT_TARGET,
                targeting_type: "adjacent",
                target_type: "enemy",
                amount: 1,
                exclude: ["primary_target"],
                target_label: "secondary_target"
            },
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            },
            {
                type: INSTRUCTION_TYPE.CONDITION,
                condition: "$exists(secondary_target)",
                instructions_true: [
                    {
                        type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                        value: "owner.str_mod",
                        target: "secondary_target",
                    },
                ]
            }
        ]
    },
}

const reaping_strike: IRPower = {
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
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            },
        ],
        miss: [
            {
                type: INSTRUCTION_TYPE.CONDITION,
                condition: `$equipped(owner,"two-handed")`,
                instructions_true: [
                    {
                        type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                        value: `owner.str_mod`,
                        target: "primary_target"
                    },
                ],
                instructions_false: [
                    {
                        type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                        value: `owner.str_mod`,
                        target: "primary_target",
                        half_damage: true
                    },
                ]
            },
        ]
    },
}

const tide_of_iron: IRPower = {
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
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            },
            {
                type: INSTRUCTION_TYPE.OPTIONS,
                options: [
                    {
                        text: "Push",
                        instructions: [
                            {
                                type: INSTRUCTION_TYPE.SAVE_VARIABLE,
                                value: "primary_target.position",
                                label: "primary_target_original_position"
                            },
                            {
                                type: "push",
                                amount: 1,
                                target: "primary_target"
                            },
                            {
                                type: INSTRUCTION_TYPE.CONDITION,
                                condition: "$not_equals(primary_target.position,primary_target_original_position)",
                                instructions_true: [
                                    {
                                        type: INSTRUCTION_TYPE.OPTIONS,
                                        options: [
                                            {
                                                text: "Follow",
                                                instructions: [
                                                    {
                                                        type: INSTRUCTION_TYPE.SELECT_TARGET,
                                                        targeting_type: "movement",
                                                        distance: 1,
                                                        destination_requirement: "primary_target_original_position",
                                                        target_label: "path_to_follow"
                                                    },
                                                    {
                                                        type: INSTRUCTION_TYPE.SHIFT,
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

const brash_strike: IRPower = {
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
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            },
            {
                type: INSTRUCTION_TYPE.CONDITION,
                condition: `$or($equipped(owner, "hammer"), $equipped(owner, "axe"), $equipped(owner, "mace"))`,
                instructions_true: [
                    {
                        type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                        value: "owner.con_mod",
                        target: "primary_target"
                    },//TODO P1 revisit that these damages are all dealt as one chunk instead of parts
                ]
            }
        ],
    },
    effect: [
        {
            type: INSTRUCTION_TYPE.APPLY_STATUS,
            target: "owner",
            duration: "until_start_of_your_next_turn",
            status: {
                type: "grant_combat_advantage",
                against: "primary_target",
            }
        }
    ]
}

const crushing_surge: IRPower = {
    name: "Crushing Surge",
    description: "The feel of your weapon crunching against the enemy puts your heart back in the fight.",
    keywords: ["Invigorating", "Martial", "Weapon"],
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
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            },
        ],
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
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            },
            {
                type: INSTRUCTION_TYPE.CONDITION,
                condition: "is_greater_or_equal($add(owner.size,1),target.size)",
                instructions_true: [
                    {
                        type: "question_yes_no",
                        question: "Push?",
                        instructions_true: [
                            {
                                type: INSTRUCTION_TYPE.SAVE_VARIABLE,
                                target: "primary_target.position",
                                label: "primary_target_original_position"
                            },
                            {
                                type: "push",
                                amount: 1,
                                target: "primary_target"
                            },
                            {
                                type: INSTRUCTION_TYPE.CONDITION,
                                condition: "$and($not_equals(primary_target.position,primary_target_last_position),$equals($movement_distance(owner.position,primary_target_last_position),1))",
                                instructions_true: [
                                    {
                                        type: "question_yes_no",
                                        question: "Follow?",
                                        instructions_true: [
                                            {
                                                type: INSTRUCTION_TYPE.SHIFT,
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

export const FIGHTER_POWERS = [
    sure_strike,
    cleave,
    reaping_strike,
    tide_of_iron,
    brash_strike,
    crushing_surge,
    power_resolute_shield,
    power_shield_faint
].map(transform_power_ir_into_vm_representation)