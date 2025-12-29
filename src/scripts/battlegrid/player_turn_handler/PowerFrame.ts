import {Creature} from "scripts/battlegrid/creatures/Creature";
import {assert} from "scripts/assert";
import {Expr} from "scripts/expressions/evaluator/types";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {HIT_STATUS, HitStatus} from "scripts/battlegrid/player_turn_handler/HitStatus";
import {Instruction} from "scripts/expressions/parser/instructions";

export class PowerFrame {
    private variables: Map<string, Expr> = new Map()
    private instructions: Array<Instruction> = []
    readonly power_name
    status: HitStatus = HIT_STATUS.NONE

    constructor({name, instructions, owner}: {
        name: string,
        instructions: Array<Instruction>,
        owner: Creature
    }) {
        this.instructions = instructions
        this.power_name = name
        this.set_variable("owner", {type: "creatures", value: [owner]})
    }

    set_variable = (name: string, variable: Expr) => {
        this.variables.set(name, variable)
    }

    peek_instruction = (): Instruction => {
        assert(this.instructions.length > 0, () => "no instructions left when calling peek instruction")
        return this.instructions[0]
    }

    next_instruction = (): Instruction => {
        assert(this.instructions.length > 0, () => "no instructions left when calling next instruction")
        const [next, ...instructions] = this.instructions
        this.instructions = instructions
        return next
    }

    has_instructions = (): boolean => {
        return this.instructions.length > 0
    }

    has_variable = (name: string): boolean => {
        return this.variables.has(name)
    }

    add_instructions = (instructions: Array<Instruction>): void => {
        this.instructions = [...instructions, ...this.instructions]
    }

    get_variable = (name: string) => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        return variable
    }
}
