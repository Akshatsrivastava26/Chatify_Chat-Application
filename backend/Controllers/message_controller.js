// // const Message = require("../Models/Message.js");
// // const Conversation = require("../Models/Conversation.js");
// // const { GoogleGenerativeAI } = require("@google/generative-ai");
// // const imageupload = require("../config/imageupload.js");
// // const dotenv = require("dotenv");
// // dotenv.config({ path: "./.env" });
// // const {
// //   AWS_BUCKET_NAME,
// //   AWS_SECRET,
// //   AWS_ACCESS_KEY,
// // } = require("../secrets.js");
// // const { S3Client } = require("@aws-sdk/client-s3");
// // const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");

// // const configuration = new GoogleGenerativeAI(process.env.GENERATIVE_API_KEY);
// // const modelId = "gemini-1.5-flash";
// // const model = configuration.getGenerativeModel({ model: modelId });

// // const sendMessage = async (req, res) => {
// //   var imageurl = "";

// //   if (req.file) {
// //     imageurl = await imageupload(req.file, false);
// //   }

// //   try {
// //     const { conversationId, sender, text } = req.body;
// //     if (!conversationId || !sender || !text) {
// //       return res.status(400).json({
// //         error: "Please fill all the fields",
// //       });
// //     }

// //     const conversation = await Conversation.findById(conversationId).populate(
// //       "members",
// //       "-password"
// //     );

// //     //check if conversation contains bot
// //     var isbot = false;

// //     conversation.members.forEach((member) => {
// //       if (member != sender && member.email.includes("bot")) {
// //         isbot = true;
// //       }
// //     });

// //     if (!isbot) {
// //       const newMessage = new Message({
// //         conversationId,
// //         sender,
// //         text,
// //         imageurl,
// //         seenBy: [sender],
// //       });

// //       await newMessage.save();
// //       console.log("newMessage saved");

// //       conversation.updatedAt = new Date();
// //       await conversation.save();

// //       res.json(newMessage);
// //     }
// //   } catch (error) {
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // const allMessage = async (req, res) => {
// //   try {
// //     const messages = await Message.find({
// //       conversationId: req.params.id,
// //       deletedFrom: { $ne: req.user.id },
// //     });

// //     messages.forEach(async (message) => {
// //       let isUserAddedToSeenBy = false;
// //       message.seenBy.forEach((element) => {
// //         if (element.user == req.user.id) {
// //           isUserAddedToSeenBy = true;
// //         }
// //       });
// //       if (!isUserAddedToSeenBy) {
// //         message.seenBy.push({ user: req.user.id });
// //       }
// //       await message.save();
// //     });

// //     res.json(messages);
// //   } catch (error) {
// //     console.error(error.message);
// //     res.status(500).send("Internal Server Error");
// //   }
// // };

// // const deletemesage = async (req, res) => {
// //   const msgid = req.body.messageid;
// //   const userids = req.body.userids;
// //   try {
// //     const message = await Message.findById(msgid);

// //     userids.forEach(async (userid) => {
// //       if (!message.deletedby.includes(userid)) {
// //         message.deletedby.push(userid);
// //       }
// //     });
// //     await message.save();
// //     res.status(200).send("Message deleted successfully");
// //   } catch (error) {
// //     console.log(error.message);
// //     res.status(500).send({ error: "Internal Server Error" });
// //   }
// // };

// // const getPresignedUrl = async (req, res) => {
// //   const filename = req.query.filename;
// //   const filetype = req.query.filetype;

// //   if (!filename || !filetype) {
// //     return res
// //       .status(400)
// //       .json({ error: "Filename and filetype are required" });
// //   }

// //   const validFileTypes = [
// //     "image/jpeg",
// //     "image/png",
// //     "image/jpg",
// //     "application/pdf",
// //     "application/msword",
// //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// //     "application/vnd.ms-excel",
// //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
// //     "application/vnd.ms-powerpoint",
// //     "application/vnd.openxmlformats-officedocument.presentationml.presentation",
// //     "application/zip",
// //   ];

// //   if (!validFileTypes.includes(filetype)) {
// //     return res.status(400).json({ error: "Invalid file type" });
// //   }

// //   const userId = req.user.id;
// //   const s3Client = new S3Client({
// //     credentials: {
// //       accessKeyId: AWS_ACCESS_KEY,
// //       secretAccessKey: AWS_SECRET,
// //     },
// //     region: "ap-south-1",
// //   });

// //   try {
// //     const { url, fields } = await createPresignedPost(s3Client, {
// //       Bucket: AWS_BUCKET_NAME,
// //       Key: `conversa/${userId}/${Math.random()}/${filename}`,
// //       Conditions: [["content-length-range", 0, 5 * 1024 * 1024]],
// //       Fields: {
// //         success_action_status: "201",
// //       },
// //       Expires: 15 * 60,
// //     });

// //     return res.status(200).json({ url, fields });
// //   } catch (error) {
// //     return res.status(500).json({ error: error.message });
// //   }
// // };

// // const getAiResponse = async (prompt, senderId, conversationId) => {
// //   var currentMessages = [];
// //   const conv = await Conversation.findById(conversationId);
// //   const botId = conv.members.find((member) => member != senderId);

// //   const messagelist = await Message.find({
// //     conversationId: conversationId,
// //   })
// //     .sort({ createdAt: -1 })
// //     .limit(20);

// //   messagelist.forEach((message) => {
// //     if (message.senderId == senderId) {
// //       currentMessages.push({
// //         role: "user",
// //         parts: message.text,
// //       });
// //     } else {
// //       currentMessages.push({
// //         role: "model",
// //         parts: message.text,
// //       });
// //     }
// //   });

// //   // reverse currentMessages
// //   currentMessages = currentMessages.reverse();

// //   try {
// //     const chat = model.startChat({
// //       history: currentMessages,
// //       generationConfig: {
// //         maxOutputTokens: 2000,
// //       },
// //     });

// //     const result = await chat.sendMessage(prompt);
// //     const response = result.response;
// //     var responseText = response.text();

// //     if (responseText.length < 1) {
// //       responseText = "Woops!! thats soo long ask me something in short.";
// //       return -1;
// //     }

// //     await Message.create({
// //       conversationId: conversationId,
// //       senderId: senderId,
// //       text: prompt,
// //       seenBy: [{ user: botId, seenAt: new Date() }],
// //     });

// //     const botMessage = await Message.create({
// //       conversationId: conversationId,
// //       senderId: botId,
// //       text: responseText,
// //     });

// //     conv.latestmessage = responseText;
// //     await conv.save();

// //     return botMessage;
// //   } catch (error) {
// //     console.log(error.message);
// //     return "some error occured while generating response";
// //   }
// // };

// // const sendMessageHandler = async (data) => {
// //   const {
// //     text,
// //     imageUrl,
// //     senderId,
// //     conversationId,
// //     receiverId,
// //     isReceiverInsideChatRoom,
// //   } = data;
// //   const conversation = await Conversation.findById(conversationId);
// //   if (!isReceiverInsideChatRoom) {
// //     const message = await Message.create({
// //       conversationId,
// //       senderId,
// //       text,
// //       imageUrl,
// //       seenBy: [],
// //     });

// //     // update conversation latest message and increment unread count of receiver by 1
// //     conversation.latestmessage = text;
// //     conversation.unreadCounts.map((unread) => {
// //       if (unread.userId.toString() == receiverId.toString()) {
// //         unread.count += 1;
// //       }
// //     });
// //     await conversation.save();
// //     return message;
// //   } else {
// //     // create new message with seenby receiver
// //     const message = await Message.create({
// //       conversationId,
// //       senderId,
// //       text,
// //       seenBy: [
// //         {
// //           user: receiverId,
// //           seenAt: new Date(),
// //         },
// //       ],
// //     });
// //     conversation.latestmessage = text;
// //     await conversation.save();
// //     return message;
// //   }
// // };

// // const deleteMessageHandler = async (data) => {
// //   const { messageId, deleteFrom } = data;
// //   const message = await Message.findById(messageId);

// //   if (!message) {
// //     return false;
// //   }

// //   try {
// //     deleteFrom.forEach(async (userId) => {
// //       if (!message.deletedFrom.includes(userId)) {
// //         message.deletedFrom.push(userId);
// //       }
// //     });
// //     await message.save();

// //     return true;
// //   } catch (error) {
// //     console.log(error.message);
// //     return false;
// //   }
// // };

// // module.exports = {
// //   sendMessage,
// //   allMessage,
// //   getPresignedUrl,
// //   getAiResponse,
// //   deletemesage,
// //   sendMessageHandler,
// //   deleteMessageHandler,
// // };

// const Message = require("../Models/Message.js");
// const Conversation = require("../Models/Conversation.js");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const imageupload = require("../config/imageupload.js");
// const dotenv = require("dotenv");
// dotenv.config({ path: "./.env" });

// const {
//   AWS_BUCKET_NAME,
//   AWS_SECRET,
//   AWS_ACCESS_KEY,
// } = require("../secrets.js");

// const { S3Client } = require("@aws-sdk/client-s3");
// const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");

// /* =======================
//    GEMINI CONFIG (FINAL)
// ======================= */
// const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_API_KEY);

// const model = genAI.getGenerativeModel({
//   model: "gemini-2.0-flash",
// });

// /* =======================
//    SEND MESSAGE
// ======================= */
// const sendMessage = async (req, res) => {
//   let imageurl = "";

//   if (req.file) {
//     imageurl = await imageupload(req.file, false);
//   }

//   try {
//     const { conversationId, sender, text } = req.body;

//     if (!conversationId || !sender || !text) {
//       return res.status(400).json({ error: "Please fill all fields" });
//     }

//     const conversation = await Conversation.findById(conversationId).populate(
//       "members",
//       "-password"
//     );

//     let isBot = false;
//     conversation.members.forEach((member) => {
//       if (member._id.toString() !== sender && member.email.includes("bot")) {
//         isBot = true;
//       }
//     });

//     if (!isBot) {
//       const newMessage = new Message({
//         conversationId,
//         sender,
//         text,
//         imageurl,
//         seenBy: [{ user: sender, seenAt: new Date() }],
//       });

//       await newMessage.save();
//       conversation.updatedAt = new Date();
//       await conversation.save();

//       return res.json(newMessage);
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };

// /* =======================
//    GET ALL MESSAGES
// ======================= */
// const allMessage = async (req, res) => {
//   try {
//     const messages = await Message.find({
//       conversationId: req.params.id,
//       deletedFrom: { $ne: req.user.id },
//     });

//     for (const message of messages) {
//       const alreadySeen = message.seenBy.some(
//         (item) => item.user.toString() === req.user.id
//       );

//       if (!alreadySeen) {
//         message.seenBy.push({ user: req.user.id, seenAt: new Date() });
//         await message.save();
//       }
//     }

//     res.json(messages);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };

// /* =======================
//    DELETE MESSAGE
// ======================= */
// const deletemesage = async (req, res) => {
//   try {
//     const { messageid, userids } = req.body;
//     const message = await Message.findById(messageid);

//     userids.forEach((id) => {
//       if (!message.deletedFrom.includes(id)) {
//         message.deletedFrom.push(id);
//       }
//     });

//     await message.save();
//     res.status(200).send("Message deleted successfully");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };

// /* =======================
//    PRESIGNED S3 URL
// ======================= */
// const getPresignedUrl = async (req, res) => {
//   const { filename, filetype } = req.query;

//   if (!filename || !filetype) {
//     return res.status(400).json({ error: "Filename and filetype required" });
//   }

//   const s3Client = new S3Client({
//     region: "ap-south-1",
//     credentials: {
//       accessKeyId: AWS_ACCESS_KEY,
//       secretAccessKey: AWS_SECRET,
//     },
//   });

//   try {
//     const { url, fields } = await createPresignedPost(s3Client, {
//       Bucket: AWS_BUCKET_NAME,
//       Key: `conversa/${req.user.id}/${Date.now()}_${filename}`,
//       Conditions: [["content-length-range", 0, 5 * 1024 * 1024]],
//       Expires: 900,
//     });

//     res.json({ url, fields });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// /* =======================
//    AI RESPONSE (FINAL)
// ======================= */
// const getAiResponse = async (prompt, senderId, conversationId) => {
//   try {
//     let history = [];

//     const conversation = await Conversation.findById(conversationId);
//     const botId = conversation.members.find(
//       (m) => m.toString() !== senderId.toString()
//     );

//     const messages = await Message.find({ conversationId })
//       .sort({ createdAt: -1 })
//       .limit(20);

//     messages.reverse().forEach((msg) => {
//       history.push({
//         role:
//           msg.sender.toString() === senderId.toString() ? "user" : "model",
//         parts: [{ text: msg.text }],
//       });
//     });

//     const chat = model.startChat({
//       history,
//       generationConfig: { maxOutputTokens: 2000 },
//     });

//     const result = await chat.sendMessage(prompt);
//     const responseText =
//       result.response.text() || "Please ask a shorter question 🙂";

//     await Message.create({
//       conversationId,
//       sender: senderId,
//       text: prompt,
//       seenBy: [{ user: botId, seenAt: new Date() }],
//     });

//     const botMessage = await Message.create({
//       conversationId,
//       sender: botId,
//       text: responseText,
//     });

//     conversation.latestmessage = responseText;
//     await conversation.save();

//     return botMessage;
//   } catch (error) {
//     console.log("AI ERROR:", error.message);
//     return null;
//   }
// };

// /* =======================
//    SOCKET HANDLERS
// ======================= */
// const sendMessageHandler = async (data) => {
//   const {
//     text,
//     imageUrl,
//     senderId,
//     conversationId,
//     receiverId,
//     isReceiverInsideChatRoom,
//   } = data;

//   const conversation = await Conversation.findById(conversationId);

//   const message = await Message.create({
//     conversationId,
//     sender: senderId,
//     text,
//     imageUrl,
//     seenBy: isReceiverInsideChatRoom
//       ? [{ user: receiverId, seenAt: new Date() }]
//       : [],
//   });

//   conversation.latestmessage = text;
//   await conversation.save();

//   return message;
// };

// const deleteMessageHandler = async (data) => {
//   const { messageId, deleteFrom } = data;
//   const message = await Message.findById(messageId);

//   deleteFrom.forEach((id) => {
//     if (!message.deletedFrom.includes(id)) {
//       message.deletedFrom.push(id);
//     }
//   });

//   await message.save();
//   return true;
// };

// /* =======================
//    EXPORTS
// ======================= */
// module.exports = {
//   sendMessage,
//   allMessage,
//   getPresignedUrl,
//   getAiResponse,
//   deletemesage,
//   sendMessageHandler,
//   deleteMessageHandler,
// };


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
    { role: "system", content: "You are a helpful AI chatbot." },
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
