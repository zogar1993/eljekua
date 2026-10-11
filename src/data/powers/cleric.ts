import type {IRPower} from "core/types";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";

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
                type: INSTRUCTION_TYPE.SAVE_VARIABLE,
                label: "cause_fear__forced_movement",
                power: {
                    name: "Flee",
                    type: {
                        action: "free",
                        //TODO this can be removed and set as "at-will" by default
                        cooldown: "at-will",
                        //TODO this can be removed and set as false by default
                        attack: false,
                    },
                    targeting: {
                        targeting_type: "movement",
                        distance: '$add($movement(owner), $attr_mod(attacker, "cha"))',
                        destination_requirement: "$positions_farther_from($position(attacker))",
                    },
                    effect: [
                        {
                            type: INSTRUCTION_TYPE.WALK,
                            target_label: "owner",
                            destination_label: "primary_target",
                        }
                    ],
                },
            },
            {
                type: INSTRUCTION_TYPE.EXECUTE_POWER,
                power_label: "cause_fear__forced_movement",
                initialization: [
                    {from_label: "primary_target", to_label: "owner"},
                    {from_label: "owner", to_label: "attacker"},
                ],
            }
        ],
    },
}

export const CLERIC_POWERS = [cause_fear].map(transform_power_ir_into_vm_representation)
