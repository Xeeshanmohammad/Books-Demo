const mongoose = require('mongoose');

const connectDB = async ()=>{
    mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true    
    }).then(()=>console.log("Database is Connected"))
    .catch((error)=>console.log("Database is not connected ", error))
}

module.exports = connectDB;