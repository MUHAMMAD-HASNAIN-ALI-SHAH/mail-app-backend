import express from "express";
import {
  createMail,
  deleteMultipleMails,
  getRecentsMails,
  markRead,
  starMail,
  trash,
  unTrash,
} from "../controllers/mail.controller.js";
import multer from "multer";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route("/").post(upload.single("file"), createMail);
router.route("/recent-mails").get(getRecentsMails);
router.route("/mark-read/:mailId").post(markRead);
router.route("/star/:mailId").post(starMail);
router.route("/trash").post(trash);
router.route("/delete-multiple").delete(deleteMultipleMails);
router.route("/untrash").post(unTrash);

export default router;
