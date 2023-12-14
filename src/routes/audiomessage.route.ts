import { Router } from "express";
import * as AudioMessage from "@/controllers/audiomessage.controller"
import { upload } from "@/utils/s3service";
const router = Router();


router.post("/audiomessageupload", upload.fields([ { name: 'Banner', maxCount: 1 }]), AudioMessage.uploade);//upload

router.put('/:folderName', AudioMessage.updateFolderDetails);//update

router.get('/getalls', AudioMessage.allfolder)

router.get('/getall', AudioMessage.allfolders);//getall
//  localhost:8080/v1/audiomessage/getall?page=1&limit=1

router.delete('/delete/:folderName', AudioMessage.deletefolderNameByName);//deleteByFolderName

router.get('/:name', AudioMessage.getFolderByName);//getByFolderName

// Add this route to handle getting an audio message by ID
// router.get('/audio-message/:id',AudioMessage.g);


export default router;