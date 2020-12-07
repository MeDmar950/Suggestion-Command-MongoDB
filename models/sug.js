const { Schema, model } = require('mongoose');

const Sug = new Schema({
    guildID: {
        type: String
    },
    user: {
        type: String
    },
    msgID: {
        type: String
    },
    code: {
        type: String
    },
    content: {
        type: String
    },
    channel: {
        type: String,
        default: null
    }
});

module.exports = model('Sugestions', Sug)
