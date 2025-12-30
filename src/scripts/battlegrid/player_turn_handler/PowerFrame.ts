import {Creature} from "scripts/battlegrid/creatures/Creature";
import {assert} from "scripts/assert";
import {Expr} from "scripts/expressions/evaluator/types";7
import {HIT_STATUS, HitStatus} from "scripts/battlegrid/player_turn_handler/HitStatus";
import {Instruction} from "scripts/expressions/parser/instructions";
import {SYSTEM_KEYWORD} from "scripts/expressions/parser/AST_NODE";

export const create_power_frame = ({name, instructions, owner}: {
    name: string,
    instructions: Array<Instruction>,
    owner: Creature
}): PowerFrame => {
    const self = {
        instructions: [...instructions],
        status: HIT_STATUS.NONE as HitStatus,
        variables: new Map<string, Expr>(),
    }

    const set_variable = (name: string, variable: Expr) => {
        self.variables.set(name, variable)
    }

    const peek_instruction = (): Instruction => {
        assert(self.instructions.length > 0, () => "no instructions left when calling peek instruction")
        return self.instructions[0]
    }

    const next_instruction = (): Instruction => {
        assert(self.instructions.length > 0, () => "no instructions left when calling next instruction")
        const [next, ...instructions] = self.instructions
        self.instructions = instructions
        return next
    }

    const has_instructions = (): boolean => {
        return self.instructions.length > 0
    }

    const has_variable = (name: string): boolean => {
        return self.variables.has(name)
    }

    const add_instructions = (instructions: Array<Instruction>): void => {
        self.instructions = [...instructions, ...self.instructions]
    }

    const get_variable = (name: string): Expr => {
        const variable = self.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        return variable
    }

    set_variable(SYSTEM_KEYWORD.OWNER, {type: "creatures", value: [owner]})

    return {
        set_variable,
        peek_instruction,
        next_instruction,
        has_instructions,
        has_variable,
        add_instructions,
        get_variable,
        power_name: name,
    }
}

export type PowerFrame = {
    set_variable: (name: string, variable: Expr) => void
    peek_instruction: () => Instruction
    next_instruction: () => Instruction
    has_instructions: () => boolean
    has_variable: (name: string) => boolean
    add_instructions: (instructions: Array<Instruction>) => void
    get_variable: (name: string) => Expr
    power_name: string
}
