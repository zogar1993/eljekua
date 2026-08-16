import type {IRInstruction, IRPower} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import type {InstructionFormState, PowerEditorState} from "power_editor/form_state";

export type ValidationIssue = {
    path: string
    message: string
}

const parse_number_or_string = (value: string): string | number => {
    const trimmed = value.trim();
    if (trimmed === "") return "";
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? trimmed : parsed;
};

const split_comma_list = (value: string): Array<string> =>
    value.split(",").map(item => item.trim()).filter(Boolean);

const serialize_targeting = (state: PowerEditorState["targeting"]) => {
    const {targeting_type} = state;

    switch (targeting_type) {
        case "adjacent":
        case "melee_weapon":
            return {
                targeting_type,
                target_type: state.target_type as "enemy" | "creature",
                amount: 1 as const,
                ...(state.exclude_primary_target ? {exclude: ["primary_target"] as ["primary_target"]} : {}),
            };
        case "movement":
            return {
                targeting_type,
                distance: parse_number_or_string(state.distance),
                ...(state.destination_requirement.trim()
                    ? {destination_requirement: state.destination_requirement.trim()}
                    : {}),
            };
        case "ranged":
            return {
                targeting_type,
                target_type: state.target_type as "terrain" | "enemy" | "creature",
                amount: 1 as const,
                distance: parse_number_or_string(state.distance),
                ...(state.terrain_prerequisite ? {terrain_prerequisite: state.terrain_prerequisite} : {}),
                ...(state.exclude_primary_target ? {exclude: ["primary_target"] as ["primary_target"]} : {}),
            };
        case "area_burst":
            return {
                targeting_type,
                target_type: "creature" as const,
                amount: "all" as const,
                distance: Number(state.distance),
                radius: Number(state.radius),
            };
    }
};

const serialize_select_target = (instruction: Extract<InstructionFormState, {type: typeof INSTRUCTION_TYPE.SELECT_TARGET}>) => {
    const base = {
        type: INSTRUCTION_TYPE.SELECT_TARGET,
        target_label: instruction.target_label.trim(),
    };

    switch (instruction.targeting_type) {
        case "adjacent":
        case "melee_weapon":
            return {
                ...base,
                targeting_type: instruction.targeting_type,
                target_type: instruction.target_type as "enemy" | "creature",
                amount: 1 as const,
                ...(instruction.exclude_primary_target ? {exclude: ["primary_target"] as ["primary_target"]} : {}),
            };
        case "movement":
            return {
                ...base,
                targeting_type: instruction.targeting_type,
                distance: parse_number_or_string(instruction.distance),
                ...(instruction.destination_requirement.trim()
                    ? {destination_requirement: instruction.destination_requirement.trim()}
                    : {}),
            };
        case "ranged":
            return {
                ...base,
                targeting_type: instruction.targeting_type,
                target_type: instruction.target_type as "terrain" | "enemy" | "creature",
                amount: 1 as const,
                distance: parse_number_or_string(instruction.distance),
                ...(instruction.terrain_prerequisite ? {terrain_prerequisite: instruction.terrain_prerequisite} : {}),
                ...(instruction.exclude_primary_target ? {exclude: ["primary_target"] as ["primary_target"]} : {}),
            };
        case "area_burst":
            return {
                ...base,
                targeting_type: instruction.targeting_type,
                target_type: "creature" as const,
                amount: "all" as const,
                distance: Number(instruction.distance),
                radius: Number(instruction.radius),
            };
    }
};

const serialize_instruction = (instruction: InstructionFormState): IRInstruction => {
    switch (instruction.type) {
        case INSTRUCTION_TYPE.APPLY_DAMAGE:
            return {
                type: instruction.type,
                value: instruction.value.trim(),
                target: instruction.target.trim(),
                ...(instruction.half_damage ? {half_damage: true} : {}),
                ...(instruction.damage_types.trim()
                    ? {damage_types: split_comma_list(instruction.damage_types)}
                    : {}),
            };
        case INSTRUCTION_TYPE.SELECT_TARGET:
            return serialize_select_target(instruction);
        case INSTRUCTION_TYPE.MOVE:
        case INSTRUCTION_TYPE.SHIFT:
            return {
                type: instruction.type,
                target: "owner",
                destination: instruction.destination.trim(),
            };
        case INSTRUCTION_TYPE.CONDITION:
            return {
                type: instruction.type,
                condition: instruction.condition.trim(),
                instructions_true: instruction.instructions_true.map(serialize_instruction),
                ...(instruction.has_false_branch
                    ? {instructions_false: instruction.instructions_false.map(serialize_instruction)}
                    : {}),
            };
        case INSTRUCTION_TYPE.OPTIONS:
            return {
                type: instruction.type,
                options: instruction.options.map(option => ({
                    text: option.text.trim(),
                    instructions: option.instructions.map(serialize_instruction),
                })),
            };
        case INSTRUCTION_TYPE.SAVE_VARIABLE:
            return {
                type: instruction.type,
                value: instruction.value.trim(),
                label: instruction.label.trim(),
            };
        case INSTRUCTION_TYPE.SAVE_NUMBER_AS_RESOLVED:
            return {
                type: instruction.type,
                value: instruction.value.trim(),
                label: instruction.label.trim(),
            };
        case INSTRUCTION_TYPE.APPLY_STATUS:
            return {
                type: instruction.type,
                target: instruction.target.trim(),
                duration: instruction.duration_mode === "single"
                    ? instruction.duration
                    : instruction.durations,
                status: instruction.status_type === "grant_combat_advantage"
                    ? {
                        type: instruction.status_type,
                        against: instruction.against.trim(),
                    }
                    : {
                        type: instruction.status_type,
                        value: parse_number_or_string(instruction.status_value),
                        against: instruction.against.trim(),
                    },
            };
        case INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS:
            return {
                type: instruction.type,
                creature: instruction.creature.trim(),
                cost: instruction.cost,
                filter: instruction.filter,
            };
        case "push":
            return {
                type: instruction.type,
                amount: Number(instruction.amount),
                target: instruction.target.trim(),
            };
    }
};

export const serialize_power = (state: PowerEditorState): IRPower => {
    const power: IRPower = {
        name: state.name.trim(),
        type: {
            action: state.type.action,
            cooldown: state.type.cooldown,
            attack: state.type.attack,
            ...(state.type.traits.length > 0 ? {traits: [...state.type.traits]} : {}),
        },
    };

    if (state.description.trim()) power.description = state.description.trim();
    if (state.keywords.length > 0) power.keywords = [...state.keywords];
    if (state.prerequisites.length > 0) power.prerequisites = [...state.prerequisites];

    if (state.damage.enabled && state.damage.lvl_1.trim()) {
        power.damage = {
            lvl_1: state.damage.lvl_1.trim(),
            ...(state.damage.lvl_11.trim() ? {lvl_11: state.damage.lvl_11.trim()} : {}),
            ...(state.damage.lvl_21.trim() ? {lvl_21: state.damage.lvl_21.trim()} : {}),
        };
    }

    if (state.targeting.enabled) {
        power.targeting = serialize_targeting(state.targeting);
    }

    if (state.trigger.enabled) {
        power.trigger = {
            type: state.trigger.type,
            intercepts: [...state.trigger.intercepts],
            conditions: state.trigger.conditions.map(condition => condition.trim()).filter(Boolean),
        };
    }

    if (state.roll.enabled) {
        power.roll = {
            attack: state.roll.attack.trim(),
            defense: state.roll.defense,
            ...(state.roll.before_consequences.length > 0
                ? {before_consequences: state.roll.before_consequences.map(serialize_instruction)}
                : {}),
            hit: state.roll.hit.map(serialize_instruction),
            ...(state.roll.miss.length > 0 ? {miss: state.roll.miss.map(serialize_instruction)} : {}),
        };
    }

    if (state.effect.enabled && state.effect.instructions.length > 0) {
        power.effect = state.effect.instructions.map(serialize_instruction);
    }

    return power;
};

export const validate_power = (state: PowerEditorState): Array<ValidationIssue> => {
    const issues: Array<ValidationIssue> = [];

    if (!state.name.trim()) {
        issues.push({path: "name", message: "Name is required."});
    }

    if (state.damage.enabled && !state.damage.lvl_1.trim()) {
        issues.push({path: "damage.lvl_1", message: "Damage lvl_1 is required when damage is enabled."});
    }

    if (state.targeting.enabled) {
        if (state.targeting.targeting_type === "area_burst") {
            if (!state.targeting.distance.trim() || Number.isNaN(Number(state.targeting.distance))) {
                issues.push({path: "targeting.distance", message: "Area burst distance must be a number."});
            }
            if (!state.targeting.radius.trim() || Number.isNaN(Number(state.targeting.radius))) {
                issues.push({path: "targeting.radius", message: "Area burst radius must be a number."});
            }
        }
        if ((state.targeting.targeting_type === "movement" || state.targeting.targeting_type === "ranged")
            && !state.targeting.distance.trim()) {
            issues.push({path: "targeting.distance", message: "Distance is required for this targeting type."});
        }
    }

    if (state.trigger.enabled) {
        if (state.trigger.intercepts.length === 0) {
            issues.push({path: "trigger.intercepts", message: "At least one intercept is required."});
        }
        if (state.trigger.conditions.length === 0) {
            issues.push({path: "trigger.conditions", message: "At least one condition is required."});
        }
    }

    if (state.roll.enabled) {
        if (!state.roll.attack.trim()) {
            issues.push({path: "roll.attack", message: "Attack expression is required when roll is enabled."});
        }
        if (state.roll.hit.length === 0) {
            issues.push({path: "roll.hit", message: "At least one hit instruction is required when roll is enabled."});
        }
    }

    validate_instructions(state.roll.before_consequences, "roll.before_consequences", issues);
    validate_instructions(state.roll.hit, "roll.hit", issues);
    validate_instructions(state.roll.miss, "roll.miss", issues);
    validate_instructions(state.effect.instructions, "effect", issues);

    return issues;
};

const validate_instructions = (
    instructions: Array<InstructionFormState>,
    path_prefix: string,
    issues: Array<ValidationIssue>,
) => {
    for (const [index, instruction] of instructions.entries()) {
        const path = `${path_prefix}[${index}]`;
        validate_instruction(instruction, path, issues);
    }
};

const validate_instruction = (
    instruction: InstructionFormState,
    path: string,
    issues: Array<ValidationIssue>,
) => {
    switch (instruction.type) {
        case INSTRUCTION_TYPE.APPLY_DAMAGE:
            if (!instruction.value.trim()) issues.push({path: `${path}.value`, message: "Damage value is required."});
            if (!instruction.target.trim()) issues.push({path: `${path}.target`, message: "Target is required."});
            break;
        case INSTRUCTION_TYPE.SELECT_TARGET:
            if (!instruction.target_label.trim()) {
                issues.push({path: `${path}.target_label`, message: "Target label is required."});
            }
            if (instruction.targeting_type === "area_burst") {
                if (!instruction.distance.trim() || Number.isNaN(Number(instruction.distance))) {
                    issues.push({path: `${path}.distance`, message: "Distance must be a number."});
                }
                if (!instruction.radius.trim() || Number.isNaN(Number(instruction.radius))) {
                    issues.push({path: `${path}.radius`, message: "Radius must be a number."});
                }
            }
            break;
        case INSTRUCTION_TYPE.MOVE:
        case INSTRUCTION_TYPE.SHIFT:
            if (!instruction.destination.trim()) {
                issues.push({path: `${path}.destination`, message: "Destination is required."});
            }
            break;
        case INSTRUCTION_TYPE.CONDITION:
            if (!instruction.condition.trim()) {
                issues.push({path: `${path}.condition`, message: "Condition is required."});
            }
            validate_instructions(instruction.instructions_true, `${path}.instructions_true`, issues);
            if (instruction.has_false_branch) {
                validate_instructions(instruction.instructions_false, `${path}.instructions_false`, issues);
            }
            break;
        case INSTRUCTION_TYPE.OPTIONS:
            if (instruction.options.length === 0) {
                issues.push({path: `${path}.options`, message: "At least one option is required."});
            }
            for (const [option_index, option] of instruction.options.entries()) {
                if (!option.text.trim()) {
                    issues.push({
                        path: `${path}.options[${option_index}].text`,
                        message: "Option text is required.",
                    });
                }
                validate_instructions(option.instructions, `${path}.options[${option_index}].instructions`, issues);
            }
            break;
        case INSTRUCTION_TYPE.SAVE_VARIABLE:
        case INSTRUCTION_TYPE.SAVE_NUMBER_AS_RESOLVED:
            if (!instruction.value.trim()) issues.push({path: `${path}.value`, message: "Value is required."});
            if (!instruction.label.trim()) issues.push({path: `${path}.label`, message: "Label is required."});
            break;
        case INSTRUCTION_TYPE.APPLY_STATUS:
            if (!instruction.target.trim()) issues.push({path: `${path}.target`, message: "Target is required."});
            if (instruction.duration_mode === "multiple" && instruction.durations.length === 0) {
                issues.push({path: `${path}.duration`, message: "Select at least one duration."});
            }
            if (instruction.status_type !== "grant_combat_advantage" && !instruction.status_value.trim()) {
                issues.push({path: `${path}.status_value`, message: "Status value is required."});
            }
            if (!instruction.against.trim()) issues.push({path: `${path}.against`, message: "Against is required."});
            break;
        case INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS:
            if (!instruction.creature.trim()) issues.push({path: `${path}.creature`, message: "Creature is required."});
            break;
        case "push":
            if (!instruction.amount.trim() || Number.isNaN(Number(instruction.amount))) {
                issues.push({path: `${path}.amount`, message: "Push amount must be a number."});
            }
            if (!instruction.target.trim()) issues.push({path: `${path}.target`, message: "Target is required."});
            break;
    }
};
