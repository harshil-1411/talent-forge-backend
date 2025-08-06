import mongoose, {Schema} from "mongoose";

const MessageSchema = new Schema({
  conversationId: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
},{
  timestamps:true
});


export const Message = mongoose.model("Message", MessageSchema);