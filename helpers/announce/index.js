const config = require('../../config.json');
const client = require("../../main").client;

<<<<<<< HEAD
=======
/* TODO: FIX this*/
>>>>>>> 3d7f5cd6762cfa95158164d160b423808a3ed8dd
module.exports = {
  async announce(message) {
    client.channels.cache.get(config.serverInfo.announcments_id).send(message);
  }
}
