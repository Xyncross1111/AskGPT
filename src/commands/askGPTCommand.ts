import { CommandInteraction, CacheType, TextBasedChannel } from 'discord.js'
import { Command } from './command'
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types'
import { SlashCommandBuilder } from '@discordjs/builders'
import { Constants } from '../constants'
import { AskGPTService } from '../services/askGPTService'
  
export default class AskGPTCommand implements Command {
    getCommandMetadata(): RESTPostAPIApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName('askgpt')
            .setDescription('Generate a reponse from GPT 3.5')
            .addStringOption( option => (
                option
                    .setName('prompt')
                    .setDescription('Text prompt to generate response')
                    .setRequired(true)
            ))
            .addIntegerOption( option => (

                option
                    .setName('temperature')
                    .setDescription('Randomness of the output. Select between 0 and 10. Defaults to 5.')
                    .setRequired(false)
            ))
            .toJSON()
    }

    async execute(interaction: CommandInteraction<CacheType>): Promise<void> {

        if (interaction.channel?.id !== '1028139004153040937' && interaction.user.id !== Constants.OWNER_ID && interaction.user.id !== '743608980865286195')
        return

        await interaction.deferReply()

        const userPrompt = interaction.options.getString('prompt') as string
        let temp = interaction.options.getInteger('temperature')

        let gptApiService =  new AskGPTService()

        if (temp && temp < 10) gptApiService.temp = temp/10

        const response = await gptApiService.getGPTResponse({
            'role' : 'user',
            'content' : userPrompt
        })

        if ((<string> response).length > 2000) {

        await interaction.editReply(<string> response?.substring(0, 1999))
        await (interaction.channel as TextBasedChannel).send(<string> response?.substring(1999))

        } else {

            await interaction.editReply(<string> response)

        }

        await gptApiService.continueConversation(interaction)
    }
}