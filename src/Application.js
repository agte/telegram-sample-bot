import Koa from 'koa';
import KoaRouter from 'koa-router';
import parseBody from 'koa-body';

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

    router.post('/api/telegram/webhook/1107998527_AAHhVImW2B4K8RWFcZVQ8bJqlNB3nhJ8TgQ', parseBody(), (ctx) => {
      const { update_id: updateId, message } = ctx.request.body;
      console.log(message);
      switch (message.text) {
        case '/start':
          console.log('Subscribe to newsletter');
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
