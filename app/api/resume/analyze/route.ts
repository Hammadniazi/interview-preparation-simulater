import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume') as File | null;
    const textContent = formData.get('text') as string | null;

    let resumeText = textContent || '';

    if (file && file.size > 0) {
      // For PDF files, read as text (in production you'd use pdf-parse)
      resumeText = await file.text();
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Please provide valid resume content' },
        { status: 400 }
      );
    }

    const analysis = await analyzeResume(resumeText);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume. Please try again.' },
      { status: 500 }
    );
  }
}
