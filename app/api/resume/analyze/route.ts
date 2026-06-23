import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/gemini';

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text ?? '';
}

async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    try {
      const text = await extractTextFromPDF(buffer);
      return text;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('encrypt')) {
        throw new Error('This PDF is password-protected. Please remove the password and try again, or use the "Paste Text" tab.');
      }
      if (msg.toLowerCase().includes('invalid pdf') || msg.toLowerCase().includes('invalid structure')) {
        throw new Error('The PDF file appears to be corrupted or invalid. Please try a different file or use the "Paste Text" tab.');
      }
      throw new Error(`PDF parsing failed: ${msg}. Please try a different PDF or use the "Paste Text" tab.`);
    }
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')
  ) {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
    return buffer.toString('utf-8');
  }

  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume') as File | null;
    const textContent = formData.get('text') as string | null;

    let resumeText = textContent?.trim() || '';

    if (file && file.size > 0) {
      resumeText = await extractTextFromFile(file);
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract enough text from the file. If this is a scanned PDF, use the "Paste Text" tab and paste your resume content directly.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeResume(resumeText.slice(0, 8000));
    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const isUserError =
      message.includes('Unsupported file type') ||
      message.includes('password-protected') ||
      message.includes('corrupted or invalid') ||
      message.includes('PDF parsing failed');

    if (isUserError) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume. Please try again, or use the "Paste Text" tab.' },
      { status: 500 }
    );
  }
}
