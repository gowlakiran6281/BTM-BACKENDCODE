import express from 'express';
import * as MainFolder from '@controllers/SubFolderPanchayithe/MainFolder.controller'
import { upload } from '@/utils/s3service';

const router = express.Router();

// Define routes for article operations
router.post('/create',upload.single('MainFolderBanner'), MainFolder.createMainFolder); // Create a new article
router.get('/getall', MainFolder.getallsongs); // Get all articles
// // router.get('/:id', Article.getArticleById); // Get a specific article by ID
router.get('/:MainFolderName',MainFolder.getMainFolderByName);//Get a specific article by word
// router.put('/Update/a:id', Album.UpdateAlbumTitle); // Update an article by ID
// router.delete('/delete/:id', Album.deleteAlbumById); // Delete an article by ID

// router.delete('/delete/:id', Article.deleteArticleById);//deleteById
// Add this route to handle getting a Main Folder by ID
router.get('/main-folder/:id',MainFolder.getMainFolderById);



export default router;
