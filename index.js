const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require('mongoose');
const prefix = '$';
const SugModel = require('./models/sug');
client.on('ready', async() => {
    console.log('Online');
    mongoose.connect("MONGODB_URL", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).then(console.log('MongoDB is Ready'));
});

client.on('message', async(message) => {
    if(message.author.bot) return;
    if(message.content.startsWith(prefix+'setchannel')) {
        let channel = message.mentions.channels.first();
        if(!channel) return message.channel,send(`**Usage: ${prefix}setchannel \`<#Channel>\`**`);
        SugModel.findOne({
            guildID: message.guild.id,
        }, async(err, doc) => {
            if(err) throw err;
            if(!doc) {
                new SugModel({
                    guildID: message.guild.id,
                    channel: channel.id
                }).save();
                message.channel.send(`**Done Saved in DataBase**`);
            } else {
                doc.channel = channel.id,
                doc.save();
                message.channel.send(`**Done Set Channel Suggestion**`);
            }
        })
    }
})
client.on('message', async(message) => {
    if(message.author.bot) return;
    if(message.content.startsWith(prefix + 'suggest') || message.content.startsWith(prefix + 'suggestion')) {
        var randomkeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var randomkeys2 = "";
        for (var y = 0; y < 5; y++) {  
          randomkeys2 +=  `${randomkeys.charAt(Math.floor(Math.random() * randomkeys.length))}`;
        }        let args = message.content.split(' ').slice(1).join(' ');
        let data = await SugModel.findOne({guildID: message.guild.id});
        let channel = message.guild.channels.cache.get(data.channel);
        if(!args) return message.channel.send(`**Usage: ${prefix}suggest \`<SuggestionMessage>\`**`);
        SugModel.findOne({
            guildID: message.guild.id,
        }, async(err, doc) =>{
            if(err) throw err;
            if(!doc) {
                message.channel.send(`**Done Suggest in ${channel}**`);
                channel.send(new Discord.MessageEmbed()
                .setAuthor(`**(ID: ${message.author.id}) ${message.author.tag}**`, message.author.displayAvatarURL())
                .setDescription(args)
                .addField(`Reply:`, `**Not yet**`)
                .setFooter(`Req By: ${message.author.tag} | ID: ${randomkeys2}`, message.author.displayAvatarURL())
                .setColor('#36393e')).then(msg => {
                    new SugModel({
                        guildID: message.guild.id,
                        user: message.author.id,
                        msgID: msg.id,
                        code: randomkeys2,
                        content: args,
                        channel: data.channel
                    }).save();
                })
            } else {
                message.channel.send(`**Done Suggest in ${channel}**`);
                channel.send(new Discord.MessageEmbed()
                .setAuthor(`(ID: ${message.author.id}) ${message.author.tag}`, message.author.displayAvatarURL())
                .setDescription(args)
                .addField(`Reply:`, `**Not yet**`)
                .setFooter(`Req By: ${message.author.tag} | ID: ${randomkeys2}`, message.author.displayAvatarURL())
                .setColor('#36393e')).then(msg => {
                    msg.react('✅');
                    msg.react('❌')
                    new SugModel({
                        guildID: message.guild.id,
                        user: message.author.id,
                        msgID: msg.id,
                        code: randomkeys2,
                        content: args,
                        channel: data.channel
                    }).save();
                })
            }
        })
    }
});

client.on('message', async(message) => {
    if(message.author.bot) return;
    if(message.content.startsWith(prefix + 'reply')) {
        if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send(`**You not have Permission: \`MANAGE_MESSAGES\`**`)
        let args = message.content.split(' ').slice(2).join(' ');
        let ID = message.content.split(' ');
        let data = await SugModel.findOne({guildID: message.guild.id, code: ID[1]});
        if(!args) return message.channel.send(`**Usage: ${prefix}reply \`<ID> <MessageReply>\`**`)
        let channel = message.guild.channels.cache.get(data.channel);
        let embed = new Discord.MessageEmbed()
        .setAuthor(`(ID: ${client.users.cache.get(data.user).id}) ${client.users.cache.get(data.user).tag}`, client.users.cache.get(data.user).displayAvatarURL())
        .setDescription(data.content)
        .addField(`Reply:`, `✍️ ${message.author.username} \n**${args}**`)
        .setFooter(`Req By: ${client.users.cache.get(data.user).tag} | ID: ${data.code}`, client.users.cache.get(data.user).displayAvatarURL())
        .setColor('#36393e')
        channel.messages.fetch(data.msgID).then(msg => {
            message.channel.send(`**Done Reply:** https://canary.discord.com/channels/${message.guild.id}/${channel.id}/${data.msgID}`);
            client.users.cache.get(data.user).send(`**Hello, <@${data.user}>: Staff: ${message.author} Replyed on your suggestion:** https://canary.discord.com/channels/${message.guild.id}/${channel.id}/${data.msgID}`)
            msg.edit(embed);
        })

    }
});



client.on('message', async(message) => {
    if(message.author.bot) return;
    if(message.content.startsWith(prefix + 'delete')) {
    if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send(`**You not have Permission: \`MANAGE_MESSAGES\`**`)
    let args = message.content.split(' ');
    if(!args[1]) return message.channel.send(`**Usage: ${prefix}delete \`<ID>\`**`);
    let data = await SugModel.findOne({guildID: message.guild.id, code: args[1]});
    let channel = message.guild.channels.cache.get(data.channel);
    channel.messages.fetch(data.msgID).then(async(msg) => {
        msg.delete();
        data.deleteOne();
        message.channel.send(`**Done Delete Suggestion**`);
    })
    }
});
















client.login('TOKEN_HERE');