import type {IRPower} from "scripts/types";
import {INSTRUCTION_TYPE} from "scripts/expressions/parser/instructions";

export const power_resolute_shield: IRPower = {
    name: "Resolute Shield",
    description: "As you slash into your foe, you pull your shield into a defensive position between the two of you, guaranteeing that it absorbs at least some of your enemy's attack.",
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
                value: "$add(primary_damage,owner.str_mod)",
                target: "primary_target"
            },
            {
                type: INSTRUCTION_TYPE.APPLY_STATUS,
                target: "owner",
                duration: "until_end_of_your_next_turn",
                status: {
                    type: "gain_resistance",
                    value: "owner.con_mod",
                    against: "primary_target",
                }
            }
        ],
    },
}
