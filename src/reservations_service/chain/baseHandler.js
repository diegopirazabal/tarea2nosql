export class BaseHandler {
  setNext(nextHandler) {
    this.nextHandler = nextHandler;
    return nextHandler;
  }

  async handle(context) {
    if (this.nextHandler) {
      return this.nextHandler.handle(context);
    }
    return context;
  }
}
