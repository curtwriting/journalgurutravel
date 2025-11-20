/**
 * ============================================================
 * API ROUTE: Generate Journal Prompts
 * ============================================================
 * 
 * This file handles the backend API request for generating
 * personalized journal prompts using AI (Claude/Anthropic).
 * 
 * How it works:
 * 1. Receives user preferences from the frontend form
 * 2. Validates that all required fields are provided
 * 3. Creates a detailed prompt for the AI
 * 4. Calls Claude API to generate personalized prompts
 * 5. Returns the generated prompts to the frontend
 * 
 * File location: /app/api/generate-prompts/route.js
 * This is a Next.js API route that runs on the server
 */

import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

/**
 * POST handler for generating journal prompts
 * This function runs when the frontend sends a POST request to /api/generate-prompts
 */
export async function POST(request) {
  try {
    // ============================================================
    // STEP 1: EXTRACT AND VALIDATE USER INPUT
    // ============================================================
    
    // Get the form data sent from the frontend
    const { moment, sensory, tension, person, concept } = await request.json();

    // Check that all required fields are provided
    if (!moment || !sensory || !tension || !person || !concept) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 }); // 400 = Bad Request
    }

    // ============================================================
    // STEP 2: SETUP AI CLIENT OR USE MOCK MODE
    // ============================================================
    
    // Check if API key exists, if not, use mock mode for testing
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      // Mock mode: Return sample prompts after a short delay to simulate API call
      console.log('No API key found - Using mock mode for testing');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock prompts based on user input
      const mockPrompts =  `**Travel Journal Prompt**

          Reflect on your experience with ${moment} through the lens of ${sensory}. Consider how the principles of this perspective can guide you in navigating this situation.

          Take a moment to explore:
          - What aspects of ${moment} feel most challenging right now?
          - How might ${sensory} offer insights or tools to help you approach this differently?
          - What would it look like to apply a ${tension} approach to understanding this situation?

          Write freely, allowing your thoughts to flow without judgment.`;
      
      return NextResponse.json({ prompts: mockPrompts });
    }
    
    // Initialize the Anthropic (Claude) AI client
    // The API key is stored in environment variables for security
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // ============================================================
    // STEP 3: PREPARE THE AI PROMPT
    // ============================================================
    
    // Create a detailed prompt that tells the AI exactly what we want
    const prompt = `You are a thoughtful journaling coach helping someone develop meaningful self-reflection practices. Please create a journal prompt for the following person:
        Moment: ${moment}
        Sensory: ${sensory}
        Tension: ${tension}
        Person: ${person}
        Concept: ${concept}

        Requirements:
        - Tailor the language and complexity to be appropriate for someone in the ${moment} moment
        - Focus specifically on helping them explore "${moment}"
        - Frame the prompts through a ${sensory} perspective, incorporating relevant principles and wisdom from this tradition
        - Use a ${tension} style/tone in crafting these prompts
        - Make the prompt open-ended to encourage deep reflection
        - Ensure prompts are specific enough to be actionable but broad enough to allow personal interpretation
        - Include gentle guidance on how to approach the prompt if helpful

        Please provide thoughtful, compassionate prompts that will genuinely help this person gain insight and clarity.
        
        OUTPUT INSTRUCTIONS: Generate ONLY the requested journal prompts and any associated guidance. 
        DO NOT include any introductory or concluding conversational remarks, or any questions about elaboration or follow-up. 
        Stop generating text immediately after the final prompt.`;

    console.log('Calling Claude API...');

    // ============================================================
    // STEP 4: CALL THE AI API
    // ============================================================
    
    // Send the prompt to Claude and get the response
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest', // Using the latest Claude model
      max_tokens: 2048, // Maximum length of response
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // ============================================================
    // STEP 5: EXTRACT AND RETURN RESULTS
    // ============================================================
    
    // Get the text content from Claude's response
    const prompts = message.content[0].text;

    console.log('Successfully generated prompts');

    // Send the generated prompts back to the frontend
    return NextResponse.json({ prompts });

  } catch (error) {
    // ============================================================
    // ERROR HANDLING
    // ============================================================
    
    // If something goes wrong, log the error and return an error message
    console.error('Error generating prompts:', error);
    return NextResponse.json({ 
      error: 'Failed to generate prompts',
      details: error.message 
    }, { status: 500 }); // 500 = Internal Server Error
  }
}
