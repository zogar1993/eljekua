import {Instruction} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {assert} from "scripts/assert";

import {AstNode} from "scripts/expressions/token_evaluator/types";
import {NODE} from "scripts/expressions/token_evaluator/NODE";

export class PowerContext {
    private variables: Map<string, AstNode> = new Map()
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
        this.set_variable("owner", {type: "creature", value: owner, description: "owner"})
    }

    owner = () => NODE.as_creature(this.get_variable("owner")).value

    set_variable = (name: string, variable: AstNode) => {
        this.variables.set(name, variable)
    }

    //TODO P3 move this out of power context, we dont need it anymore
    get_creature = (name: string): Creature => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        return NODE.as_creature(variable).value
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
