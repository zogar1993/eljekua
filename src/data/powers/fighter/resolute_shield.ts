import type {IRPower} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";

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
        lvl_1: '$add({1W},$attr_mod(owner, "str"))',
        lvl_21: '$add({2W},$attr_mod(owner, "str"))',
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "primary_damage",
                target: "primary_target"
            },
            {
                type: INSTRUCTION_TYPE.APPLY_STATUS,
                target: "owner",
                duration: "until_end_of_your_next_turn",
                status: {
                    type: "gain_resistance",
                    value: '$attr_mod(owner, "con")',
                    against_creatures: "primary_target",
                }
            }
        ],
    },
}
