import mongoose from "mongoose";
import dbConnect from "../db_connect.js";
import { recommendSongsForUser } from "../services/recommendationService.js";
import { User } from "../db_entities.js";

async function testRecommendations() {
    try {
        await mongoose.connect( "mongodb://localhost:27017/driftDB", { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        const user = await User.findOne();
        if (!user) throw new Error("No user found in database");

        console.log(`Running recommendations for user: ${user.name || user._id}`);

        const recommendations = await recommendSongsForUser(user);

        console.log("\nTop Recommended Songs:");
        recommendations.forEach(({ song, score }, index) => {
            console.log(`${index + 1}. ${song.title} — Score: ${score.toFixed(3)}`);
        });

        process.exit(0);
    } catch (err) {
        console.error("❌ Test failed:", err);
        process.exit(1);
    }
}

testRecommendations();
