// Подключаем модули
const express = require('express');
const app = express();

const {
	handleDirectMessage,
	handleGlobalMessage
} = require('./handlers')
const {
	Member
} = require('./abstract')
const DATABASE_URL = process.env["DATABASE_URL"]

const {
	Pool
} = require('pg')
global.db = new Pool({
	connectionString: DATABASE_URL
})

const Discord = require('discord.js');

const client = new Discord.Client();

global.DISCORD_TOKEN = process.env.DISCORD_TOKEN;

global.DISCORD_UID = process.env.DISCORD_UID;
global.DISCORD_HOOK_ID = process.env.DISCORD_HOOK_ID;
global.DISCORD_HOOK_TOKEN = process.env.DISCORD_HOOK_TOKEN;

// Объявляем переменные

/*
 * Количество дней, оставшихся до события
 */
function daysTillEvent(event) {
	return (Math.floor((event.setYear(0) - new Date(Date.now()).setYear(0)) / (1000 * 60 * 60 * 24)) + 1 + 365) % 365
}

/*
 * Перевод даты в русском формате в стандартный
 */

function parseRussianDate(str) {
	var arr = str.split(".")
	return new Date(arr[2], parseInt(arr[1]) - 1, parseInt(arr[0]))
}

/*
 * Проверить, есть ли дни рождения в ближайшее время
 */

async function checkForBirthdays(members, clients) {
	var messages = []
	for (var i in members) {
		if (daysTillEvent(members[i].birthdate) == 3) {
			message.push(`Через 3 дня рождения празднует ${members[i].name}!`)
		} else if (daysTillEvent(members[i].birthdate) == 1) {
			messages.push(`Завтра день рождения празднует ${members[i].name}!`)
		} else if (daysTillEvent(members[i].birthdate) == 0) {
			messages.push(`Сегодня день рождения празднует ${members[i].name}! Поздравляем! :birthday: :birthday:`)
		}
	}
	if (messages.length > 0)
		for (i in clients)
			for (k in messages)
				clients[i].sendMessage(messages[k])
}


app.set('port', (process.env.PORT || 5000));
app.get('/', function (request, response) {
	response.end('Server physmath-bot.')
});

app.listen(app.get('port'), function () {
	console.log('Node app is running on port', app.get('port'));
});
const {
	DiscordClient
} = require('./clients')
async function main() {
	var clients = [
		new DiscordClient(handleDirectMessage, handleGlobalMessage)
	]
	clients[0].sendMessage("I'm online!")
	await checkForBirthdays(await Member.getAll(), clients)
}
main()