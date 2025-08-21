const AV = require('leancloud-storage');
const crypto = require('crypto'); // Node.js 内置模块，无需额外安装

AV.init({
  appId: process.env.APP_ID_DPLAYER,
  appKey: process.env.APP_KEY_DPLAYER,
  serverURLs: process.env.SERVERURL_DPLAYER,
});

/**
 * 将 URL 转换为合法的类名（使用 MD5 哈希，取前 16 位）
 * @param {string} url - 原始 URL
 * @returns {string} 合法的类名前缀
 */
function getValidClassName(url) {
  // 对 URL 进行 MD5 哈希，转换为 32 位十六进制字符串
  const hash = crypto.createHash('md5').update(url).digest('hex');
  // 取前 16 位避免类名过长，拼接前缀 "DPlayer_"
  return `DPlayer_${hash.slice(0, 16)}`;
}

/**
 * 创建并保存一条数据
 */
const dplayer_create = async function createData(list) {
  try {
    const DPlayer = AV.Object.extend(getValidClassName(list.player));
    const dplayerObj = new DPlayer(); // 避免变量名冲突
    
    dplayerObj.set('player', list.player.replace('_blog', ''));
    dplayerObj.set('author', list.author);
    dplayerObj.set('time', list.time);
    dplayerObj.set('text', list.text);
    dplayerObj.set('color', list.color);
    dplayerObj.set('type', list.type);
    dplayerObj.set('ip', list.ip);
    dplayerObj.set('referfer', list.referer);
    dplayerObj.set('date', list.date || new Date());
    
    const result = await dplayerObj.save();
    console.log('数据创建成功，ID:', result.objectId);
    return result;
  } catch (error) {
    console.error('创建数据失败:', error);
    return null;
  }
}

/**
 * 查询数据
 */
const dplayer_query = async function queryData(id) {
  try {
    const query = new AV.Query(getValidClassName(id));
    query.descending('time');
    const results = await query.find();
    
    console.log(`查询到 ${results.length} 条数据`);
    return results.map(item => ({
      "id": item.objectId,
      "player": item.get('player'),
      "author": item.get('author'),
      "time": item.get("time"),
      "text": item.get('text'),
      "color": item.get('color'),
      "type": item.get("type"),
      "ip": item.get("ip"),
      "referfer": item.get("referfer"),
      "date": item.get("date"),
    }));
  } catch (error) {
    console.error('查询数据失败:', error);
    return [];
  }
}

module.exports = {
  dplayer_create,
  dplayer_query
};
    