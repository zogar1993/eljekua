import type {Power} from "../../types";
import {ALL_DEFENSES} from "../../types";

export const power: Power = {
    name: "Astral Seal",
    level: 1,
    class: "Cleric",
    range: {
        type: "ranged",
        range: 5
    },
    target: {
        type: "creature",
        amount: 1
    },
    happenings: [
        {
            type: "attack",
            attack: "wisdom_mod + 2",
            defense_code: "reflex",
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
                                    value: "owner(charisma_mod) + 2",
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