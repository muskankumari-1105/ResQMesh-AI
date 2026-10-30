import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  dataPath: path.join(__dirname, '..', 'data', 'resqmesh_db.json'),
  isSimulation: true,
  hackathonNotice: 'ResQMesh AI is a prototype for Build With Bharat 5.0. No real emergency services are contacted.'
};
