import {Consequence, ConsequenceAddPowers} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_add_powers = ({
                                         consequence,
                                         context,
                                     }: InterpretConsequenceProps<ConsequenceAddPowers>) => {
    const creature = context.get_creature(consequence.creature)

    context.add_consequences([{
        type: "options",
        options: [
            ...creature.data.powers.map(power => {
                const power_name = power.name.replaceAll(" ", "_").toLowerCase()
                context.set_variable({name: power_name, type: "power", value: power})
                return {
                    text: power.name,
                    consequences: [
                        {
                            type: "execute_power",
                            power: power_name
                        }
                    ] as Array<Consequence>,
                    //condition: tokenize(`$has_valid_targets(${power_name})`)
                }
            }),
            {
                text: "Cancel",
                consequences: [],
            }
        ]
    }])

    // const first_consequence = action.consequences[0]

//TODO 0 add condition validation
//         if (first_consequence.type === "select_target") {
//             const valid_targets = this.get_valid_targets({consequence: first_consequence, context})
//             result.disabled = valid_targets.length === 0
//         }
}