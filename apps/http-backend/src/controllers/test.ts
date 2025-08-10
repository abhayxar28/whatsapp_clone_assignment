import fs from 'fs';
import path from 'path';
import { ProcessedMessage, User } from '../models/db';
import { Response } from 'express';
import { AuthenticatedRequest } from '../types';

const folder = path.join(__dirname, 'json');
const payloads: any[] = [];
const files = fs.readdirSync(folder);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const fullPath = path.join(folder, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    try {
      const parsed = JSON.parse(raw);
      payloads.push(parsed);
    } catch (error) {
      console.error(`Error parsing JSON in file ${file}:`, error);
    }
  }
});

export const testMessage = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (payloads.length === 0) {
      return res.status(400).json({ error: 'No payloads to process' });
    }

    let insertCount = 0;

    for (const payload of payloads) {
      const entries = payload?.metaData?.entry || [];

      for (const entry of entries) {
        const changes = entry?.changes || [];

        for (const change of changes) {
          if (change.field === 'messages') {
            const messages = change?.value?.messages || [];
            const contacts = change?.value?.contacts || [];
            const metadata = change?.value?.metadata || {};

            const businessPhoneNumber = metadata.display_phone_number || '';

            const contact = contacts[0];
            const receiverName = contact?.profile?.name || '';
            const receiverWaId = contact?.wa_id || '';
            const receiverPicture = contact?.profile?.picture || '';

            for (const msg of messages) {
              const meta_msg_id = msg.id;
              const from = msg.from;
              const content = msg.text?.body || '';
              const timestamp = new Date(+msg.timestamp * 1000);
              if (!meta_msg_id || !from || !timestamp) continue;

              const existing = await ProcessedMessage.findOne({ meta_msg_id });
              if (existing) continue;

              const isOutgoing = from === businessPhoneNumber;

              const to = isOutgoing ? receiverWaId : businessPhoneNumber;

              const newMsg = await ProcessedMessage.create({
                meta_msg_id,
                from,
                to,
                content,
                timestamp,
                status: 'sent',
                receiverProfile: {
                  name: receiverName,
                  number: receiverWaId,
                  picture: receiverPicture,
                },
              });

              await User.findOneAndUpdate(
                { wa_id: from },
                { $addToSet: { messages: newMsg._id } }
              );

              insertCount++;
            }
          }
        }
      }
    }

    res.json({ insertedCount: insertCount });
  } catch (error) {
    console.error('Error processing payloads:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};
