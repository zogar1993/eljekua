import {Power} from "types";
import {transform_power_ir_into_vm_representation} from "tokenizer/transform_power_ir_into_vm_representation";

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

export const WIZARD_POWERS = [magic_missile].map(transform_power_ir_into_vm_representation)