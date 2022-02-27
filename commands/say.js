module.exports = {
    name: 'say',
    description: 'Says specified message',
    execute(message, args, Discord) {
        let channel = message.mentions.channels.first();
        if (!channel) return message.channel.send("Channel not found.");
        if (args.length < 2) return message.channel.send("You must specify a message.");
        let msg = "";
        for (let i = 1; i < args.length; i++) {
            msg += args[i] + " ";
        }
        message.guild.channels.cache.get(channel.id).send(msg);
    }
}