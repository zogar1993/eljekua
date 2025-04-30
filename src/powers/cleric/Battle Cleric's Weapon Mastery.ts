import type {Power} from "../../types";
import {ALL_DEFENSES} from "../../types";

export const power: Power = {
    name: "Battle Cleric's Weapon Mastery",
    level: 1,
    class: "Cleric",
    range: {
        type: "melee",
        range: 5
    },
    target: {
        type: "creature",
        amount: 1
    },
    happenings: [
        {
            type: "attack",
            attack: {
                left: "wisdom_mod",
                operator: "+",
                right: 2
            },
            defense: "reflex",
            hit: [
                {
                    type: "apply_condition",
                    passive_effects: [
                        {
                            type: "modify_defenses",
                            defenses: ALL_DEFENSES,
                            value: -2
                        }
                    ],
                    reactive_effects: [
                        {
                            type: "trigger",
                            trigger: "hit_by_ally",
                            effect: [
                                {
                                    type: "regain_hit_points",
                                    target: "triggerer",
                                    value: {
                                        left: "owner(charisma_mod)",
                                        operator: "+",
                                        right: 2
                                    },
                                    consume_self: true
                                }
                            ]
                        }
                    ],
                    duration: "EoNT"
                }
            ]
        }
    ]
}