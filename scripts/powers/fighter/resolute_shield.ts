import type {Power} from "types";

export const power_resolute_shield: Power = {
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
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "$add($lvl_damage(21,{1W},{2W}),owner.str_mod)",
                target: "primary_target"
            },
            {
                type: "apply_status",
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
