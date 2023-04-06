import dotenv from 'dotenv'

class _Constants {
    constructor() {
        dotenv.config()
    }

    // Token of your discord bot.
    get DISCORD_BOT_TOKEN(): string {
        return this.fromEnvConfig('DISCORD_BOT_TOKEN')
    }

    // User ID of your bot user account.
    get DISCORD_CLIENT_ID(): string {
        return this.fromEnvConfig('DISCORD_CLIENT_ID')
    }

    // User ID of the bot owner.
    get OWNER_ID(): string {
        return this.fromEnvConfig('OWNER_ID')
    }

    // OpenAI API key.
    get OPENAI_KEY(): string {
        return this.fromEnvConfig('OPENAI_KEY')
    }

    // OpenAI Organization key.
    get OPENAI_ORG(): string {
        return this.fromEnvConfig('OPENAI_ORG')
    }

    // ID of the discord server to deploy commands
    get GUILD_ID(): string {
        return this.fromEnvConfig('GUILD_ID')
    }

    fromEnvConfig(key: string): string {
        const value = process.env[key]
        if(value !== undefined) return value

        console.log(`ERROR: ENV VARIABLE "${key}" NOT PRESENT.`)
        return ''
    }
}

export const Constants = new _Constants()