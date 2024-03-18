const mongoose=require('mongoose');

async function connectToDB(URL) {
    return mongoose.connect(URL);
}

module.exports={connectToDB};