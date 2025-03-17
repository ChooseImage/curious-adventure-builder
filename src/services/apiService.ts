
import { Story } from '@/types/story';

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
 */
export const createThread = async (): Promise<ThreadResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/headless/create_thread_headless_thread_get`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

/**
 * Invokes a conversation with a prompt
 */
export const invokeThread = async (
  threadId: string, 
  prompt: string
): Promise<Story> => {
  try {
    // Construct URL with query parameters
    const url = new URL(`${API_BASE_URL}/headless/invoke_headless_invoke_get`);
    url.searchParams.append('thread_id', threadId);
    url.searchParams.append('message', prompt);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: InvokeResponse = await response.json();
    
    // Parse the content into a Story object
    // Note: This assumes the API returns content in a format compatible with your Story type
    // You may need to transform the data if the formats don't match exactly
    return parseStoryFromResponse(data.content);
  } catch (error) {
    console.error('Error invoking thread:', error);
    throw error;
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
