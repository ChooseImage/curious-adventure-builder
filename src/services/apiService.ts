import { Story } from '@/types/story';
import { tallestBuildingsStory } from '@/utils/dummyData';

// This API base URL is not accessible due to CORS restrictions in browser
// We'll keep it for future server-side implementations
const API_BASE_URL = 'https://v0-0-43b1---genv-opengpts-al23s7k26q-de.a.run.app';

export interface ThreadResponse {
  thread_id: string;
  status: string;
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
    
    // In a real implementation, we'd use a proxy server or backend API
    // to avoid CORS issues. For now, we'll simulate the response.
    const mockResponse: ThreadResponse = {
      thread_id: `mock-thread-${Date.now()}`,
      status: 'success'
    };
    
    // Uncomment when API is accessible
    // const response = await fetch(`${API_BASE_URL}/headless/create_thread_headless_thread_get`);
    // if (!response.ok) {
    //   throw new Error(`API error: ${response.status}`);
    // }
    // return await response.json();
    
    console.log('Using mock thread response for demo purposes');
    return mockResponse;
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
    
    // Construct URL with query parameters
    const url = new URL(`${API_BASE_URL}/headless/invoke_headless_invoke_get`);
    url.searchParams.append('thread_id', threadId);
    url.searchParams.append('message', prompt);
    
    // In a real implementation, we'd use a proxy server or backend API
    // to avoid CORS issues. For now, we'll return dummy data.
    
    // Uncomment when API is accessible
    // const response = await fetch(url.toString());
    // if (!response.ok) {
    //   throw new Error(`API error: ${response.status}`);
    // }
    // const data: InvokeResponse = await response.json();
    // return parseStoryFromResponse(data.content);
    
    console.log('Using mock story data for demo purposes');
    // Create a modified version of the story with the original prompt included
    const mockStory = {
      ...tallestBuildingsStory,
      originalPrompt: prompt,
      metadata: {
        ...tallestBuildingsStory.metadata,
        thread_id: threadId
      }
    };
    
    return mockStory;
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
