import express from 'express';
import mongoose from 'mongoose';
import testRoutes from './routes/testRoutes'
import messageRoutes from './routes/messageRoutes'
import userRoutes from './routes/userRoutes'
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ limit: "2mb", extended: true }));
app.use(cors());

mongoose.connect(process.env.DATABASE_URL as string)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(console.error);

app.use('/api/v1', messageRoutes)
app.use('/api/v1', testRoutes);
app.use('/api/v1', userRoutes)


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
