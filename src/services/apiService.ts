
import { Story } from '@/types/story';
import { tallestBuildingsStory } from '@/utils/dummyData';

// Base URL for the API
const BASE_API_URL = 'https://v0-0-43b1---genv-opengpts-al23s7k26q-de.a.run.app';

// Try a different CORS proxy
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Function to get full proxied URL
const getProxiedUrl = (endpoint: string) => `${CORS_PROXY}${encodeURIComponent(`${BASE_API_URL}${endpoint}`)}`;

export interface ThreadResponse {
  thread_id: string;
  user_id?: string;
  assistant_id?: string;
  name?: string;
  updated_at?: string;
  metadata?: {
    assistant_type?: string;
    [key: string]: any;
  };
  status?: string;
}

export interface InvokeRequest {
  thread_id: string;
  input: {
    message: string;
    canvas?: string;
  };
}

export interface InvokeResponse {
  message_id: string;
  thread_id: string;
  content: any; // Will be parsed as Story object
  status: string;
}

/**
 * Creates a new conversation thread
 * Falls back to local mock data if the API is unavailable
 */
export const createThread = async (): Promise<ThreadResponse> => {
  try {
    console.log('Attempting to create thread with API...');
    
    // Add debug logging for the full URL
    const url = getProxiedUrl('/headless/thread');
    console.log('Thread API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    // Log the response type to debug
    console.log('Thread API response status:', response.status);
    const responseText = await response.text();
    console.log('Thread API response text preview:', responseText.substring(0, 200));
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response as JSON:', parseError);
      throw new Error('Invalid JSON response from API');
    }
    
    console.log('Successfully created thread:', data);
    return data;
  } catch (error) {
    console.error('Error creating thread:', error);
    
    // Instead of throwing, return a mock response
    console.log('Falling back to mock thread response');
    return {
      thread_id: `mock-thread-${Date.now()}`,
      status: 'success'
    };
  }
};

/**
 * Invokes a conversation with a prompt
 * Falls back to dummy data if the API is unavailable
 */
export const invokeThread = async (
  threadId: string, 
  prompt: string
): Promise<Story> => {
  try {
    console.log(`Attempting to invoke thread ${threadId} with prompt: ${prompt}`);
    
    // Add debug logging for the full URL
    const url = getProxiedUrl('/headless/invoke');
    console.log('Invoke API URL:', url);
    
    const requestBody: InvokeRequest = {
      thread_id: threadId,
      input: {
        message: prompt,
        canvas: "string"
      }
    };
    
    console.log('Invoke API request body:', JSON.stringify(requestBody));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Log the response type to debug
    console.log('Invoke API response status:', response.status);
    const responseText = await response.text();
    console.log('Invoke API response text preview:', responseText.substring(0, 200));
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response as JSON:', parseError);
      throw new Error('Invalid JSON response from API');
    }
    
    console.log('Successfully received response:', data);
    
    return parseStoryFromResponse(data.content);
  } catch (error) {
    console.error('Error invoking thread:', error);
    
    // Instead of throwing, return dummy data
    console.log('Falling back to dummy story data');
    const fallbackStory = {
      ...tallestBuildingsStory,
      originalPrompt: prompt,
      metadata: {
        ...tallestBuildingsStory.metadata,
        thread_id: threadId
      }
    };
    
    return fallbackStory;
  }
};

/**
 * Parse API response into a Story object
 * Note: This function may need adjustments based on the actual response format
 */
const parseStoryFromResponse = (content: any): Story => {
  // For now, we'll just pass through the content if it matches our Story shape
  // In a real implementation, you may need to map fields from the API response to your Story type
  
  if (!content || typeof content !== 'object') {
    throw new Error('Invalid story content from API');
  }
  
  // Basic validation of required fields
  if (!content.id || !content.title || !Array.isArray(content.scenes)) {
    throw new Error('Story content missing required fields');
  }
  
  return content as Story;
};
