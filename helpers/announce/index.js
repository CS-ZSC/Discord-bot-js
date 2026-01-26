const { client } = require("../../main");
const config = require("../../config.json");
const logger = require("../logger");

module.exports = {
  async announce(message) {
    try {
      const channel = client.channels.cache.get(config.serverInfo.announcements_id);
      
      if (!channel) {
        logger.error('Announce', `Announcements channel not found`, { channelId: config.serverInfo.announcements_id });
        return;
      }
      
      await channel.send(message);
      logger.info('Announce', `Announcement sent`, { channelId: channel.id, hasContent: !!message.content, hasFiles: !!(message.files && message.files.length) });
    } catch (err) {
      logger.error('Announce', `Failed to send announcement`, { error: err.message });
    }
  }
};
