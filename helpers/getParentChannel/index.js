const {client} = require("../../main");
const logger = require("../logger");


module.exports = {
    /**
     * Get the parent channel of a thread
     * @param {string} threadId the id of the thread you want to get its parent channel
     * @returns {object} the parent channel of the thread
     */
    getParentChannel: async function getParentChannel(threadId) {
        try {
            const thread = await client.channels.fetch(threadId);
            const parent = await client.channels.fetch(thread.parentId);
            logger.debug('GetParentChannel', `Resolved parent channel`, { threadId, parentId: parent.id, parentName: parent.name });
            return parent;
        } catch (err) {
            logger.error('GetParentChannel', `Failed to get parent channel`, { threadId, error: err.message });
            throw err;
        }
    }
}