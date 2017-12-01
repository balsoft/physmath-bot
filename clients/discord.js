const Discord = require('discord.js')
const { Member } = require('../abstract')

class DiscordClient {
    /**
     * 
     * @param {function(string): Promise<string>} handleMessage 
     */
    constructor(handleMessage) {
        this.client = new Discord.Client()
        this.client.on('message', async function (message) {
            if (message.content.indexOf(`<@${global.DISCORD_UID}>`) > -1 && !message.author.bot) {
                try {
                    var author;
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
                    console.log(author)
                    message.channel.send(`<@${message.author.id}> ` + await handleMessage(message.content.replace(`<@${global.DISCORD_UID}> `, ''), author))
                } catch (err) {
                    message.channel.send(`Ошибка: \`\`\`${err}\`\`\``)
                    console.warn(err)
                }
            }
        })
        this.client.login(global.DISCORD_TOKEN)
    }
}

module.exports = DiscordClient