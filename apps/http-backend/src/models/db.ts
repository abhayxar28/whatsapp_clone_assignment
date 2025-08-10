import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  wa_id: { type: String, required: true, unique: true },
  name: { type: String},
  picture: { type: String }, 
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProcessedMessage' }],
  created_at: { type: Date, default: Date.now }
});

const ProcessedMessageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },   
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String },
  receiverProfile: {
    name: { type: String },
    picture: { type: String },       
    number: { type: String }
  },
});

export const User = mongoose.model('Contact', UserSchema);
export const ProcessedMessage = mongoose.model('ProcessedMessage', ProcessedMessageSchema);
