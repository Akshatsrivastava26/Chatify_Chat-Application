const Message = require("../Models/Message.js");
const Conversation = require("../Models/Conversation.js");
const imageupload = require("../config/imageupload.js");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const Groq = require("groq-sdk");

const {
  AWS_BUCKET_NAME,
  AWS_SECRET,
  AWS_ACCESS_KEY,
} = require("../secrets.js");

const { S3Client } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");

/* =======================
   GROQ CONFIG (FREE)
======================= */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =======================
   SEND MESSAGE (REST)
======================= */
const sendMessage = async (req, res) => {
  let imageurl = "";

  if (req.file) {
    imageurl = await imageupload(req.file, false);
  }

  try {
    const { conversationId, sender, text } = req.body;

    if (!conversationId || !sender || !text) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    const conversation = await Conversation.findById(conversationId).populate(
      "members",
      "-password"
    );

    let isBot = false;
    conversation.members.forEach((member) => {
      if (member._id.toString() !== sender && member.email.includes("bot")) {
        isBot = true;
      }
    });

    if (!isBot) {
  const newMessage = new Message({
    conversationId,
    senderId: sender,     // ✅ SAHI
    text,
    imageurl,
    seenBy: [{ user: sender, seenAt: new Date() }],
  });

  await newMessage.save();
  conversation.updatedAt = new Date();
  await conversation.save();

  return res.json(newMessage);
}

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

/* =======================
   GET ALL MESSAGES
======================= */
const allMessage = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.id,
      deletedFrom: { $ne: req.user.id },
    });

    for (const message of messages) {
      const alreadySeen = message.seenBy.some(
        (item) => item.user.toString() === req.user.id
      );

      if (!alreadySeen) {
        message.seenBy.push({ user: req.user.id, seenAt: new Date() });
        await message.save();
      }
    }

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

/* =======================
   DELETE MESSAGE
======================= */
const deletemesage = async (req, res) => {
  try {
    const { messageid, userids } = req.body;
    const message = await Message.findById(messageid);

    userids.forEach((id) => {
      if (!message.deletedFrom.includes(id)) {
        message.deletedFrom.push(id);
      }
    });

    await message.save();
    res.status(200).send("Message deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

/* =======================
   PRESIGNED S3 URL
======================= */
const getPresignedUrl = async (req, res) => {
  const { filename, filetype } = req.query;

  if (!filename || !filetype) {
    return res.status(400).json({ error: "Filename and filetype required" });
  }

  const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET,
    },
  });

  try {
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: AWS_BUCKET_NAME,
      Key: `conversa/${req.user.id}/${Date.now()}_${filename}`,
      Conditions: [["content-length-range", 0, 5 * 1024 * 1024]],
      Expires: 900,
    });

    res.json({ url, fields });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =======================
   AI RESPONSE (GROQ)
======================= */
const getAiResponse = async (prompt, senderId, conversationId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    const botId = conversation.members.find(
      (m) => m.toString() !== senderId.toString()
    );

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(20);

    const history = messages.reverse().map((msg) => ({
  role:
    msg.senderId.toString() === senderId.toString() ? "user" : "assistant",
  content: msg.text,
}));


    const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    { 
  role: "system", 
  content: `
You are a friendly AI chatbot integrated into a real-time chat application.
Never say you are a language model or mention AI internals.
Respond naturally, politely, and concisely.
If the user chats casually, reply casually.
If the user asks technical questions, reply clearly.
`
},
    ...history,
    { role: "user", content: prompt },
  ],
});


    const responseText =
      completion.choices[0]?.message?.content ||
      "AI is busy right now, please try again.";

    const botMessage = await Message.create({
  conversationId,
  senderId: botId,
  text: responseText,
});



    conversation.latestmessage = responseText;
    await conversation.save();

    return botMessage;
  } catch (error) {
    console.log("AI ERROR:", error.message);
    return null;
  }
};

/* =======================
   SOCKET HANDLERS
======================= */
const sendMessageHandler = async (data) => {
  const {
    text,
    imageUrl,
    senderId,
    conversationId,
    receiverId,
    isReceiverInsideChatRoom,
  } = data;

  const conversation = await Conversation.findById(conversationId);

  const message = await Message.create({
  conversationId,
  senderId: senderId,   // ✅ SAHI
  text,
  imageUrl,
  seenBy: isReceiverInsideChatRoom
    ? [{ user: receiverId, seenAt: new Date() }]
    : [],
});


  conversation.latestmessage = text;
  await conversation.save();

  return message;
};

const deleteMessageHandler = async (data) => {
  const { messageId, deleteFrom } = data;
  const message = await Message.findById(messageId);

  deleteFrom.forEach((id) => {
    if (!message.deletedFrom.includes(id)) {
      message.deletedFrom.push(id);
    }
  });

  await message.save();
  return true;
};

/* =======================
   EXPORTS
======================= */
module.exports = {
  sendMessage,
  allMessage,
  getPresignedUrl,
  getAiResponse,
  deletemesage,
  sendMessageHandler,
  deleteMessageHandler,
};
