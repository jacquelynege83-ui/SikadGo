import express from 'express';

import { getDevices, registerNewDevice } from '../controllers/device.controller.js';

const router= express.Router();

router.post("/register", registerNewDevice);
router.get("/get",getDevices);
export default router;