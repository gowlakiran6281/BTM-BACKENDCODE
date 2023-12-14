import express from 'express';
import * as Album from '@controllers/album.controller'; // Import your controller functions
import { upload } from '@/utils/s3service';

const router = express.Router();

// Define routes for article operations
router.post('/createalbum',upload.single('AblumBanner'), Album.createAlbum); // Create a new article
router.get('/getall', Album.getallAlbums); // Get all articles
// router.get('/:id', Article.getArticleById); // Get a specific article by ID
router.get('/:name',Album.getAlbumByName);//Get a specific article by word
router.put('/Update/:id', Album.UpdateAlbumTitle); // Update an article by ID
router.delete('/delete/:id', Album.deleteAlbumById); // Delete an article by ID

// Add this route to handle getting an album by ID
router.get('/album/:id',Album.getAlbumById);

// router.delete('/delete/:id', Article.deleteArticleById);//deleteById


export default router;
