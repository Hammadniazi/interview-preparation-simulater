import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/gemini';

async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
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
        { error: 'Could not extract enough text from the file. Try the "Paste Text" tab and paste your resume content directly.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeResume(resumeText.slice(0, 8000));
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Resume analysis error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('Unsupported file type')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to analyze resume. Please try again, or use the "Paste Text" tab.' },
      { status: 500 }
    );
  }
}
