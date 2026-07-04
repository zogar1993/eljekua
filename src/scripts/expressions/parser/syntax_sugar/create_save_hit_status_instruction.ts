import {SYSTEM_KEYWORD} from "scripts/expressions/parser/AST_NODE";
import type {HitStatus} from "scripts/battlegrid/player_turn_handler/HitStatus";
import type {Instruction} from "scripts/expressions/parser/instructions";

export const create_save_hit_status_instruction = (value: HitStatus): Instruction =>
    ({type: "save_variable", value: {type: "number", value}, label: SYSTEM_KEYWORD.HIT_STATUS})