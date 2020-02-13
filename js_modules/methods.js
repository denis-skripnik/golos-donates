var golos = require('golos-js'); // golos-js подключаем.
golos.config.set('websocket','wss://golos.lexa.host/ws'); // Указывается api Нода.

// Получаем блок с виртуальными операциями.
async function getOpsInBlock(bn) {
    return await golos.api.getOpsInBlockAsync(bn, false);
  }

// header блока.
  async function getBlockHeader(block_num) {
  return await golos.api.getBlockHeaderAsync(block_num);
  }

  // Получаем dynamic_properties.
  async function getProps() {
      return await golos.api.getDynamicGlobalPropertiesAsync();
      }
    
      // Получаем контент.
async function getContent(author, permlink) {
try {
let post = await golos.api.getContentAsync(author, permlink, 0);
return {code: 1, title: post.title};
} catch(e) {
return {code: -1, error: e};
}
}

// Экспорт функций.
      module.exports.getOpsInBlock = getOpsInBlock;
module.exports.getBlockHeader = getBlockHeader;
module.exports.getProps = getProps;      
module.exports.getContent = getContent;