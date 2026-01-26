const config = require('../../config.json');

let logChannel = null;

const LogLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
};

const LogColors = {
    DEBUG: 0x808080,  // Gray
    INFO: 0x00ff00,   // Green
    WARN: 0xffff00,   // Yellow
    ERROR: 0xff0000   // Red
};

/**
 * Initialize the logger with the Discord client
 * @param {Client} client - The Discord client
 */
const initLogger = async (client) => {
    try {
        const logsChannelId = config.serverInfo.logs_channel_id;
        
        if (!logsChannelId) {
            console.warn(`[Logger] No logs_channel_id configured in config.json. Logging to console only.`);
            return;
        }

        logChannel = await client.channels.fetch(logsChannelId).catch(() => null);
        
        if (logChannel) {
            console.log(`[Logger] Initialized. Logging to channel: #${logChannel.name} (${logsChannelId})`);
        } else {
            console.warn(`[Logger] Could not find channel with ID ${logsChannelId}. Logging to console only.`);
        }
    } catch (err) {
        console.error(`[Logger] Failed to initialize: ${err}`);
    }
};

/**
 * Format the current timestamp in Cairo timezone
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
    const date = new Date();
    const cairoDate = new Date(date.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
    return cairoDate.toISOString().replace("T", " ").substring(0, 19);
};

/**
 * Send a log message to console and Discord channel
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param {string} context - The context/module name
 * @param {string} message - The log message
 * @param {object} [data] - Optional additional data
 */
const log = async (level, context, message, data = null) => {
    const timestamp = getTimestamp();
    const formattedMessage = `[${timestamp}] [${level}] [${context}] ${message}`;
    
    // Always log to console
    switch (level) {
        case LogLevel.ERROR:
            console.error(formattedMessage, data || '');
            break;
        case LogLevel.WARN:
            console.warn(formattedMessage, data || '');
            break;
        case LogLevel.DEBUG:
            console.debug(formattedMessage, data || '');
            break;
        default:
            console.log(formattedMessage, data || '');
    }

    // Send to Discord channel if available
    if (logChannel) {
        try {
            const embed = {
                color: LogColors[level] || 0x000000,
                title: `${level}: ${context}`,
                description: message.substring(0, 2000), // Discord limit
                timestamp: new Date().toISOString(),
            };

            if (data) {
                const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
                if (dataStr.length > 0 && dataStr !== '{}') {
                    embed.fields = [{
                        name: 'Additional Data',
                        value: `\`\`\`json\n${dataStr.substring(0, 1000)}\n\`\`\``
                    }];
                }
            }

            await logChannel.send({ embeds: [embed] });
        } catch (err) {
            console.error(`[Logger] Failed to send log to Discord: ${err}`);
        }
    }
};

// Convenience methods
const debug = (context, message, data) => log(LogLevel.DEBUG, context, message, data);
const info = (context, message, data) => log(LogLevel.INFO, context, message, data);
const warn = (context, message, data) => log(LogLevel.WARN, context, message, data);
const error = (context, message, data) => log(LogLevel.ERROR, context, message, data);

module.exports = {
    initLogger,
    log,
    debug,
    info,
    warn,
    error,
    LogLevel
};
