const helpers = require("./helpers");
const methods = require("./methods");
const udb = require("./usersdb");
const pdb = require("./postsdb");

async function workingDonate(from, author, permlink, fullAmount) {
    let prefix = new Date().getUTCMonth()+1 + '_' + new Date().getUTCFullYear();
    let content = await methods.getContent(author, permlink);
    if (content.code === 1) {
    let donate = fullAmount.split(' ');
let amount = parseFloat(donate[0]);
let token = donate[1];
console.log('Донатер: ' + from);
let user = await udb.getUser(from, prefix);
console.log('Пользователь: ' + JSON.stringify(user));
if (user && token === 'GBG') {
    await udb.updateUser(from, user.golos_amount, user.gbg_amount+amount, prefix);
} else if (user && token === 'GOLOS') {
    await udb.updateUser(from, user.golos_amount + amount, user.gbg_amount, prefix);
    } else if (!user && token === 'GBG') {
        await udb.updateUser(from, 0, amount, prefix);
        } else if (!user && token === 'GOLOS') {
            await udb.updateUser(from, amount, 0, prefix);
            } else {
console.log('Условию не соответствует: ' + JSON.stringify(user));
            }

let post = await pdb.getPost(author, permlink, prefix);
if (post && token === 'GBG') {
await pdb.updatePost(author, permlink, content.title, post.golos_amount, post.gbg_amount + amount, prefix);
} else if (post && token === 'GOLOS') {
    await pdb.updatePost(author, permlink, content.title, post.golos_amount + amount, post.gbg_amount, prefix);
} else if (!post && token === 'GBG') {
    await pdb.updatePost(author, permlink, content.title, 0, amount, prefix);
} else if (!post && token === 'GOLOS') {
    await pdb.updatePost(author, permlink, content.title, amount, 0, prefix);
}
return 1;    
} else {
console.log('Пост не найден.');
return 0;    
}        
}

async function processBlock(bn) {
    const block = await methods.getOpsInBlock(bn);
let ok_ops_count = 0;
    for(let tr of block) {
        const [op, opbody] = tr.op;
        switch(op) {
                case "transfer":
                opbody.memo = opbody.memo.replace(/\s+/g, ' ').trim();
                try {
                let isJson = await helpers.isJsonString(opbody.memo);
if (isJson.approve === true) {
    let arr = isJson.data;
    if (arr.donate) {
let donate = arr.donate.post;
let url;
if (donate.indexOf('#') > -1) {
    let comment = donate.split('#')[1];
    let filtered_memo = comment.split('@')[1];
url = filtered_memo.split('/');
} else {
    let filtered_memo = donate.split('@')[1];
    url = filtered_memo.split('/');
}
if (opbody.to === url[0]) {
    console.log('автор: ' + url[0] + ', Пермлинк: ' + url[1]);
    let result = await workingDonate(opbody.from, url[0], url[1], opbody.amount);
ok_ops_count += result;
}     else {
console.log('Получатель не совпадает с автором.');
}
}
            }
        } catch(e) {
        console.log(e);
        }
            break;
    default:
                    //неизвестная команда
            }
        }
        return ok_ops_count;
    }

module.exports.processBlock = processBlock;