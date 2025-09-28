import type {Power} from "types";

export const power_shield_faint: Power = {
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
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: `$add($lvl_damage(21,{1W},{2W}),owner.str_mod)`,
                target: "primary_target"
            },
            {
                type: "apply_status",
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
