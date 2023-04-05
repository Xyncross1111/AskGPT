import { RESTPostAPIApplicationGuildCommandsJSONBody, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'
import path from 'path'
import fsp from 'fs/promises'
import { Command, IAutocompletableCommand, IExecutableCommand } from '../commands/command'

export class CommandService {

    Commands: Record<string, string> = {}

    async getCommands(): Promise<RESTPostAPIApplicationGuildCommandsJSONBody[]> {
        const commandsDir = path.join(__dirname, '../commands')
        const commandFiles = await fsp.readdir(commandsDir)
        this.Commands = {}

        return <RESTPostAPIApplicationCommandsJSONBody[]> commandFiles.flatMap(file => {
            if (!file.endsWith('.js')) return []

            const commandPath = path.join(commandsDir, file)

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const CommandClass: (new () => Command | undefined) | undefined = require(commandPath)?.['default']
            if(!CommandClass) return []

            const commandInstance = new CommandClass()
            const metadata = commandInstance?.getCommandMetadata()
            if (!metadata) return []
            
            this.Commands[metadata.name] = commandPath

            const aliases = commandInstance?.getCommandAliasMetadata?.() ?? []
            for (const alias of aliases) {
                this.Commands[alias.name] = commandPath
            }

            return [metadata, ...aliases]
        })
    }

    resolveCommandClass(name: string): (new () => IExecutableCommand | IAutocompletableCommand) | undefined {
        const commandPath = this.Commands[name]
        if (!commandPath) return undefined
        return require(commandPath)?.['default']
    }
}
