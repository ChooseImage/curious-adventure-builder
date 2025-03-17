
import { Story } from '@/types/story';
import { tallestBuildingsStory } from '@/utils/dummyData';

// Base URL for the API without proxy
const BASE_API_URL = 'https://v0-0-43b1---genv-opengpts-al23s7k26q-de.a.run.app';
// CORS proxy URL
const CORS_PROXY = 'https://corsproxy.io/?';

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
    
    // Use the correct endpoint for creating a thread with CORS proxy
    const response = await fetch(getProxiedUrl('/headless/thread'), {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
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
    
    // Using POST method with JSON body as specified in the curl example
    const requestBody: InvokeRequest = {
      thread_id: threadId,
      input: {
        message: prompt,
        canvas: "string" // Default value as shown in the curl example
      }
    };
    
    // Use the correct endpoint for invoke with CORS proxy
    const response = await fetch(getProxiedUrl('/headless/invoke'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
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
