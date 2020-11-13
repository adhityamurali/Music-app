const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    singers:{
        type: String,
    },
    album:{
        type: String,
    },
    playtime:{
        type: Number,
    },
    
})

const Song = mongoose.model('Song', SongSchema);

module.exports = { Song }