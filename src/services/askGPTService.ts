import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { Constants } from '../constants'
import { CommandInteraction, CacheType } from 'discord.js';
import { bot } from '..';

export class AskGPTService {

    time = Date.now()

    config = new Configuration ({
        organization: Constants.OPENAI_ORG,
        apiKey: Constants.OPENAI_KEY
    });

    openai = new OpenAIApi(this.config)

    temp: number = 0.5;

    conversationHistory: ChatCompletionRequestMessage[] = [{
        'role' : 'system', 'content' : 'You are a helpul assistant. Answer as concisely as possible.'
    }]

    async getGPTResponse (userPrompt: ChatCompletionRequestMessage) {

        let finalResponse

        this.conversationHistory.push(userPrompt)

        try {
            const gptResponse = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: this.responseMessages(this.conversationHistory),
                temperature: this.temp
            })
    
            finalResponse = <string> gptResponse.data.choices[0].message?.content
    
            console.log(`P: ${gptResponse.data.usage?.prompt_tokens} C: ${gptResponse.data.usage?.completion_tokens} T: ${gptResponse.data.usage?.total_tokens}`)

            this.conversationHistory.push({
                'role' : 'assistant',
                'content' : finalResponse
            })

            return finalResponse
    
        } catch (error) {
    
            console.error(error)
            return
        }

    }

    async continueConversation(interaction: CommandInteraction<CacheType>) {

        bot.client.on('messageCreate', async message => {

            if (message.author.id === interaction.user.id && message.channel.id === interaction.channel?.id && message.mentions.users.first() == bot.client.user) {

                if (message.content == `<@${bot.client.user.id}> stop`) {

                    message.reply('Ending Conversation, thanks for talking to me!')
                    
                    bot.client.removeAllListeners('messageCreate')
                    return
                }
                
                const newPrompt: ChatCompletionRequestMessage = {
                    'role' : 'user',
                    'content' : message.content.substring(23)
                }
    
                const response = await this.getGPTResponse(newPrompt) as string

                console.log('Conversation History', this.conversationHistory)

                if ( response?.length > 2000 ) {

                    message.reply(response?.substring(0, 1999))
                    message.channel.send(response.substring(1999))

                } else {
                    message.reply(<string> response)
                }
                     
            }
        })
    }

    responseMessages (messageHistory: ChatCompletionRequestMessage[]) {

        let contextMessages: ChatCompletionRequestMessage[] = [{'role' : 'system', 'content' : 'Answer as concisely as possible.'}]

        if (messageHistory.length > 5 ) {

            for ( let i = messageHistory.length - 5; i < messageHistory.length; i++) {

                contextMessages.push(messageHistory[i])
            }

            return contextMessages

        } else return messageHistory
    }
}