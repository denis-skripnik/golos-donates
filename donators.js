require("./js_modules/ajax"); // Модуль, отвечающий за вывод топа.
const work = require("./js_modules/work"); // Модуль работы с блоком.
const helpers = require("./js_modules/helpers"); // Функции-помощники.
const methods = require("./js_modules/methods"); // Методы golos-js в удобном виде.
const pdb = require("./js_modules/postsdb"); // Функция, работающая с коллекцией постов в mongo базе данных golos-donates.
const udb = require("./js_modules/usersdb"); // Коллекция пользователей
const bdb = require("./js_modules/blocksdb"); // Коллекция blocks.
const LONG_DELAY = 12000; // Если ошибка, 12 секунд ожидания.
const SHORT_DELAY = 3000; // Если ошибок нет, 3 секунды.
const SUPER_LONG_DELAY = 1000 * 60 * 15; // Раз в 15 минут проверка на отсутствие новых блоков.

let PROPS = null; // Переменная для получения dynamic_global_properties.

let bn = 0; // Переменная номера блока.
let last_bn = 0; // Текущий блок.
let delay = SHORT_DELAY; // Переменная ожидания.

// Функция работы с блоками.
async function getNullTransfers() {
    PROPS = await methods.getProps(); // Получаем dynamic_global_properties.
            const block_n = await bdb.getBlock(PROPS.last_irreversible_block_num); // Получаем номер блока из коллекции blocks и передаём последний на случай, если блока нет в базе данных.
bn = block_n.last_block; // Номер блока.

delay = SHORT_DELAY;
// Цикл прохода по блокам. Если скрипт долго не работал, пройдёт до текущего в ускоренном режиме.
while (true) {
    try {
        if (bn > PROPS.last_irreversible_block_num) {
            await helpers.sleep(delay); // Приостанавливаем на delay миллисекунд.
            PROPS = await methods.getProps();
        } else {
            if(0 < await work.processBlock(bn)) { // вызываем метод обработки блока и проверяем, что возвращаемое значение > 0.
                delay = SHORT_DELAY;
            } else {
                delay = LONG_DELAY;
            }
            bn++; // Прибавляем на 1 номер блока.
            await bdb.updateBlock(bn); // И обновляем его в коллекции blocks.
        }
    } catch (e) {
        console.log("error in work loop" + e);
        await helpers.sleep(1000);
        }
    }
}

// Проверка на отсутствие движения по блокам. Если не прибавляется долго, перезагрузка скрипта.
setInterval(() => {
    if(last_bn == bn) {

        try {
                process.exit(1);
        } catch(e) {
            process.exit(1);
        }
    }
    last_bn = bn;
}, SUPER_LONG_DELAY);

getNullTransfers()