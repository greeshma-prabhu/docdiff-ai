import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    const { diffText, additions, deletions } = await req.json();

    // Check for no changes *before* calling AI
    if (additions === 0 && deletions === 0) {
      return NextResponse.json({ 
        summary: "Documents are identical." 
      });
    }

    if (!diffText) {
      return NextResponse.json(
        { error: 'Diff text is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
      You are an expert document analyst. Compare the two document versions based on the Git-style diff below.

      **CONTEXT:**
      - Lines starting with \`+\` are **Added**.
      - Lines starting with \`-\` are **Removed**.
      - Lines starting with space are **Unchanged**.

      **DIFF CONTENT:**
      """
      ${diffText.substring(0, 30000)}
      """

      **INSTRUCTIONS:**
      1. **Detect Document Relationship:**
         - If the documents look completely different (massive removal of text A and addition of text B with little shared context), explicitly state: **"These appear to be two completely different documents."** Then summarize Doc A vs Doc B briefly.
         - If they are the same document with edits, proceed to analyze the changes.

      2. **Analyze Changes:**
         - Identify **Replacements** (e.g., "Apple" -> "Orange") vs **Insertions** vs **Deletions**.
         - Be precise about *where* changes happened only if clear from context.
         - Avoid saying "replaced X with Y" if X and Y are unrelated paragraphs; instead say "Removed section on X and added section on Y".

      3. **Output Format:**
         - concise bullet points.
         - **Bold** important terms.
         - No intro/outro fluff.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
