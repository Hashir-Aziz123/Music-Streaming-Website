import { Artist, Song } from '../db_entities.js';

export const getAllArtists = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const artists = await Artist.find({})
            .skip(skip)
            .limit(limit);
            
        const totalArtists = await Artist.countDocuments();
        
        res.status(200).json({
            artists,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalArtists / limit),
                totalItems: totalArtists,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

export const getArtistById = async (req, res) => {
    try {
        const artist = await Artist.findOne({artistID: req.params.id});
        
        if (!artist) {
            return res.status(404).json({error: "Artist not found"});
        }
        
        res.status(200).json(artist);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};