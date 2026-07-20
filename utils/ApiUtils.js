export class ApiUtils {
  constructor(request) {
    this.request = request;
  }

  async get(url, options = {}) {
    return this.request.get(url, options);
  }
}
