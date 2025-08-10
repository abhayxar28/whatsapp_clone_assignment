import { Response } from 'express';
import { User, ProcessedMessage } from '../models/db'; 
import { AuthenticatedRequest } from '../types';
import jwt from 'jsonwebtoken'

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  const { wa_id, name, picture } = req.body;

  if (!wa_id) {
    return res.status(400).json({ error: 'wa_id is required' });
  }

  try {
    const existing = await User.findOne({ wa_id });

    if (existing) {
      return res.status(409).json({ error: 'User with same wa_id already exists' });
    }

    const relatedMessages = await ProcessedMessage.find({ from: wa_id }).select('_id');

    const newUser = new User({
      wa_id,
      name: name || '', 
      picture: picture || '',
      messages: relatedMessages.map((msg) => msg._id), 
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      contact: newUser
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const loginUser = async (req: AuthenticatedRequest, res: Response) => {
  const { wa_id } = req.body;

  if (!wa_id) {
    return res.status(400).json({ error: 'wa_id is required' });
  }

  try {
    const user = await User.findOne({ wa_id }).populate('messages');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign(
      { id: user._id,  wa_id: user.wa_id }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};


export const userAuth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const wa_id = req.wa_id;

    if (!wa_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ wa_id }).select("-password"); 

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      wa_id: user.wa_id,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};




