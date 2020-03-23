import Koa from 'koa';
import KoaRouter from 'koa-router';
import parseBody from 'koa-body';
import fetch from 'node-fetch';

const API_URL = 'https://api.telegram.org/bot1107998527:AAHhVImW2B4K8RWFcZVQ8bJqlNB3nhJ8TgQ';

export default class Application {
  #koaServer = new Koa();
  #httpServer = null;

  /**
   * @param {Object} config
   * @param {number|string=} [config.port=0]
   */
  constructor({ port = 0 } = {}) {
    port = Number(port);
    if (!Number.isInteger(port) || port < 0) {
      throw new Error('"port" must be a positive integer number.');
    }
    this.port = port;

    const router = new KoaRouter();

    router.get('/', (ctx) => {
      ctx.body = 'Hello! This is @AnnaAgteBot - a sample telegram bot. It only can get webhooks from Telefram API.';
    });

    /*
    {
      "update_id": 15,
      "message":
      {
        "message_id": 4,
        "from": {
          "id": 536884665,
          "is_bot": false,
          "first_name": "Anna",
          "last_name": "Agte",
          "username": "annaagte",
          "language_code": "ru"
        },
        "chat": {
          "id": 536884665,
          "first_name": "Anna",
          "last_name": "Agte",
          "username": "annaagte",
          "type": "private"
        },
        "date": 1584973755,
        "text": "/start"
      }
    }
    */
    router.post('/api/telegram/webhook/1107998527_AAHhVImW2B4K8RWFcZVQ8bJqlNB3nhJ8TgQ', parseBody(), async (ctx) => {
      const { update_id: updateId, message } = ctx.request.body;
      console.log(JSON.stringify(message, null, 2));
      switch (message.text) {
        case '/start':
          console.log('Subscribe to newsletter');
          const response = await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            body: new URLSearchParams({
              chat_id: message.chat.id,
              text: `Новостей нет. <b>Жирный текст</b> <i>Курсив</i> <a href='https://shikari.do'>Ссылка на сайт</a>`,
              parse_mode: 'HTML',
              disable_web_page_preview: true,
            }),
          })
          const jsonResponse = await response.json();
          console.log(jsonResponse);
          break;
        case '/stop':
          console.log('Unsubscribe');
          break;
        default:
          // Do nothing
      }
      ctx.status = 200;
    });

    this.#koaServer.use(router.routes())
    this.#koaServer.use(router.allowedMethods());
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.#httpServer = this.#koaServer.listen(this.port, () => {
        this.port = this.#httpServer.address().port;
        resolve();
      });
      this.#httpServer.on('error', reject);
    });
  }

  async stop() {
    return new Promise((resolve, reject) => this.#httpServer.close((e) => e ? reject(e) : resolve()));
  }
}
