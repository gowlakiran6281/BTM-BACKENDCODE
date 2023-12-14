import express from 'express';
import * as AudioMessage from '@controllers/SubFolderPanchayithe/AudioMessage.controller'
import { upload } from '@/utils/s3service';

const router = express.Router();

// Define routes for article operations
router.post("/audioupload", upload.fields([{ name: 'Music', maxCount: 1 }, { name: 'Banner', maxCount: 1 }]), AudioMessage.uploadAudioMessage);//upload
// router.get('/getall', Album.getallAlbums); // Get all articles
// // router.get('/:id', Article.getArticleById); // Get a specific article by ID
router.get('/main/:MainFolderName',AudioMessage.getMainFolderByName);//Get a specific article by word
router.get('/sub/:SubFolderName',AudioMessage.getsubFolderByName);//Get a specific article by word
// router.put('/Update/a:id', Album.UpdateAlbumTitle); // Update an article by ID
// router.delete('/delete/:id', Album.deleteAlbumById); // Delete an article by ID

// router.delete('/delete/:id', Article.deleteArticleById);//deleteById
// Add this route to handle getting an audio message by ID
router.get('/audio-message/:id',AudioMessage.getAudioMessageById);



export default router;
