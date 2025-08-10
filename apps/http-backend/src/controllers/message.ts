import { Response } from "express";
import {ProcessedMessage, User} from '../models/db';
import crypto from 'crypto';
import { AuthenticatedRequest } from "../types";

export function generateWamid(): string {
  const randomBytes = crypto.randomBytes(32);
  const base64 = randomBytes.toString('base64');
  return `wamid.${base64}`;
}

export const messageSend = async (req: AuthenticatedRequest, res: Response) => {
  const { to, message } = req.body;
  const from = req.wa_id;

  if (!from) {
    return res.status(401).json({ error: "Unauthorized: sender info not found in token" });
  }

  if (!to || !message) {
    return res.status(400).json({ error: "'to' and 'message' are required" });
  }

  const meta_msg_id = generateWamid();
  const timestamp = new Date();

  try {
    const receiver = await User.findOne({ wa_id: to });

    const receiverProfile = receiver
      ? {
          name: receiver.name || "",
          picture: receiver.picture || ""
        }
      : {
          name: "",
          picture: "",
          number: ""
        };

    const newMessage = await ProcessedMessage.create({
      meta_msg_id,
      from,
      to,
      content: message,
      timestamp,
      status: "sent",
      receiverProfile 
    });

    res.status(201).json({
      message: "Message stored successfully",
      data: newMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};


export const messageStatusUpdate = async(req: AuthenticatedRequest, res: Response)=>{
    
  const { status, wa_id } = req.body;

  if (!wa_id || !status) {
    return res.status(400).json({ error: 'Both wa_id and status are required' });
  }

  try {

    const latestMessage = await ProcessedMessage.findOne({ to: wa_id }).sort({ timestamp: -1 });

    if (!latestMessage) {
      return res.status(404).json({ error: 'No message found for given wa_id' });
    }

    await ProcessedMessage.updateOne(
      { _id: latestMessage._id },
      { $set: { status } }
    );

    res.json({
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: (error as Error).message });
  }
}

export const messageGet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const otherWaId = req.params.otherWaId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!otherWaId) {
      return res.status(400).json({ message: "otherWaId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userWaId = user.wa_id;

    const messages = await ProcessedMessage.find({
      $and: [
        { from: { $in: [userWaId, otherWaId] } },
        { to: { $in: [userWaId, otherWaId] } }
      ]
    }).sort({ timestamp: 1 }); 
    res.json({
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getChatList = async (req: AuthenticatedRequest, res: Response) => {
  const userWaId = String(req.wa_id || '');
  if (!userWaId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const conversations = await ProcessedMessage.aggregate([
      {
        $match: {
          $or: [
            { from: userWaId },
            { to: userWaId }
          ],
        },
      },
      {
        $addFields: {
          chatPartner: {
            $cond: [
              { $eq: ["$from", userWaId] },
              "$to",
              "$from"
            ],
          },
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$chatPartner",
          latestMessage: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latestMessage" } },
      {
        $lookup: {
          from: "contacts",
          localField: "chatPartner",  
          foreignField: "wa_id",      
          as: "partner"
        },
      },
      { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          from: 1,
          to: 1,
          content: 1,
          timestamp: 1,
          status: 1,
          chatPartner: 1,
          partnerId: "$partner._id",
          partnerName: "$partner.name",
          partnerPicture: "$partner.picture",
          partnerWaId: "$partner.wa_id",
        },
      },
      { $sort: { timestamp: -1 } },
    ]);

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
