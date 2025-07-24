const Chat = require('../models/Chat');

const assignToDefaultChats = async (user) => {
  const chatNames = [
    { name: 'LPU', type: 'global' },
    { name: user.course, type: 'course' },
    { name: `${user.course} ${user.passingYear}`, type: 'batch' },
    { name: `${user.state} Students`, type: 'state' }
  ];

  const chatIds = [];

  for (const chatMeta of chatNames) {
    let chat = await Chat.findOne({ name: chatMeta.name, type: chatMeta.type });
    if (!chat) {
      chat = await Chat.create({
        name: chatMeta.name,
        type: chatMeta.type,
        participants: [user._id]
      });
    } else {
      if (!chat.participants.includes(user._id)) {
        chat.participants.push(user._id);
        await chat.save();
      }
    }
    chatIds.push(chat._id);
  }

  user.chats = chatIds;
  await user.save();
};

module.exports = assignToDefaultChats;
