const {MongoClient} = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@achat.qeabg.mongodb.net/AChat?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

//
// const connectToTb = async () => {
//     // await client.connect();
// }
let aChatDb;

module.exports = {
    connectToTb: () => {
        client.connect((err, db) => {
            if(err || !db) {
                console.log("DB Connecting Error!")
                return;
            }
            aChatDb = db.db("AChat");
            console.log("Connected To >>>>>>AChat<<<<<<")
        })
    },
    getUsersDb: () => aChatDb.collection("_users"),
    getMessagesDb: () => aChatDb.collection("_messages"),
}
