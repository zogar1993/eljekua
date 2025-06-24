import {tokenize} from "tokenizer/tokenize";
import {IRConsequence, Power} from "types";
import {Token} from "tokenizer/tokens/AnyToken";

const PRIMARY_TARGET_LABEL = "primary_target"

export const transform_power_ir_into_vm_representation = (power: Power): PowerVM => {
    const consequences: Array<Consequence> = [
        transform_primary_targeting(power.targeting),
        ...(power.roll ? [transform_roll(power.roll)] : []),
        ...(power.effect ? power.effect.map(transform_generic_consequence) : [])
    ]
    return {
        name: power.name,
        description: power.description,
        type: power.type,
        consequences: consequences
    }

}

export type PowerVM = {
    name: string
    description?: string
    type: {
        action: "standard" | "movement" | "minor" | "free"
        cooldown: "at-will" | "encounter" | "daily"
        attack: boolean
    }
    consequences: Array<Consequence>
}

export type ConsequenceSelectTarget = {
    type: "select_target"
    //TODO unbox
    targeting: {
        target_type: "enemy" | "terrain"
        amount: 1,
        exclude: Array<string>
        label: string
    } & ({
        type: "movement"
        distance: Token
    } | {
        type: "adjacent" | "melee_weapon"
    }),
}


export type ConsequenceAttackRoll = {
    type: "attack_roll"
    attack: Token
    defense: string
    hit: Array<Consequence>
}

export type ConsequenceOption = {
    type: "condition",
    condition: Token,
    consequences_true: Array<Consequence>
}

export type Consequence =
    {
        type: "apply_damage"
        value: Token
        target: string
    } |
    ConsequenceSelectTarget |
    ConsequenceAttackRoll |
    ConsequenceOption |
    {
        type: "move" | "shift"
        target: string
        destination: string
    }

const transform_primary_targeting = (targeting: Power["targeting"]): ConsequenceSelectTarget => {
//TODO make this cleaner
    if (targeting.type === "movement") {
        return {
            type: "select_target",
            targeting: {
                type: targeting.type,
                target_type: targeting.target_type,
                amount: targeting.amount,
                label: PRIMARY_TARGET_LABEL,
                exclude: [],
                distance: tokenize(targeting.distance)
            }
        }
    } else {
        return {
            type: "select_target",
            targeting: {
                type: targeting.type,
                target_type: targeting.target_type,
                amount: targeting.amount,
                label: PRIMARY_TARGET_LABEL,
                exclude: []
            }
        }
    }
}

const transform_roll = (roll: Required<Power>["roll"]): ConsequenceAttackRoll => {
    return {
        type: "attack_roll",
        attack: tokenize(standardize_roll_attributes(roll.attack)),
        defense: roll.defense,
        hit: roll.hit.map(transform_generic_consequence)
    }
}

const attributes = ["str", "con", "dex", "int", "wis", "cha"] as const
const standardize_roll_attributes = (text: string) =>
    attributes.reduce((text, attribute) => text.replaceAll(attribute, `owner.${attribute}_mod_lvl`), text)

const transform_generic_consequence = (consequence: IRConsequence): Consequence => {
    switch (consequence.type) {
        case "apply_damage":
            return {
                type: "apply_damage",
                value: tokenize(consequence.value),
                target: consequence.target
            }
        case "select_target":
            return {
                type: "select_target",
                targeting: {
                    type: consequence.targeting.type,
                    target_type: consequence.targeting.target_type,
                    amount: consequence.targeting.amount,
                    label: consequence.target_label,
                    exclude: consequence.targeting.exclude ?? [],
                }
            }
        case "move":
            return {
                type: "move",
                target: consequence.target,
                destination: consequence.destination
            }
        case "shift":
            return {
                type: "shift",
                target: consequence.target,
                destination: consequence.destination
            }
        case "condition": {
            return {
                type: "condition",
                condition: tokenize(consequence.condition),
                consequences_true: consequence.consequences_true.map(transform_generic_consequence)
            }
        }
        default:
            throw Error(`consequence invalid ${JSON.stringify(consequence)}`)
    }
}
