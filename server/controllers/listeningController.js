import {Listening_History} from "../db_entities.js";
import { recommendSongsForUser} from "../services/recommendationService.js";
import {User} from "../db_entities.js";

const LISTEN_THRESHOLD = 10;

export async function logListening(req, res) {
    const {userId, songId , duration_listened} = req.body;

    try{
        await Listening_History.create({
            user: userId,
            song: songId,
            listenedAt: new Date(),
            duration_listened,
        });


        const ListenCount = await Listening_History.countDocuments({userId});

        console.log(userId, songId,duration_listened , new Date());
        console.log(ListenCount);

        if (ListenCount % LISTEN_THRESHOLD === 0) {
            const user = await User.findById(userId);
            await recommendSongsForUser(user);
            console.log("Recommendation updates")
        }


        res.status(200).json({message:"Recommendation updates successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to update recommendation"});
    }
}