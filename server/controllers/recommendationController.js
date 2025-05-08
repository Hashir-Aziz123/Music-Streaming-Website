import { getTopRecommendations } from '../services/recommendationService.js';

export async function fetchTopRecommendations(req, res) {
    const { userId } = req.params;

    console.log(userId);

    try {
        const recommendedSongs = await getTopRecommendations(userId);
        res.json(recommendedSongs);
    } catch (err) {
        console.error("Error fetching recommendations:", err);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
}
