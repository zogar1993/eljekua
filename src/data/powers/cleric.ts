import type {IRPower} from "core/types";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";

const cause_fear: IRPower = {
    name: "Cause Fear",
    class: "Cleric",
    level: 1,
    description: "Your holy symbol ignites with the fury of your god. Uncontrollable terror grips your enemy, causing it to instantly recoil.",
    keywords: ["Divine", "Fear", "Implement"],
    type: {
        action: "standard",
        cooldown: "encounter",
        attack: true,
    },
    targeting: {
        targeting_type: "ranged",
        target_type: "creature",
        amount: 1,
        distance: "10",
    },
    roll: {
        attack: "wis",
        defense: "will",
        hit: [
            {
                type: "push",
                amount: '$add($movement(primary_target), $attr_mod(owner, "cha"))',
                target_label: "primary_target",
            },
        ],
    },
}

export const CLERIC_POWERS = [cause_fear].map(transform_power_ir_into_vm_representation)
