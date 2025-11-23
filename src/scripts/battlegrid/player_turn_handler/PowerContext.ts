import {Instruction} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {assert} from "scripts/assert";

import {Expr} from "scripts/expressions/token_evaluator/types";
import {EXPR} from "scripts/expressions/token_evaluator/EXPR";

export class PowerContext {
    private variables: Map<string, Expr> = new Map()
    private instructions: Array<Instruction> = []
    readonly power_name
    status: "none" | "hit" | "miss" = "none"

    constructor({name, instructions, owner}: {
        name: string,
        instructions: Array<Instruction>,
        owner: Creature
    }) {
        this.instructions = instructions
        this.power_name = name
        this.set_variable("owner", {type: "creatures", value: [owner], description: "owner"})
    }

    owner = () => EXPR.as_creature(this.get_variable("owner"))

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
