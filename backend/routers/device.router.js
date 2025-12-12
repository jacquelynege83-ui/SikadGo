import express from 'express';

import { deviceOnline, getDevices, registerNewDevice } from '../controllers/device.controller.js';

const router= express.Router();

router.post("/register", registerNewDevice);
router.get("/get",getDevices);
router.post("/online", deviceOnline);
export default router;
