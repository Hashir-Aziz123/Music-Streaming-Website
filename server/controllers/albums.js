import { Album, Song } from '../db_entities.js';

export const getAllAlbums = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const albums = await Album.find({})
            .skip(skip)
            .limit(limit);
            
        const totalAlbums = await Album.countDocuments();
        
        res.status(200).json({
            albums,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalAlbums / limit),
                totalItems: totalAlbums,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

export const getAlbumById = async (req, res) => {
    try {
        const album = await Album.findOne({album_id: req.params.id});
        
        if (!album) {
            return res.status(404).json({error: "Album not found"});
        }
        
        res.status(200).json(album);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};