import {assert_is_footprint_one} from "core/battlegrid/Position";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {get_reach_movement} from "core/battlegrid/position/get_reach_movement";
import {get_reach_melee} from "core/battlegrid/position/get_reach_melee";
import {get_reach_adjacent} from "core/battlegrid/position/get_reach_adjacent";
import {get_reach_ranged} from "core/battlegrid/position/get_reach_ranged";
import {get_reach_area_burst} from "core/battlegrid/position/get_reach_area_burst";
import {get_reach_push} from "core/battlegrid/position/get_reach_push";
import {BattleGrid} from "core/battlegrid/BattleGrid";
import {AstNode} from "core/expressions/parser/nodes/AstNode";
import {Expr} from "core/virtual_machine/expressions/types";
import {AST} from "core/virtual_machine/expressions/AST_NODE";
import {InstructionSelectTarget} from "core/virtual_machine/instructions/instructions";


export const get_reach = ({instruction, battle_grid, evaluate_ast}: {
    instruction: InstructionSelectTarget,
    battle_grid: BattleGrid,
    evaluate_ast: (node: AstNode) => Expr
}) => {
    switch (instruction.targeting_type) {
        case "movement": {
            const creature = EXPR.as_creature(evaluate_ast(AST.OWNER))
            const distance = EXPR.as_number(evaluate_ast(instruction.distance))
            return get_reach_movement({creature, distance, battle_grid})
        }
        case "melee_weapon": {
            const origin = EXPR.as_creature(evaluate_ast(AST.OWNER)).data.position
            return get_reach_melee({origin, battle_grid})
        }
        case "adjacent": {
            const origin = EXPR.as_creature(evaluate_ast(AST.OWNER)).data.position
            return get_reach_adjacent({origin, battle_grid})
        }
        case "ranged": {
            const origin = EXPR.as_creature(evaluate_ast(AST.OWNER)).data.position
            const distance = EXPR.as_number(evaluate_ast(instruction.distance))
            return get_reach_ranged({origin, distance, battle_grid})
        }
        case "area_burst": {
            const origin = EXPR.as_creature(evaluate_ast(AST.OWNER)).data.position
            assert_is_footprint_one(origin)
            const distance = EXPR.as_number(evaluate_ast(instruction.distance))
            return get_reach_area_burst({origin, distance, battle_grid})
        }
        case "push": {
            const anchor = EXPR.as_position(evaluate_ast(instruction.anchor))
            const defender = EXPR.as_creature(evaluate_ast(instruction.defender))
            const distance = EXPR.as_number(evaluate_ast(instruction.distance))
            return get_reach_push({anchor, defender, distance, battle_grid})
        }
        default: {
            throw `targeting type '${(instruction as InstructionSelectTarget).type}' not supported`
        }
    }
}