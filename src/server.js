// import { MongoClient } from "mongodb";

// const MONGO_URI = 'mongodb+srv://adityasuman2025:aditya123@mngo.g2pfpl1.mongodb.net/?appName=mngo'
// const client = new MongoClient(MONGO_URI);
// async function mongoConnect() {
//     try {
//         await client.connect();
//         const dbYo = client.db("yo")
//         const collUsers = dbYo.collection("users");
//         const findFilter = await collUsers.find({ count: { $gt: 1 } }).project({ name: 1, count: 1 }).toArray();
//         console.log("findFilter", findFilter)
//         // const insert = await collUsers.insertMany([{ name: "Aditya Suman", address: "Ashanagar" }]);
//         // const _delete = await collUsers.deleteOne({ name: "Aditya Suman" });
//         const _rename = await collUsers.updateMany({ name: "Anvik Vinayak" }, { $inc: { count: 1 } });
//         const findAll = await collUsers.aggregate([{ $match: { address: "Ashanagar" } }]).toArray();
//         console.log("findAll", findAll)
//     } catch (e) {
//         console.log("error", e)
//     }
// }
// mongoConnect();

import express from "express";
const PORT = 2000;

const app = new express();
app.listen(PORT, () => {
    console.log("server is running on", PORT);
});

app.use("/bro", (req, res) => {
    res.send("hi bro");
});
app.use("/", (req, res) => {
    res.send("hi world");
});