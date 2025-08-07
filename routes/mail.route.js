import express from "express";
import {
  createMail,
  deleteManyMails,
  getRecentsMails,
  markRead,
  starMail,
  trashMultipleMails,
  unTrashManyMails,
} from "../controllers/mail.controller.js";
import multer from "multer";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route("/").post(upload.single("file"), createMail);
router.route("/recent-mails").get(getRecentsMails);
router.route("/mark-read/:mailId").post(markRead);
router.route("/star/:mailId").post(starMail);
router.route("/trash-multiple").delete(trashMultipleMails);
router.route("/delete-multiple").delete(deleteManyMails);
router.route("/untrash-multiple").post(unTrashManyMails);

export default router;
