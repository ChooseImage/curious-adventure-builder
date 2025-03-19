import { Story } from '@/types/story';
import { tallestBuildingsStory } from '@/utils/dummyData';

// Base URL for the API
const BASE_API_URL = 'https://v0-0-43b4---genv-opengpts-al23s7k26q-de.a.run.app';

export interface StreamRequest {
  message: string;
}

export interface StreamResponse {
  success: boolean;
  error?: string;
}

/**
 * Streams a conversation with a prompt
 * Uses the headless/stream endpoint
 */
export const streamConversation = async (
  message: string,
  onEvent: (eventType: string, data: any) => void
): Promise<StreamResponse> => {
  console.log(`Streaming conversation with message: ${message}`);
  
  try {
    const response = await fetch(`${BASE_API_URL}/headless/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send cookies
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      throw new Error(`API responded with status: ${response.status} - ${errorText}`);
    }
    
    // Use the native Response.body to handle streaming properly
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to get response reader');
    
    // Process the stream
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Process any remaining data in the buffer
        processBuffer(buffer, onEvent);
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      // Process complete events in the buffer
      buffer = processBuffer(buffer, onEvent);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in stream request:', error);
    onEvent('error', { message: error instanceof Error ? error.message : 'Unknown error' });
    
    // Try to determine if this is a CORS error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isCorsError = 
      errorMessage.includes('CORS') || 
      errorMessage.includes('Cross-Origin') ||
      errorMessage.includes('Failed to fetch');
    
    if (isCorsError) {
      return {
        success: false,
        error: "CORS error: The API server doesn't allow requests from this origin. Using fallback data instead."
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Helper function to process the SSE buffer
 */
const processBuffer = (buffer: string, onEvent: (eventType: string, data: any) => void): string => {
  // Process event stream format (lines separated by \n\n)
  const events = buffer.split('\n\n');
  
  // Keep the last incomplete event in the buffer
  const lastEvent = events.pop() || '';
  
  for (const event of events) {
    if (event.trim() === '') continue;
    
    try {
      // Parse the SSE format: "event: type\ndata: {...}"
      const eventMatch = event.match(/^event:\s*(.+)$/m);
      const dataMatch = event.match(/^data:\s*(.+)$/m);
      
      if (eventMatch && dataMatch) {
        const eventType = eventMatch[1].trim();
        try {
          const eventData = JSON.parse(dataMatch[1].trim());
          onEvent(eventType, eventData);
        } catch (e) {
          console.error('Error parsing event data:', e, dataMatch[1]);
          onEvent('error', { message: 'Error parsing event data', rawData: dataMatch[1] });
        }
      } else if (dataMatch) {
        // Some SSE implementations don't use the event field
        try {
          const eventData = JSON.parse(dataMatch[1].trim());
          onEvent('data', eventData);
        } catch (e) {
          console.error('Error parsing data:', e, dataMatch[1]);
          onEvent('error', { message: 'Error parsing data', rawData: dataMatch[1] });
        }
      } else {
        console.warn('Malformed SSE event:', event);
      }
    } catch (error) {
      console.error('Error processing event:', error, event);
    }
  }
  
  return lastEvent;
};

/**
 * Invokes a conversation with a prompt
 * Always returns dummy data without making API calls
 */
export const invokeConversation = async (prompt: string): Promise<Story> => {
  console.log(`Using dummy data for prompt: ${prompt}`);
  
  // Return the dummy building story with the original prompt
  const dummyStory = {
    ...tallestBuildingsStory,
    originalPrompt: prompt,
    metadata: {
      ...tallestBuildingsStory.metadata,
      // No thread_id needed since we're no longer using threads
    }
  };
  
  return dummyStory;
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
