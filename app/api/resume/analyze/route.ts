import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/gemini';

// pdfjs-dist v5 references DOMMatrix at module load time, which is a
// browser-only API absent in Node.js (including Vercel's runtime).
// This polyfill must be set before pdf-parse is dynamically imported.
if (typeof globalThis.DOMMatrix === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true; isIdentity = true;

    constructor(init?: string | number[]) {
      if (Array.isArray(init)) {
        if (init.length === 6) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init;
          this.m11 = this.a; this.m12 = this.b;
          this.m21 = this.c; this.m22 = this.d;
          this.m41 = this.e; this.m42 = this.f;
        } else if (init.length === 16) {
          [this.m11, this.m12, this.m13, this.m14,
           this.m21, this.m22, this.m23, this.m24,
           this.m31, this.m32, this.m33, this.m34,
           this.m41, this.m42, this.m43, this.m44] = init;
          this.a = this.m11; this.b = this.m12;
          this.c = this.m21; this.d = this.m22;
          this.e = this.m41; this.f = this.m42;
          this.is2D = false;
        }
      }
    }

    multiply(o: DOMMatrix): DOMMatrix {
      const r = new DOMMatrix();
      r.m11 = this.m11*o.m11 + this.m12*o.m21 + this.m13*o.m31 + this.m14*o.m41;
      r.m12 = this.m11*o.m12 + this.m12*o.m22 + this.m13*o.m32 + this.m14*o.m42;
      r.m13 = this.m11*o.m13 + this.m12*o.m23 + this.m13*o.m33 + this.m14*o.m43;
      r.m14 = this.m11*o.m14 + this.m12*o.m24 + this.m13*o.m34 + this.m14*o.m44;
      r.m21 = this.m21*o.m11 + this.m22*o.m21 + this.m23*o.m31 + this.m24*o.m41;
      r.m22 = this.m21*o.m12 + this.m22*o.m22 + this.m23*o.m32 + this.m24*o.m42;
      r.m23 = this.m21*o.m13 + this.m22*o.m23 + this.m23*o.m33 + this.m24*o.m43;
      r.m24 = this.m21*o.m14 + this.m22*o.m24 + this.m23*o.m34 + this.m24*o.m44;
      r.m31 = this.m31*o.m11 + this.m32*o.m21 + this.m33*o.m31 + this.m34*o.m41;
      r.m32 = this.m31*o.m12 + this.m32*o.m22 + this.m33*o.m32 + this.m34*o.m42;
      r.m33 = this.m31*o.m13 + this.m32*o.m23 + this.m33*o.m33 + this.m34*o.m43;
      r.m34 = this.m31*o.m14 + this.m32*o.m24 + this.m33*o.m34 + this.m34*o.m44;
      r.m41 = this.m41*o.m11 + this.m42*o.m21 + this.m43*o.m31 + this.m44*o.m41;
      r.m42 = this.m41*o.m12 + this.m42*o.m22 + this.m43*o.m32 + this.m44*o.m42;
      r.m43 = this.m41*o.m13 + this.m42*o.m23 + this.m43*o.m33 + this.m44*o.m43;
      r.m44 = this.m41*o.m14 + this.m42*o.m24 + this.m43*o.m34 + this.m44*o.m44;
      r.a = r.m11; r.b = r.m12; r.c = r.m21; r.d = r.m22; r.e = r.m41; r.f = r.m42;
      return r;
    }

    translate(tx = 0, ty = 0, tz = 0): DOMMatrix {
      return this.multiply(new DOMMatrix([1,0,0,0, 0,1,0,0, 0,0,1,0, tx,ty,tz,1]));
    }

    scale(sx = 1, sy?: number, sz = 1): DOMMatrix {
      const m = new DOMMatrix(); m.m11 = sx; m.m22 = sy ?? sx; m.m33 = sz;
      m.a = sx; m.d = sy ?? sx;
      return this.multiply(m);
    }

    rotate(rx = 0, ry?: number, rz?: number): DOMMatrix {
      const deg = rz ?? rx;
      const r = deg * (Math.PI / 180);
      const cos = Math.cos(r); const sin = Math.sin(r);
      return this.multiply(new DOMMatrix([cos, sin, -sin, cos, 0, 0]));
    }

    inverse(): DOMMatrix {
      const det = this.a * this.d - this.b * this.c;
      if (Math.abs(det) < 1e-10) return new DOMMatrix();
      const m = new DOMMatrix();
      m.a = this.d / det;  m.b = -this.b / det;
      m.c = -this.c / det; m.d = this.a / det;
      m.e = (this.c * this.f - this.d * this.e) / det;
      m.f = (this.b * this.e - this.a * this.f) / det;
      m.m11 = m.a; m.m12 = m.b; m.m21 = m.c; m.m22 = m.d; m.m41 = m.e; m.m42 = m.f;
      return m;
    }

    transformPoint(p?: { x?: number; y?: number; z?: number; w?: number }) {
      const x = p?.x ?? 0; const y = p?.y ?? 0;
      const z = p?.z ?? 0; const w = p?.w ?? 1;
      return {
        x: this.m11*x + this.m21*y + this.m31*z + this.m41*w,
        y: this.m12*x + this.m22*y + this.m32*z + this.m42*w,
        z: this.m13*x + this.m23*y + this.m33*z + this.m43*w,
        w: this.m14*x + this.m24*y + this.m34*z + this.m44*w,
      };
    }

    static fromMatrix(o: DOMMatrix): DOMMatrix { return new DOMMatrix([
      o.m11,o.m12,o.m13,o.m14, o.m21,o.m22,o.m23,o.m24,
      o.m31,o.m32,o.m33,o.m34, o.m41,o.m42,o.m43,o.m44,
    ]); }
  };
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? '';
  } finally {
    await parser.destroy().catch(() => {});
  }
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
