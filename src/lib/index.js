// @ts-check
const { discord: { clientToken, guildId, vanityCode } } = require('../config.json');
const { setVanityURL } = require('vcord.js');

module.exports = {
    async setVanity() {
        const vanity = await setVanityURL({ clientToken, guildId, vanityCode });

        return vanity.ok;
    }
}