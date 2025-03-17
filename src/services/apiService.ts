
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

// Updated interface based on API documentation/logs
export interface InvokeRequest {
  thread_id: string;
  input: string; // String format as required by the API
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
    
    // Updated request body format based on API error
    const requestBody: InvokeRequest = {
      thread_id: threadId,
      input: prompt  // String format as required by the API
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
    
    // If the API returned an error detail, throw it
    if (data.detail) {
      throw new Error(`API error: ${JSON.stringify(data.detail)}`);
    }
    
    // We need to extract the content more carefully based on the actual response structure
    let storyContent;
    
    // Check different potential response formats
    if (data.content) {
      storyContent = data.content;
    } else if (data.response) {
      storyContent = data.response;
    } else if (typeof data === 'object' && Object.keys(data).length > 0) {
      // If there's no content field but we got an object, try to use it directly
      storyContent = data;
    } else {
      throw new Error('API response missing usable content');
    }
    
    console.log('Extracted story content:', storyContent);
    
    return parseStoryFromResponse(storyContent, prompt, threadId);
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
 * Handles various response formats and converts them to our Story structure
 */
const parseStoryFromResponse = (content: any, originalPrompt: string, threadId: string): Story => {
  console.log('Parsing story from response:', content);
  
  try {
    // If it's a string, try to parse it as JSON
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        // If it's not valid JSON, create a simple story structure from the text
        console.log('Content is a string but not valid JSON, creating basic story');
        return createBasicStoryFromText(content, originalPrompt, threadId);
      }
    }
    
    // If the content doesn't have the expected structure, try to normalize it
    if (!content.id || !content.title || !Array.isArray(content.scenes)) {
      console.log('Content missing required Story fields, attempting to normalize');
      return normalizeToStoryFormat(content, originalPrompt, threadId);
    }
    
    // If we have a valid story structure, ensure it has the original prompt
    const story: Story = {
      ...content,
      originalPrompt: originalPrompt,
      metadata: {
        ...(content.metadata || {}),
        thread_id: threadId,
        createdAt: content.metadata?.createdAt || new Date().toISOString(),
        tags: content.metadata?.tags || []
      }
    };
    
    return story;
  } catch (error) {
    console.error('Error parsing story response:', error);
    // Create a fallback story if parsing fails
    return createBasicStoryFromText(
      typeof content === 'string' ? content : JSON.stringify(content),
      originalPrompt,
      threadId
    );
  }
};

/**
 * Create a basic story from text content
 */
const createBasicStoryFromText = (text: string, prompt: string, threadId: string): Story => {
  console.log('Creating basic story from text');
  
  // Generate a unique ID
  const id = `story-${Date.now()}`;
  
  // Extract a title from the first few words of the text or use the prompt
  let title = prompt;
  if (text.length > 0) {
    const firstLine = text.split('\n')[0];
    title = firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '');
  }
  
  // Create a simple one-scene story
  return {
    id,
    title,
    originalPrompt: prompt,
    scenes: [
      {
        id: 'scene-1',
        title: 'Information',
        description: text
      }
    ],
    metadata: {
      createdAt: new Date().toISOString(),
      tags: [],
      thread_id: threadId
    }
  };
};

/**
 * Normalize API response to our Story format
 */
const normalizeToStoryFormat = (content: any, prompt: string, threadId: string): Story => {
  console.log('Normalizing content to Story format');
  
  // Generate a unique ID
  const id = `story-${Date.now()}`;
  
  // Try to extract title from the content or use the prompt
  let title = prompt;
  if (typeof content === 'object') {
    if (content.title) {
      title = content.title;
    } else if (content.subject) {
      title = content.subject;
    } else if (content.name) {
      title = content.name;
    } else if (content.topic) {
      title = content.topic;
    }
  }
  
  // Create scenes based on the content structure
  const scenes = [];
  
  // If we have content with sections, create a scene for each section
  if (content.sections && Array.isArray(content.sections)) {
    scenes.push(...content.sections.map((section: any, index: number) => ({
      id: `scene-${index + 1}`,
      title: section.title || `Section ${index + 1}`,
      description: section.content || section.description || section.text || JSON.stringify(section)
    })));
  }
  // If we have content with chapters, create a scene for each chapter
  else if (content.chapters && Array.isArray(content.chapters)) {
    scenes.push(...content.chapters.map((chapter: any, index: number) => ({
      id: `scene-${index + 1}`,
      title: chapter.title || `Chapter ${index + 1}`,
      description: chapter.content || chapter.description || chapter.text || JSON.stringify(chapter)
    })));
  }
  // If we have content with points or items, create a scene for each point
  else if ((content.points || content.items) && Array.isArray(content.points || content.items)) {
    const items = content.points || content.items;
    scenes.push(...items.map((item: any, index: number) => ({
      id: `scene-${index + 1}`,
      title: item.title || `Point ${index + 1}`,
      description: item.content || item.description || item.text || (typeof item === 'string' ? item : JSON.stringify(item))
    })));
  }
  // If we have a flat object with text/description, create a single scene
  else {
    scenes.push({
      id: 'scene-1',
      title: 'Information',
      description: content.description || content.text || content.content || JSON.stringify(content)
    });
  }
  
  // Add a conclusion scene with interactive buttons
  scenes.push({
    id: 'conclusion',
    title: 'Conclusion',
    description: 'Thank you for exploring this information with us.',
    interactiveElements: [
      {
        type: 'button',
        id: 'restart-tour',
        label: 'Restart Tour',
        action: 'restartTour'
      },
      {
        type: 'button',
        id: 'new-prompt',
        label: 'Ask a New Question',
        action: 'newPrompt'
      }
    ]
  });
  
  return {
    id,
    title,
    originalPrompt: prompt,
    scenes,
    metadata: {
      createdAt: new Date().toISOString(),
      tags: [],
      thread_id: threadId
    }
  };
};

