import mongoose from "mongoose";

export default async function dbConnect() {
    await mongoose.connect("mongodb://localhost:27017/driftDB", {useNewUrlParser: true, useUnifiedTopology: true});
    console.log('Connected to MongoDB');
}