/**
 * DPlayer弹幕服务
 */

const { dplayer_query, dplayer_create } = require("../utils/DPlayerleancloud");
const Router = require("koa-router");
const dplayerRouter = new Router();

function htmlEncode (str) {
  return str ? str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2f;') : '';
}

dplayerRouter.get("/v3/", async (ctx) => {
    const { id, limit } = ctx.request.query;
    try{
        if (id) {
            let data = await dplayer_query(id);
            console.log(data);
            if (data) {
                if (limit) {
                    data = data.slice(-1 * parseInt(limit));
                }
                ctx.body = JSON.stringify({
                    code: 0,
                    data: data.map((item) => [item.time || 0, item.type || 0, item.color || 16777215, htmlEncode(item.author) || 'DPlayer', htmlEncode(item.text) || '']),
                });
            } else {
                ctx.body = JSON.stringify({
                    code: 0,
                    data: [],
                });
            }
        } else {
            ctx.body = JSON.stringify({
            code: -1,
            data: "id不可为空！",
        });
        }
    } catch {
        ctx.body = JSON.stringify({
            code: 0,
            data: [],
        });
    }
});

dplayerRouter.post("/v3/", async (ctx) => {
    try {
        const body = ctx.request.body;
        console.log(body)
        const data = await dplayer_create({
            player: body.id,
            author: body.author,
            time: body.time,
            text: body.text,
            color: body.color,
            type: body.type,
            ip: ctx.ips[0] || ctx.ip,
            referer: ctx.headers.referer,
            date: +new Date(),
        });
        ctx.body = JSON.stringify({
            code: 0,
            data,
        });
    } catch(err) {
        ctx.body = JSON.stringify({
            code: 1,
            msg: `Database error: ${err}`,
        });
    }
});

module.exports = dplayerRouter;
