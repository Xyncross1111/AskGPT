import { REST } from '@discordjs/rest'
import { RESTPatchAPIApplicationCommandJSONBody, Routes } from 'discord-api-types/v9'
import { Client, Intents } from 'discord.js'
import { Constants } from './constants'
import { CommandService } from './services/commandService'
import { IAutocompletableCommand, IExecutableCommand } from './commands/command'

class DiscordBotHandler {

    client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
        ],
        partials: [
            'MESSAGE',
            'CHANNEL'
        ],
        retryLimit: 2,
        restGlobalRateLimit: 50,
        allowedMentions: { repliedUser: true }
    })

    restClient = new REST({ version: '9' }).setToken(Constants.DISCORD_BOT_TOKEN)

    CommandService = new CommandService()

    constructor() {
        console.log('Initialized a new Bot Handler')
    }

    async initialize() {    
        try {

            this.registerCommands([ ...await this.CommandService.getCommands() ])

            this.client.once('ready', async () => {
                console.log('Bot Ready!')
            })

            this.client.on('interactionCreate', async interaction => {

                try {

                    if (interaction.isCommand() || interaction.isAutocomplete()) {

                        const CommandClass = this.CommandService.resolveCommandClass(interaction.commandName)
                        if (!CommandClass) return

                        const commandInstance: IExecutableCommand | IAutocompletableCommand = new CommandClass()

                        if (interaction.isCommand() && (commandInstance as IExecutableCommand).execute)

                            await (commandInstance as IExecutableCommand).execute(interaction)

                        else if (interaction.isAutocomplete() && (commandInstance as IAutocompletableCommand).handleAutocomplete)

                            await (commandInstance as IAutocompletableCommand).handleAutocomplete(interaction)

                    }

                } catch (error: any) {

                    if (!interaction.isCommand() && !interaction.isSelectMenu() && !interaction.isMessageComponent()) {
                        console.error(error)
                        return
                    }

                    try {
                        if (interaction.replied || interaction.deferred) {

                            await interaction.editReply({ embeds: [{ title: 'Error', description: error.message }] })
                        } else {

                            await interaction.reply({ embeds: [{ title: 'Error', description: error.message }], ephemeral: true })
                        }
                    } catch (err: any) {

                        console.error(err)
                    }
                }
            })

            this.client.on('error', async error => {
                console.error(error)
            })

            await this.client.login(Constants.DISCORD_BOT_TOKEN)

        } catch (error: any) {

            console.log('Could Not log ')
            console.error(error)

            this.client.destroy()

            process.exit(1)
        }
    }

    async registerCommands(commands: RESTPatchAPIApplicationCommandJSONBody[]) {
        const hashSet: Record<string, RESTPatchAPIApplicationCommandJSONBody> = {}

        console.log(`Registering Commands:   Name`)
        for (const command of commands) {
            if (!command.name) continue
            hashSet[command.name] = command
            console.log(`                      ${command.name}`)
        }

        await this.restClient.put(Routes.applicationGuildCommands(Constants.DISCORD_CLIENT_ID, Constants.GUILD_ID), { body: Object.values(hashSet) })
    }
}

export const bot = new DiscordBotHandler()
bot.initialize()
