import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    if (err || !files.audio) {
      return res.status(400).json({ error: 'Audio upload failed.' });
    }

    const selectedLang = Array.isArray(fields.lang) ? fields.lang[0] : fields.lang || 'hi';
    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    const audioPath = file.filepath;
    const outputPath = path.join(process.cwd(), 'output.mp3');

    const py = spawn('speech/bin/python3', ['script.py', audioPath, selectedLang, outputPath]);

    py.stderr.on('data', (data) => console.error(`stderr: ${data}`));

    py.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Python processing failed' });
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename=translated.mp3');
      const stream = fs.createReadStream(outputPath);
      stream.pipe(res);
    });
  });
}
