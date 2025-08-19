import { Request, Response } from 'express';
import { parseIncomingToText } from '../utils/parser';
import { validateAgainstStandards } from '../services/rulesEngine';
import { supabaseAdmin } from '../utils/supabase';

export const validateLcHandler = async (req: Request, res: Response) => {
  try {
    const textInput: unknown = req.body?.text;
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!textInput && !file) {
      return res.status(400).json({ error: 'Provide LC text in "text" field or upload a file in "file" form field.' });
    }

    const lcText = await parseIncomingToText({ text: typeof textInput === 'string' ? textInput : undefined, file });

    const result = await validateAgainstStandards(lcText);

    // Optional: store validation if authenticated (Authorization: Bearer <jwt>)
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : undefined;
    if (token && supabaseAdmin) {
      try {
        const { data: user, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user?.user) {
          await supabaseAdmin.from('validations').insert({
            user_id: user.user.id,
            lc_text: lcText,
            results: result,
          });
        }
      } catch (e) {
        // ignore persistence errors
      }
    }

    return res.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Validation error', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


