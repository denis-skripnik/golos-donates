const helpers = require("./helpers"); // функции-помощники
const methods = require("./methods"); // Удобное представление методов golos-js в удобном виде.
const udb = require("./usersdb"); // обработчик добавления/обновления данных, их получения и т.п. коллекции users.
const pdb = require("./postsdb"); // то же самое по коллекции posts.

async function workingDonate(from, author, permlink, fullAmount, block_date) {
    let part_date = block_date.split("-"); // Разделяем дату и время принятия блока по тере.
    let prefix = parseInt(part_date[1]) + '-' + parseInt(part_date[0]); // Получаем префикс для коллекций.
    let content = await methods.getContent(author, permlink); // Получаем информацию
    if (content.code === 1) { // Ошибки при получении данных нет.
    let donate = fullAmount.split(' '); // Разделяем сумму на количество токенов и сам токен.
let amount = parseFloat(donate[0]);
let token = donate[1];

console.log('Донатер: ' + from);
let user = await udb.getUser(from, prefix); // Получаем пользователя (донатящего).
if (user && token === 'GBG') { // Пользователь есть и токен GBG.
    await udb.updateUser(from, user.golos_amount, user.gbg_amount+amount, prefix); // Обновляем коллекцию users, добавляя к сумме gbg_amount текущую.
} else if (user && token === 'GOLOS') { // донатер есть и токен GOLOS
    await udb.updateUser(from, user.golos_amount + amount, user.gbg_amount, prefix); // Обновляем, но суммируем golos_amount.
    } else if (!user && token === 'GBG') { // Пользователя нет и токен GBG
        await udb.updateUser(from, 0, amount, prefix); // Добавляем с нулём вместо GOLOS и суммой на месте gbg_amount.
        } else if (!user && token === 'GOLOS') { // Донатящего в базе данных нет, токен GOLOS
            await udb.updateUser(from, amount, 0, prefix); // Добавить с указанием GOLOS, на месте GBG 0.
            } else {  // что-то иное.
console.log('Условию не соответствует: ' + JSON.stringify(user));
} // Конец условия донатящих.

let post = await pdb.getPost(author, permlink, prefix); // Получаем данные поста.
if (post && token === 'GBG') { // Если есть пост и токен GBG.
await pdb.updatePost(author, permlink, content.title, post.golos_amount, post.gbg_amount + amount, prefix); // обновляем данные в коллекции posts.
} else if (post && token === 'GOLOS') { // если пост есть и токен GOLOS
    await pdb.updatePost(author, permlink, content.title, post.golos_amount + amount, post.gbg_amount, prefix); // обновляем или добавляем
} else if (!post && token === 'GBG') { // Поста нет и токен GBG
    await pdb.updatePost(author, permlink, content.title, 0, amount, prefix); // добавляем данные в коллекции posts.
} else if (!post && token === 'GOLOS') { // Поста нет и токен GOLOS
    await pdb.updatePost(author, permlink, content.title, amount, 0, prefix); // Тоже добавляем, но 0 вместо GBG.
} // Конец условия постов.
return 1;     // +1, так как пост есть.
} else {
console.log('Пост не найден.');
return 0; // ошибка при получении поста.
}        
}

async function processBlock(bn) {
    const block = await methods.getOpsInBlock(bn);
let ok_ops_count = 0;
    for(let tr of block) {
        const [op, opbody] = tr.op;
        switch(op) {
                case "transfer": // Перевод
                opbody.memo = opbody.memo.replace(/\s+/g, ' ').trim(); // Удаляем неразрывные пробелы.
                try {
                let isJson = await helpers.isJsonString(opbody.memo); // Переводим в JSON.
if (isJson.approve === true) { // JSON ли это
    let arr = isJson.data; // data возвращает объект.
    if (arr.donate) { // Есть ли donate в JSON объекте
let donate = arr.donate; // Получаем содержимое donate JSON объекта.
let filtered_memo = donate.post.split('@')[1]; // Разделяем для получения данных поста и передаём в переменную вторую часть.
let url = filtered_memo.split('/'); // Разделяем filtered_memo = по слешу для получения автора и пермлинка поста.
if (opbody.to === url[0]) { // Совпадает ли получатель с автором поста?
console.log('автор: ' + url[0] + ', Пермлинк: ' + url[1]);
let result = await workingDonate(opbody.from, url[0], url[1], opbody.amount); // Передаём параметры "от кого", "автор", "пермлинк", "сумма" и timestamp блока.
ok_ops_count += result; // Прибавляем число, возвращённое результатом выполнения функции workingDonate.
}     else { // Если нет, в консоль сообщение
console.log('Получатель не совпадает с автором.');
} // Конец условия с проверкой совпадения получателя и автора поста.
} // Конец условия проверки на наличие donate в JSON
            } // Конец условия, проверяющего JSON
        } catch(e) {
        console.error(e); // Ошибка в лог
        }
            break;
    default:
                    //неизвестная команда
            }
        }
        return ok_ops_count;
    }

module.exports.processBlock = processBlock; // Экспорт функции с обработкой блока