import { Router } from "express";
import * as Music from "@/controllers/audiomessagecategory.controller"
import { upload } from "@/utils/s3service";
import SecondFolder from "@/models/audiomessagecategory.model";

// import { BannerUpload } from '@/controllers/audiomessagecategory.controller'; // Adjust the path accordingly

// import Banner from "@/models/banner.model";
const router = Router();


/**
 * @route POST /audio/audioupload
 * @description upload Muisc, banner and other details
 * @access Public
 */
// router.post('/BannerUpload', upload);//update

router.post('/bannerupload', upload.fields([{name:'Banner', maxCount:1}]),Music.uploads);
router.get('/getbyId/:id', Music.getBannerById);//getById

router.get('/getall', Music.getAllBanners);
router.get('/getByName/:name', Music.getBannerByName);
router.delete('/deletebyId/:id', Music.deleteBannerById);


export default router;