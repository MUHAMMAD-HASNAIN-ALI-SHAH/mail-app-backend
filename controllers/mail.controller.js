import Auth from "../models/auth.model.js";
import Mail from "../models/mail.model.js";
import cloudinary from "../config/cloudinary.js";
import { getUserSocketId } from "../config/socket.js";
import { io } from "../config/socket.js";

const createMail = async (req, res) => {
  try {
    let { username, subject, body } = req.body;
    const file = req.file;
    const senderId = req.session.user?.id;

    if (!username || !subject || !body || !senderId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    username = username.toLowerCase();

    const recipient = await Auth.findOne({ username });
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    if (recipient._id.toString() === senderId) {
      return res.status(400).json({ error: "Cannot send mail to yourself" });
    }

    let attachment = null;
    if (file) {
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "mail-attachments",
              access_mode: "public"
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
      };

      const uploadResult = await streamUpload();

      attachment = {
        url: uploadResult.secure_url,
        fileName: file.originalname,
        fileType: file.mimetype,
      };
    }

    const newMail = new Mail({
      sender: senderId,
      recipient: recipient._id,
      subject,
      body,
      attachments: attachment ? [attachment] : [],
      isReadBySender: true,
      isReadByRecipient: false,
      isStarredBySender: false,
      isStarredByRecipient: false,
      isTrashedBySender: false,
      isTrashedByRecipient: false,
      threadId: null,
    });

    const savedMail = await newMail.save();

    const populatedMail = await Mail.findById(savedMail._id)
      .populate("sender", "_id username")
      .populate("recipient", "_id username");

    const getRecipientSocketId = getUserSocketId(recipient._id);

    if (getRecipientSocketId) {
      io.to(getRecipientSocketId).emit("new-mail", {
        mail: populatedMail,
      });
    }

    res.status(201).json({
      message: "Mail sent successfully",
      mail: populatedMail,
    });
  } catch (error) {
    console.error("Error in createMail:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getRecentsMails = async (req, res) => {
  try {
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const recentMails = await Mail.find({
      $or: [
        {
          sender: userId,
          isDeletedBySender: false,
        },
        {
          recipient: userId,
          isDeletedByRecipient: false,
        },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "username")
      .populate("recipient", "username");

    res.status(200).json(recentMails);
  } catch (error) {
    console.error("Error in getRecentsMails:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const markRead = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { mailId } = req.params;

    if (!mailId) {
      return res.status(400).json({ error: "Missing mail ID" });
    }

    const mail = await Mail.findById(mailId);

    if (!mail) {
      return res.status(404).json({ error: "Mail not found" });
    }

    if (mail.recipient.toString() !== user.id) {
      return res.status(200).json({});
    }

    mail.isReadByRecipient = true;
    await mail.save();

    res.status(200).json({ message: "Mail marked as read" });
  } catch (error) {
    console.error("Error in markRead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const starMail = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { mailId } = req.params;

    if (!mailId) {
      return res.status(400).json({ error: "Missing mail ID" });
    }

    const mail = await Mail.findById(mailId);

    if (!mail) {
      return res.status(404).json({ error: "Mail not found" });
    }

    if (mail.sender.toString() === user.id) {
      mail.isStarredBySender = !mail.isStarredBySender;
    } else if (mail.recipient.toString() === user.id) {
      mail.isStarredByRecipient = !mail.isStarredByRecipient;
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    await mail.save();

    res.status(200).json({ message: "Mail starred status updated" });
  } catch (error) {
    console.error("Error in starMail:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const trash = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { mailIds } = req.body;

    if (!Array.isArray(mailIds) || mailIds.length === 0) {
      return res.status(400).json({ error: "Invalid mail IDs" });
    }

    const mails = await Mail.find({ _id: { $in: mailIds } });

    if (mails.length === 0) {
      return res.status(404).json({ error: "No mails found" });
    }

    for (const mail of mails) {
      if (mail.sender.toString() === user.id) {
        mail.isTrashedBySender = true;
      } else if (mail.recipient.toString() === user.id) {
        mail.isTrashedByRecipient = true;
      }
      await mail.save();
    }

    res.status(200).json({ message: "Mails deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMultipleMails:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteMail = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { mailIds } = req.body;

    if (!Array.isArray(mailIds) || mailIds.length === 0) {
      return res.status(400).json({ error: "Invalid mail IDs" });
    }

    const mails = await Mail.find({ _id: { $in: mailIds } });

    if (mails.length === 0) {
      return res.status(404).json({ error: "No mails found" });
    }

    for (const mail of mails) {
      if (mail.sender.toString() === user.id) {
        await Mail.findByIdAndUpdate(mail._id, { isDeletedBySender: true });
      } else if (mail.recipient.toString() === user.id) {
        await Mail.findByIdAndUpdate(mail._id, { isDeletedByRecipient: true });
      }
      if (mail.isDeletedBySender || mail.isDeletedByRecipient) {
        await Mail.findByIdAndDelete(mail._id);
      }
    }

    res.status(200).json({ message: "Mails deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMail:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const unTrash = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { mailIds } = req.body;

    if (!Array.isArray(mailIds) || mailIds.length === 0) {
      return res.status(400).json({ error: "Invalid mail IDs" });
    }

    const mails = await Mail.find({ _id: { $in: mailIds } });

    if (mails.length === 0) {
      return res.status(404).json({ error: "No mails found" });
    }

    for (const mail of mails) {
      if (mail.sender.toString() === user.id) {
        mail.isTrashedBySender = false;
      } else if (mail.recipient.toString() === user.id) {
        mail.isTrashedByRecipient = false;
      }
      await mail.save();
    }

    res.status(200).json({ message: "Mails untrashed successfully" });
  } catch (error) {
    console.error("Error in unTrashManyMails:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  createMail,
  getRecentsMails,
  markRead,
  starMail,
  trash,
  deleteMail,
  unTrash
};
