// @ts-check

const { setVanity } = require('./lib');
const { discord: { guildId, clientId }, client: { token } } = require('./config.json');

const { Client, Events, AuditLogEvent, IntentsBitField, ChannelType, EmbedBuilder, codeBlock } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.GuildIntegrations
    ]
});

client.once(Events.ClientReady, c => {
    console.log(`online :: ${c.user.username} atağa kalktı.`)
});

client.on(Events.GuildUpdate, async (oldGuild, newGuild) => {
    if(oldGuild.vanityURLCode === newGuild.vanityURLCode) return;
    if(oldGuild.id !== guildId) return;

    const auditLog = await oldGuild.fetchAuditLogs({
        type: AuditLogEvent.GuildUpdate,
        limit: 1
    });

    const firstEntry = auditLog.entries.first();

    if (!firstEntry || firstEntry.executorId === oldGuild.ownerId || firstEntry.executorId === clientId) return;

    const member = await oldGuild.members.fetch(firstEntry.executorId ?? '');
    const vanity = await setVanity();

    if(member && vanity) {
        member.ban({ reason: 'url değişirken yasaklandı.' }).then(() => {
            const channel = oldGuild.channels.cache.filter(c => c.type === ChannelType.GuildText).random();

            if(channel && channel.type === ChannelType.GuildText) {
                channel.send({
                    embeds: [
                        new EmbedBuilder()
                        .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
                        .setColor('DarkButNotBlack')
                        .setDescription('> Bir kullanıcı URL\'yi değiştirirken yasaklandı.')
                        .setFields([
                            {
                                name: 'Değiştiren kişi:',
                                value: codeBlock('yaml', member.user.username)
                            },
                            {
                                name: 'Şu URL geri alındı:',
                                value: codeBlock('yaml', newGuild.vanityURLCode ?? 'N/A')
                            }
                        ])
                        .setTimestamp()
                        .setFooter({ text: 'discord.gg/altyapilar • vcord.js (npm)', iconURL: oldGuild.client.user.displayAvatarURL() })
                    ]
                })
            }
        }).catch(() => {
            const channel = oldGuild.channels.cache.filter(c => c.type === ChannelType.GuildText).random();

            if(channel && channel.type === ChannelType.GuildText) {
                channel.send({
                    content: `<@${newGuild.ownerId}>`,
                    embeds: [
                        new EmbedBuilder()
                        .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
                        .setColor('DarkButNotBlack')
                        .setDescription('> Bir kullanıcı URL\'yi değiştirirken yasaklandı. || Banlıyamıyorum.')
                        .setFields([
                            {
                                name: 'Değiştiren kişi:',
                                value: codeBlock('yaml', member.user.username)
                            },
                            {
                                name: 'Şu url geri alındı:',
                                value: codeBlock('yaml', newGuild.vanityURLCode ?? 'N/A')
                            }
                        ])
                        .setTimestamp()
                        .setFooter({ text: 'discord.gg/altyapilar • vcord.js (npm)', iconURL: oldGuild.client.user.displayAvatarURL() })
                    ]
                })
            }
        });
    }
});

client.login(token).catch(() => console.log('Discord API\'ye istek gönderimi başarısız'));