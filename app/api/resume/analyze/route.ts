import { NextResponse, type NextRequest } from 'next/server';
import { analyzeResume } from '@/lib/ai';
import { errorResponse } from '@/lib/api';

const MAX_BYTES = 5 * 1024 * 1024;
const MIN_CHARS = 50;
const MAX_CHARS = 8000;

class UserFacingError extends Error {}

async function extractText(file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new UserFacingError('That file is larger than 5 MB.');
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text ?? '';
    } catch (err) {
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      if (msg.includes('password') || msg.includes('encrypt')) {
        throw new UserFacingError('This PDF is password-protected. Remove the password, or paste the text instead.');
      }
      throw new UserFacingError("We couldn't read this PDF. Try another file, or paste the text instead.");
    }
  }

  if (name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth');
    return (await mammoth.extractRawText({ buffer })).value;
  }

  if (name.endsWith('.txt') || file.type === 'text/plain') return buffer.toString('utf-8');

  throw new UserFacingError('Unsupported file type. Upload a PDF, DOCX or TXT file.');
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('resume');
    const pasted = form.get('text');

    let resumeText = typeof pasted === 'string' ? pasted.trim() : '';
    if (file instanceof File && file.size > 0) resumeText = (await extractText(file)).trim();

    if (resumeText.length < MIN_CHARS) {
      return NextResponse.json(
        { error: "There isn't enough text to analyse. If this is a scanned PDF, paste the text instead." },
        { status: 400 },
      );
    }

    const analysis = await analyzeResume(resumeText.slice(0, MAX_CHARS));
    return NextResponse.json({ analysis });
  } catch (err) {
    if (err instanceof UserFacingError) return NextResponse.json({ error: err.message }, { status: 400 });
    return errorResponse(err, 'analyse your resume');
  }
}
