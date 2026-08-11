import type {
    ADD_POWERS_COSTS,
    ADD_POWERS_FILTERS,
    COOLDOWNS,
    DEFENSES,
    INSTRUCTION_TYPES,
    INTERCEPTS,
    MELEE_TARGET_TYPES,
    POWER_KEYWORDS,
    POWER_TRAITS,
    RANGED_TARGET_TYPES,
    STATUS_DURATION_VALUES,
    STATUS_TYPES,
    TARGETING_TYPES,
    TRIGGER_TYPES,
} from "power_editor/constants";
import {ACTION_TYPE} from "scripts/battlegrid/creatures/ActionType";
import {INSTRUCTION_TYPE} from "scripts/expressions/parser/instructions";

export type PowerEditorState = {
    name: string
    description: string
    keywords: Array<typeof POWER_KEYWORDS[number]>
    prerequisites: Array<string>
    type: {
        action: typeof ACTION_TYPE[keyof typeof ACTION_TYPE]
        cooldown: typeof COOLDOWNS[number]
        attack: boolean
        traits: Array<typeof POWER_TRAITS[number]>
    }
    damage: {
        enabled: boolean
        lvl_1: string
        lvl_11: string
        lvl_21: string
    }
    targeting: {
        enabled: boolean
        targeting_type: typeof TARGETING_TYPES[number]
        target_type: typeof MELEE_TARGET_TYPES[number] | typeof RANGED_TARGET_TYPES[number]
        distance: string
        radius: string
        destination_requirement: string
        terrain_prerequisite: "" | "unoccupied"
        exclude_primary_target: boolean
    }
    trigger: {
        enabled: boolean
        type: typeof TRIGGER_TYPES[number]
        intercepts: Array<typeof INTERCEPTS[number]>
        conditions: Array<string>
    }
    roll: {
        enabled: boolean
        attack: string
        defense: typeof DEFENSES[number]
        before_consequences: Array<InstructionFormState>
        hit: Array<InstructionFormState>
        miss: Array<InstructionFormState>
    }
    effect: {
        enabled: boolean
        instructions: Array<InstructionFormState>
    }
}

export type InstructionFormState =
    | ApplyDamageFormState
    | SelectTargetFormState
    | MoveShiftFormState
    | ConditionFormState
    | OptionsFormState
    | SaveVariableFormState
    | SaveNumberAsResolvedFormState
    | ApplyStatusFormState
    | AddPowersAsOptionsFormState
    | PushFormState

type ApplyDamageFormState = {
    id: string
    type: typeof INSTRUCTION_TYPE.APPLY_DAMAGE
    value: string
    target: string
    half_damage: boolean
    damage_types: string
}

type SelectTargetFormState = {
    id: string
    type: typeof INSTRUCTION_TYPE.SELECT_TARGET
    target_label: string
    targeting_type: typeof TARGETING_TYPES[number]
    target_type: typeof MELEE_TARGET_TYPES[number] | typeof RANGED_TARGET_TYPES[number]
    distance: string
    radius: string
    destination_requirement: string
    terrain_prerequisite: "" | "unoccupied"
    exclude_primary_target: boolean
}

type MoveShiftFormState = {
    id: string
    type: typeof INSTRUCTION_TYPE.MOVE | typeof INSTRUCTION_TYPE.SHIFT
    destination: string
}

type ConditionFormState = {
    id: string
    type: typeof INSTRUCTION_TYPE.CONDITION
    condition: string
    instructions_true: Array<InstructionFormState>
    instructions_false: Array<InstructionFormState>
    has_false_branch: boolean
}

type OptionsFormState = {
    id: string
    type: typeof INSTRUCTION_TYPE.OPTIONS
    options: Array<{
        id: string
        text: string
        instructions: Array<InstructionFormState>
    }>
}

type SaveVariableFormState = {
    id: string
    type: typeof INSTRUCTION_TYPE.SAVE_VARIABLE
    value: string
    label: string
}

type SaveNumberAsResolvedFormState = {
    id: string
    type: typeof INSTRUCTION_TYPE.SAVE_NUMBER_AS_RESOLVED
    value: string
    label: string
}

type ApplyStatusFormState = {
    id: string
    type: typeof INSTRUCTION_TYPE.APPLY_STATUS
    target: string
    duration_mode: "single" | "multiple"
    duration: typeof STATUS_DURATION_VALUES[number]
    durations: Array<typeof STATUS_DURATION_VALUES[number]>
    status_type: typeof STATUS_TYPES[number]
    status_value: string
    against: string
}

type AddPowersAsOptionsFormState = {
    id: string
    type: typeof INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS
    creature: string
    cost: typeof ADD_POWERS_COSTS[number]
    filter: typeof ADD_POWERS_FILTERS[number]
}

type PushFormState = {
    id: string
    type: "push"
    amount: string
    target: string
}

let instruction_id_counter = 0;

export const create_instruction_id = () => `instruction_${++instruction_id_counter}`;

export const create_default_power_state = (): PowerEditorState => ({
    name: "",
    description: "",
    keywords: [],
    prerequisites: [],
    type: {
        action: ACTION_TYPE.STANDARD,
        cooldown: "at-will",
        attack: false,
        traits: [],
    },
    damage: {
        enabled: false,
        lvl_1: "",
        lvl_11: "",
        lvl_21: "",
    },
    targeting: {
        enabled: false,
        targeting_type: "melee_weapon",
        target_type: "enemy",
        distance: "1",
        radius: "1",
        destination_requirement: "",
        terrain_prerequisite: "",
        exclude_primary_target: false,
    },
    trigger: {
        enabled: false,
        type: "interruption",
        intercepts: [],
        conditions: [],
    },
    roll: {
        enabled: false,
        attack: "str",
        defense: "ac",
        before_consequences: [],
        hit: [],
        miss: [],
    },
    effect: {
        enabled: false,
        instructions: [],
    },
});

export const create_default_instruction = (type: typeof INSTRUCTION_TYPES[number]): InstructionFormState => {
    const id = create_instruction_id();

    switch (type) {
        case INSTRUCTION_TYPE.APPLY_DAMAGE:
            return {
                id,
                type,
                value: "",
                target: "primary_target",
                half_damage: false,
                damage_types: "",
            };
        case INSTRUCTION_TYPE.SELECT_TARGET:
            return {
                id,
                type,
                target_label: "primary_target",
                targeting_type: "melee_weapon",
                target_type: "enemy",
                distance: "1",
                radius: "1",
                destination_requirement: "",
                terrain_prerequisite: "",
                exclude_primary_target: false,
            };
        case INSTRUCTION_TYPE.MOVE:
        case INSTRUCTION_TYPE.SHIFT:
            return {id, type, destination: "primary_target"};
        case INSTRUCTION_TYPE.CONDITION:
            return {
                id,
                type,
                condition: "",
                instructions_true: [],
                instructions_false: [],
                has_false_branch: false,
            };
        case INSTRUCTION_TYPE.OPTIONS:
            return {id, type, options: []};
        case INSTRUCTION_TYPE.SAVE_VARIABLE:
            return {id, type, value: "", label: ""};
        case INSTRUCTION_TYPE.SAVE_NUMBER_AS_RESOLVED:
            return {id, type, value: "", label: ""};
        case INSTRUCTION_TYPE.APPLY_STATUS:
            return {
                id,
                type,
                target: "owner",
                duration_mode: "single",
                duration: "until_end_of_your_next_turn",
                durations: [],
                status_type: "grant_combat_advantage",
                status_value: "",
                against: "primary_target",
            };
        case INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS:
            return {
                id,
                type,
                creature: "owner",
                cost: "opportunity",
                filter: "melee_basic_attack",
            };
        case "push":
            return {id, type, amount: "1", target: "primary_target"};
    }
};
