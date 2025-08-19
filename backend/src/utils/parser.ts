import pdfParse from 'pdf-parse';

type Incoming = {
  text?: string;
  file?: Express.Multer.File;
};

export async function parseIncomingToText(input: Incoming): Promise<string> {
  if (input.text && input.text.trim().length > 0) {
    return input.text.trim();
  }

  const file = input.file;
  if (!file) {
    throw new Error('No input provided');
  }

  const contentType = file.mimetype || '';
  if (contentType === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    const data = await pdfParse(file.buffer);
    return (data.text || '').trim();
  }

  // Treat as text file by default
  return file.buffer.toString('utf8').trim();
}


