import type {IRPower} from "core/types";
import {INSTRUCTION_TYPE} from "core/expressions/parser/instructions";

export const power_shield_faint: IRPower = {
    name: "Shield Feint",
    description: "With subtle movements and misdirection, you use your shield to keep your opponent unsure about your next attack.",
    keywords: ["Martial", "Weapon"],
    prerequisites: [
        `$equipped(owner,"shield")`
    ],
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
    damage: {
        lvl_1: "{1W}",
        lvl_21: "{2W}"
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: `$add(primary_damage,owner.str_mod)`,
                target: "primary_target"
            },
            {
                type: INSTRUCTION_TYPE.APPLY_STATUS,
                target: "owner",
                duration: ["until_end_of_your_next_turn", "until_your_next_attack_roll_against_target"],
                status: {
                    type: "gain_attack_bonus",
                    value: 3,
                    against: "primary_target",
                }
            }
        ],
    },
}
