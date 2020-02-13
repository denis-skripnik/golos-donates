let express = require('express'); // Подключаем express.
let app = express(); // И метод.
const helpers = require("./helpers"); // Функции-помощники.
const methods = require("./methods"); // Методы Голоса в удобном виде.
const pdb = require("./postsdb"); // Коллекция постов.
const udb = require("./usersdb"); // Коллекция донатящих.
app.get('/donates/', async function (req, res) { // Адрес donates, принимает GET запросы.
let type = req.query.type; // получили параметр type из url
let date = req.query.date; // получили параметр date из url
if (type === 'donators') { // Если тип донатеры.
    if (!date) { // Если Нет месяца и года.
        date = new Date().getMonth()+1 + '_' + new Date().getFullYear(); // Получаем текущие.
        let users = await udb.findAllUsers(date); // Получаем пользователей из коллекции users и префиксом date.
    users.sort(helpers.compareDonators); // Сортируем по GOLOS.
    let usersArray = []; // Массив для вывода.
    for (let user of users) {
        usersArray.push({link: `<a href="https://golos.id/@${user.login}" target="_blank">@${user.login}</a>`, golos_amount: user.golos_amount, gbg_amount: user.gbg_amount}); // Добавляем в массив ссылку на пост и суммы в токенах GOLOS, GBG.
    }
    res.send(JSON.stringify(usersArray)); // Выводим массив в виде JSON.
    } else { // date есть в url.
        let users = await udb.findAllUsers(date);
    users.sort(helpers.compareDonators);
    let usersArray = [];
    for (let user of users) {
        usersArray.push({link: `<a href="https://golos.id/@${user.login}" target="_blank">@${user.login}</a>`, golos_amount: user.golos_amount, gbg_amount: user.gbg_amount});
    }
    res.send(JSON.stringify(usersArray));
    }
} else if (type === 'posts') { // тип пост.
    if (!date) {
        date = new Date().getMonth()+1 + '_' + new Date().getFullYear();
    let posts = await pdb.findAllPosts(date); // Получаем посты из коллекции posts.
posts.sort(helpers.comparePosts); // Сортируем по GOLOS.
let postsArray = []; // Создаём массив для вывода.
for (let post of posts) {
    postsArray.push({link: `<a href="https://golos.id/@${post.author}/${post.permlink}" target="_blank">${post.title}</a>`, golos_amount: post.golos_amount, gbg_amount: post.gbg_amount}); // И добавляем каждый из постов в массив: ссылку и суммы в GOLOS, GBG.
}
res.send(JSON.stringify(postsArray)); // выводим.
} else { // date есть в url.
    let posts = await pdb.findAllPosts(date);
posts.sort(helpers.comparePosts);
let postsArray = [];
for (let post of posts) {
    postsArray.push({link: `<a href="https://golos.id/@${post.author}/${post.permlink}" target="_blank">${post.title}</a>`, golos_amount: post.golos_amount, gbg_amount: post.gbg_amount});
}
res.send(JSON.stringify(postsArray));
}
}
});
app.listen(3900, function () { // Порт 3900.
});