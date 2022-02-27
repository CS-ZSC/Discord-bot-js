module.exports = {
    name: 'clear',
    description: 'clears x amount of messages',
    async execute(message, args, Discord) {
        if(args.length != 1) {
            message.reply("Usage: -clear <amount>");
        } else if (isNaN(args[0])) {
            message.reply("Amount must be a number");
        } else if (args[0] > 100 || args[0] < 1) {
            message.reply("Invalid number");
        } else {
            await message.channel.messages.fetch({limit: args[0]}).then(messages => {
                message.channel.bulkDelete(messages);
            });
        }
    }
}