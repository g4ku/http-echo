const internalIp = require("internal-ip");

class Utility {
  #ipv4;

  get ipv4() {
    return (async () => {
      if (!this.#ipv4) {
        this.#ipv4 = await internalIp.v4();
      }
      return this.#ipv4;
    })();
  }
}

module.exports = new Utility();
