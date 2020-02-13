const MongoClient = require('mongodb').MongoClient; // Подключение npm пакета mongodb.

const url = 'mongodb://localhost:27017'; // url mongo DB на вашем сервере.

// Получение пользователя по логину. Префикс указывается для получения из коллекции posts определённого месяца и года.
async function getUser(login, prefix) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("golos-donators");

        let collection = db.collection('users' + prefix);

        let query = {login}

        let res = await collection.findOne(query);
console.log(JSON.stringify(res));
return res;

    } catch (err) {

        console.log(err);
    return err;
      } finally {

        client.close();
    }
}

// Обновление пользователя или добавление. Указывается логин, сумма в GOLOS, сумма в GBG и префикс коллекции.
async function updateUser(login, golos_amount, gbg_amount, prefix) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("golos-donators");

      let collection = db.collection('users' + prefix);

      let res = await collection.updateOne({login}, {$set: {login, golos_amount, gbg_amount}}, { upsert: true });
console.log(JSON.stringify(res));
return res;

  } catch (err) {

      console.error(err);
  return err;
    } finally {

      client.close();
  }
}

// Удаление коллекции донатеров с определённым префиксом.
async function removeUsers(prefix) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("golos-donators");

      let collection = db.collection('users' + prefix);

      let res = await collection.drop();

return res;

  } catch (err) {

      console.error(err);
  return err;
    } finally {

      client.close();
  }
}

// Поиск всех пользователей в коллекции users с переданным в функцию префиксом.
async function findAllUsers(prefix) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("golos-donators");

      let collection = db.collection('users' + prefix);

      const res = [];
      let cursor = await collection.find({}).limit(500);
      let doc = null;
      while(null != (doc = await cursor.next())) {
          res.push(doc);
      }
  return res;
    } catch (err) {

      console.log(err);
  return err;
    } finally {

      client.close();
  }
}

// Экспорт данных.
module.exports.getUser = getUser;
module.exports.updateUser = updateUser;
module.exports.removeUsers = removeUsers;
module.exports.findAllUsers = findAllUsers;