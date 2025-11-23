import {InstructionSelectTarget} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {Position} from "scripts/battlegrid/Position";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {get_reach_movement} from "scripts/battlegrid/ranges/get_reach_movement";
import {get_reach_melee} from "scripts/battlegrid/ranges/get_reach_melee";
import {get_reach_adjacent} from "scripts/battlegrid/ranges/get_reach_adjacent";
import {get_reach_ranged} from "scripts/battlegrid/ranges/get_reach_ranged";
import {get_reach_area_burst} from "scripts/battlegrid/ranges/get_reach_area_burst";
import {get_reach_push} from "scripts/battlegrid/ranges/get_reach_push";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {Expr} from "scripts/expressions/evaluator/types";


export const get_reach = ({instruction, origin, battle_grid, evaluate_ast}: {
        instruction: InstructionSelectTarget,
        origin: Position,
        battle_grid: BattleGrid,
        evaluate_ast: (node: AstNode) => Expr
    }) => {
        //TODO P3 remove origin position
        switch (instruction.targeting_type) {
            case "movement": {
                return get_reach_movement({instruction, evaluate_ast, battle_grid})
            }
            case "melee_weapon":
                return get_reach_melee({origin, battle_grid})
            case "adjacent":
                return get_reach_adjacent({position: origin, battle_grid})
            case "ranged": {
                const distance = EXPR.as_number_resolved(evaluate_ast(instruction.distance))
                return get_reach_ranged({origin, distance: distance.value, battle_grid})
            }
            case "area_burst": {
                const distance = EXPR.as_number_resolved(evaluate_ast(instruction.distance))
                return get_reach_area_burst({origin, distance: distance.value, battle_grid})
            }
            case "push": {
                const anchor = EXPR.as_position(evaluate_ast(instruction.anchor))
                const origin = EXPR.as_position(evaluate_ast(instruction.origin))
                const distance = EXPR.as_number_resolved(evaluate_ast(instruction.distance)).value
                return get_reach_push({anchor, origin, distance, battle_grid})
            }
            default: {
                throw `targeting type '${(instruction as InstructionSelectTarget).type}' not supported`
            }
        }
    }