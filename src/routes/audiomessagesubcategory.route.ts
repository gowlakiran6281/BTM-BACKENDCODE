import { Router } from "express";
import * as Audio from "@/controllers/audiomessagesubcategory.controller"
import { upload } from "@/utils/s3service";
const router = Router();


router.post("/Audioupload", upload.fields([ { name: 'Banner', maxCount: 1 }, { name: 'Music', maxCount: 1 }]), Audio.uploade);//upload

router.put('/:id', Audio.updateSongDetails);//update

router.get('/getalls', Audio.allsongs)

router.get('/getall', Audio.allsong);//getall
//  /getall?page=1&limit=1

router.delete('/delete/:id', Audio.deleteSongById);


export default router;