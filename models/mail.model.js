import mongoose from "mongoose";

const mailSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    subject: {
      type: String,
      default: "(no subject)",
    },
    body: {
      type: String,
      required: true,
    },
    attachment: {
      type: String,
    },
    isReadBySender: {
      type: Boolean,
      default: true,
    },
    isReadByRecipient: {
      type: Boolean,
      default: false,
    },
    isStarredBySender: {
      type: Boolean,
      default: false,
    },
    isStarredByRecipient: {
      type: Boolean,
      default: false,
    },
    isTrashedBySender: {
      type: Boolean,
      default: false,
    },
    isTrashedByRecipient: {
      type: Boolean,
      default: false,
    },
    isDeletedBySender: {
      type: Boolean,
      default: false,
    },
    isDeletedByRecipient: {
      type: Boolean,
      default: false,
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mail",
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mail",
    },
  },
  { timestamps: true }
);

const Mail = mongoose.model("Mail", mailSchema);

export default Mail;
