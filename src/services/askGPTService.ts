import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { Constants } from '../constants'
import { CommandInteraction, CacheType } from 'discord.js';
import { Bot } from '..';

export class AskGPTService {

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

        Bot.client.on('messageCreate', async message => {

            if (message.author.id === interaction.user.id && message.channel.id === interaction.channel?.id && message.mentions.users.first() == Bot.client.user) {

                if (message.content == `<@${Bot.client.user.id}> stop`) {
                    
                    Bot.client.removeAllListeners('messageCreate')
                    return
                }
                
                const newPrompt: ChatCompletionRequestMessage = {
                    'role' : 'user',
                    'content' : message.content.substring(22)
                }
    
                const response = await this.getGPTResponse(newPrompt)

                console.log('Conversation History', this.conversationHistory)
    
                message.reply(<string> response)
                     
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