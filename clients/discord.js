const Discord = require('discord.js')
const {
    Member
} = require('../abstract')

class DiscordClient {
    /**
     * 
     * @param {function(string): Promise<string>} handleDirectMessage 
     */
    constructor(handleDirectMessage, handleGlobalMessage) {
        this._client = new Discord.Client()
        this.ready = new Promise((resolve, reject) => {
            this._client.on('ready', () => {
                resolve()
            })
            this._client.on("error", ()=>{
                reject()
            })
        })
        this._client.on('message', async function (message) {
            var response, author
            try {
                author = await Member.findBy('discordid', message.author.id)
            } catch (err) {
                author = {
                    name: message.author.username,
                    extra: {
                        discordid: message.author.id
                    }
                }
            }
            try {
                if (message.content.indexOf(`<@${global.DISCORD_UID}>`) > -1 && !message.author.bot) {
                    response = await handleDirectMessage(message.content.replace(new RegExp(`<@${global.DISCORD_UID}>,? `, 'i'), ''), author)
                } else if (!message.author.bot) {
                    response = await handleGlobalMessage(message.content, author)
                }
            } catch (err) {
                response = `Ошибка: \`\`\`${err}\`\`\``
                console.warn(err)
            }
            if (response)
                message.channel.send(`<@${message.author.id}>, ${response}`)
        }) 
        this._client.login(global.DISCORD_TOKEN) 
        this._hook = new Discord.WebhookClient(global.DISCORD_HOOK_UID, global.DISCORD_HOOK_TOKEN)
    }
    /**
     * 
     * @param {string} msg 
     */
    async sendMessage(msg) {
        return this._hook.send(msg)
    }
}

module.exports = DiscordClient