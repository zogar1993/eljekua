export const FUNCTION_NAME = {
    EXISTS: "exists",
    OR: "or",
    AND: "and",
    ADD: "add",
    DISTANCE: "distance",
    ARE_ENEMIES: "are_enemies",
    IS_ALLY: "is_ally",
    IS_MONSTER_TEMPLATE: "is_monster_template",
    HAS_ACTION_TYPE_AVAILABLE: "has_action_type_available",
    IS_LOWER_OR_EQUAL: "is_lower_or_equal",
    IS_GREATER_OR_EQUAL: "is_greater_or_equal",
    IS_LOWER: "is_lower",
    IS_GREATER: "is_greater",
    NOT_EQUALS: "not_equals",
    EQUIPPED: "equipped",
    HAS_VALID_TARGETING: "has_valid_targeting",
    OPPORTUNITY_ATTACK_RANGE: "opportunity_attack_range",
    CREATURE_BY_ID: "creature_by_id",
    CAN_EXPEND_ACTION_TYPE: "can_expend_action_type",
} as const

export type FunctionName = typeof FUNCTION_NAME[keyof typeof FUNCTION_NAME]

export const FUNCTION_NAMES = Object.values(FUNCTION_NAME) as Array<FunctionName>
