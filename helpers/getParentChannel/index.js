const {client} = require("../../main");


module.exports = {
    /**
     * Get the parent channel of a thread
     * @param {string} threadId the id of the thread you want to get its parent channel
     * @returns {object} the parent channel of the thread
     */
    getParentChannel: async function getParentChannel(threadId) {
        const thread = await client.channels.fetch(threadId);
        const parentChannel = await client.channels.fetch(thread.parentId);
        return parentChannel;
    }
}