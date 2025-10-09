// ============================================================
// VERCEL SERVERLESS FUNCTION
// File location: your-app/api/generate-prompts.js
// This replaces the Express backend server
// ============================================================

import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { age, issue, lens, style, numPrompts } = req.body;

    // Validate that all required fields are present
    if (!age || !issue || !lens || !style || !numPrompts) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Initialize Anthropic client with API key from environment variable
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Convert "3-5" to "3 to 5" for better readability
    const promptCount = numPrompts === '3-5' ? '3 to 5' : numPrompts;

    // Build the prompt for Claude
    const prompt = `You are a thoughtful journaling coach helping someone develop meaningful self-reflection practices. Please create ${promptCount} journal prompt${numPrompts === '1' ? '' : 's'} for the following person:

Age Range: ${age}
Life Situation: ${issue}
Philosophical/Spiritual Lens: ${lens}
Style/Focus: ${style}

Requirements:
- Tailor the language and complexity to be age-appropriate for someone in the ${age} age range
- Focus specifically on helping them explore "${issue}"
- Frame the prompts through a ${lens} perspective, incorporating relevant principles and wisdom from this tradition
- Use a ${style} style/tone in crafting these prompts
- Make each prompt open-ended to encourage deep reflection
- Ensure prompts are specific enough to be actionable but broad enough to allow personal interpretation
- Include gentle guidance on how to approach the prompt if helpful

Please provide thoughtful, compassionate prompts that will genuinely help this person gain insight and clarity.`;

    console.log('Calling Claude API...');

    // Call Claude's API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract the response text
    const prompts = message.content[0].text;

    console.log('Successfully generated prompts');

    // Send the prompts back to the frontend
    return res.status(200).json({ prompts });

  } catch (error) {
    console.error('Error generating prompts:', error);
    return res.status(500).json({ 
      error: 'Failed to generate prompts',
      details: error.message 
    });
  }
}
