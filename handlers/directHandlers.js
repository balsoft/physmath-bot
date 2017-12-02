const {
    Member
} = require('../abstract')
const {
    promisify
} = require('util')
const exec = promisify(require('child_process').exec)
const dateFormat = require('format-date')
const got = require('got')
const decode = require('parse-entities')
const iconv = require('iconv')

function daysTillEvent(event) {
    return (Math.floor((event.setYear(0) - new Date(Date.now()).setYear(0)) / (1000 * 60 * 60 * 24)) + 1 + 365) % 365
}
const directHandlers = {
    "др (.*)|(.*) др": async function (text, author, match) {
        const members = await Member.getAll()
        const obj = match[1] || match[2]
        if (obj == 'ближайший') {
            var min = 365
            var closest
            for (var i in members) {
                if (daysTillEvent(members[i].birthdate) < min) {
                    min = daysTillEvent(members[i].birthdate)
                    closest = members[i]
                }
            }
            return `Ближайший день рождения празднует ${closest.name}, это будет ${dateFormat('{month-name}, {day}', closest.birthdate)} (через ${min} дней)`
        } else {
            const member = await Member.findByName(obj)
            return `${member.name} празднует день рождения ${dateFormat('{month-name}, {day}', member.birthdate)}, через ${daysTillEvent(member.birthdate)} дней`
        }
    },
    "ping": async function (text, author, match) {
        return 'pong'
    },
    "(?:echo|скажи) (.*)": async function (text, author, match) {
        return match[1]
    },
    "цитата ?(.*)?": async function (text, author, match) {
        if (!match[1]) {
            var body = (await got('http://bash.im/forweb', {
                encoding: null
            })).body
            body = new Buffer(body, 'binary');
            conv = new iconv.Iconv('windows-1251', 'utf8');
            var response = conv.convert(body).toString();
            response = response.replace("document.write(borq);", '').replace("var borq='';", '').replace("borq +=", '')
            response = eval(response)
            var quote = decode(response.match(/<div id="b_q_t" style="padding: 1em 0;">(.*?)<\/div>/i)[1].replace(/<br>/g, '\n').replace(/<br \/>/gi, '\n'))
            var quoteN = response.match(/<a href=".*?">#(.*?)<\/a>/i)[1]
            return '```' + quote + '```' + `:copyright: bash.im, цитата #${quoteN}`
        } else {
            var body = (await got('http://bash.im/quote/' + match[1], {
                encoding: null
            })).body
            body = new Buffer(body, 'binary');
            conv = new iconv.Iconv('windows-1251', 'utf8');
            var response = conv.convert(body).toString();
            var quote = decode(response.match(/<div class="text">(.*?)<\/div>/i)[1].replace(/<br>/g, '\n').replace(/<br \/>/gi, '\n'))
            var quoteN = response.match(/<a href=".*?">#(.*?)<\/a>/i)[1]
            return '```' + quote + '```' + `:copyright: bash.im, цитата #${quoteN}`
        }
    },
    "eval (.*)": async function (text, author, match) {
        if (global.ENVIRONMENT == "PRODUCTION") return "Я вас не понял"
        if (!author.extra.admin) throw "Недостаточно прав"
        return '```' + eval(match[1]) + '```'
    },
    "evalAsync (.*)": async function (text, author, match) {
        if (global.ENVIRONMENT == "PRODUCTION") return "Я вас не понял"
        if (!author.extra.admin) throw "Недостаточно прав"
        return '```' + await eval('async function a() {' + match[1] + '};a')() + '```'
    },
    "SQL (.*)": async function (text, author, match) {
        if (global.ENVIRONMENT == "PRODUCTION") return "Я вас не понял"
        if (!author.extra.admin) throw "Недостаточно прав"
        return '```' + JSON.stringify(await global.db.query(match[1])) + '```'
    },
    "пользовател(?:и|ь) добавить ([\u0400-\u04FF]*? [\u0400-\u04FF]\.[\u0400-\u04FF]\.) (.*?) ({.*})": async function (text, author, match) {
        if (!author.extra.admin) throw "Недостаточно прав"
        var name = match[1]
        var birthdate = new Date(match[2])
        var extra = JSON.parse(match[3])
        await (new Member(name, birthdate, extra))
    },
    "пользовател(?:и|ь) удалить ([\u0400-\u04FF]*)": async function (text, author, match) {
        if (!author.extra.admin) throw "Недостаточно прав"
        var name = match[1]
        await (await Member.findByName(name)).delete()
    },
    "пользовател(?:и|ь) изменить ([\u0400-\u04FF]*?) установить (.*?) в (.*)": async function (text, author, match) {
        if (!author.extra.admin) throw "Недостаточно прав"
        (await Member.findByName(match[1])).extra[match[2]] = JSON.parse(match[3])
    }
}
module.exports = directHandlers