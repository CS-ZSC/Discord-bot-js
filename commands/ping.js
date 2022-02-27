module.exports = {
    name: 'ping',
    description: 'ping command',
    execute(message, args, Discord) {
        message.channel.send("pong lol");
    }
}