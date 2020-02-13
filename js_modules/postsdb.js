const MongoClient = require('mongodb').MongoClient; // Подключаем npm пакет mongodb.

const url = 'mongodb://localhost:27017'; // url mongo DB.

// Получаем пост по автору и пермлинку.
async function getPost(author, permlink, prefix) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("golos-donators");

        let collection = db.collection('posts' + prefix);

        let query = {author, permlink}

        let res = await collection.findOne(query);

return res;

    } catch (err) {

        console.error(err);
    return err;
      } finally {

        client.close();
    }
}

// Добавляем посты: их массив и префикс вида месяц-год. Нужен для переноса данных из старой коллекции в новую (существует на всякий случай: сейчас не используется).
async function addPosts(posts, prefix) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("golos-donators");

      let collection = db.collection('posts' + prefix);

      let res = await collection.insertMany(posts);

return res;

  } catch (err) {

      console.error(err);
  return err;
    } finally {

      client.close();
  }
}

// Обновление или добавление одного поста: автор, пермлинк, заголовок, сумма в GOLOS и GBG, префикс для уникализации коллекции.
async function updatePost(author, permlink, title, golos_amount, gbg_amount, prefix) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("golos-donators");

      let collection = db.collection('posts' + prefix);

      let res = await collection.updateOne({author, permlink}, {$set: {author, permlink, title, golos_amount, gbg_amount}}, { upsert: true });
console.log(JSON.stringify(res));
return res;

  } catch (err) {

      console.error(err);
  return err;
    } finally {

      client.close();
  }
}

// Удаление коллекции постов с указанным префиксом.
async function removePosts(prefix) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("golos-donators");

      let collection = db.collection('posts' + prefix);

      let res = await collection.drop();

return res;

  } catch (err) {

      console.log(err);
  return err;
    } finally {

      client.close();
  }
}

// Поиск всех постов в коллекции post с префиксом, указанным в параметре, передаваемом функции.
async function findAllPosts(prefix) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("golos-donators");

      let collection = db.collection('posts' + prefix);

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
module.exports.getPost = getPost;
module.exports.updatePost = updatePost;
module.exports.removePosts = removePosts;
module.exports.findAllPosts = findAllPosts;