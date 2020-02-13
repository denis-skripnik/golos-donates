// Приостановка на определённое количество миллисекунд.
async function sleep(ms) {
    await new Promise(r => setTimeout(r, ms));
    }

    // Получение unixtime текущего времени и даты.
    async function unixTime(){
        return parseInt(new Date().getTime()/1000)
        }
    
        // Сортировка по GOLOS (По умолчанию).
function compareDonators(a, b)
{
	if(a.golos_amount > b.golos_amount)
	{
		return -1;
	}
else{
		return 1;
	}
}

// Сортировка постов по GOLOS токену (по умолчанию)
function comparePosts(a, b)
{
	if(a.golos_amount > b.golos_amount)
	{
		return -1;
	}
else{
		return 1;
	}
}

// Проверка, что переданное в функцию является JSON, возвращает массив.
async function isJsonString(str) {
    try {
        let json_array = JSON.parse(str);
    return {approve: true, data: json_array};
    } catch (e) {
        return {approve: false};
    }
}

// Экспортируем.
    module.exports.unixTime = unixTime;
module.exports.sleep = sleep;
module.exports.compareDonators = compareDonators;
module.exports.comparePosts = comparePosts;
module.exports.isJsonString = isJsonString;