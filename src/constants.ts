import dotenv from 'dotenv'

class _Constants {
    constructor() {
        dotenv.config()
    }

    get DISCORD_BOT_TOKEN(): string {
        return this.fromEnvConfig('DISCORD_BOT_TOKEN')
    }

    get DISCORD_CLIENT_ID(): string {
        return this.fromEnvConfig('DISCORD_CLIENT_ID')
    }

    get OWNER_ID(): string {
        return this.fromEnvConfig('OWNER_ID')
    }

    get OPENAI_KEY(): string {
        return this.fromEnvConfig('OPENAI_KEY')
    }

    get OPENAI_ORG(): string {
        return this.fromEnvConfig('OPENAI_ORG')
    }

    fromEnvConfig(key: string): string {
        const value = process.env[key]
        if(value !== undefined) return value

        console.log(`ERROR: ENV VARIABLE "${key}" NOT PRESENT.`)
        return ''
    }
}

export const Constants = new _Constants()