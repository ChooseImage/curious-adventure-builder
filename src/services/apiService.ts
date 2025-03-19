import { Story } from '@/types/story';
import { tallestBuildingsStory } from '@/utils/dummyData';

// Base URL for the API
const BASE_API_URL = 'https://v0-0-43b4---genv-opengpts-al23s7k26q-de.a.run.app';

// List of more reliable CORS proxies
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://proxy.cors.sh/',
  'https://cors.eu.org/',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://corsproxy.org/?',
  'https://cors-proxy.fringe.zone/',
  'https://crossorigin.me/'
];

// Configuration for API behavior
const API_CONFIG = {
  LOCAL_MODE: false, // Set to false to enable real API calls
  FALLBACK_TO_DUMMY: true, // Whether to fall back to dummy data if API fails
  USE_CORS_PROXIES: true // Whether to try CORS proxies
};

export interface StreamRequest {
  message: string;
}

export interface StreamResponse {
  success: boolean;
  error?: string;
}

/**
 * Try multiple CORS proxies until one works
 */
const tryMultipleCorsProxies = async (url: string, options: RequestInit): Promise<Response | null> => {
  if (!API_CONFIG.USE_CORS_PROXIES) {
    return null;
  }
  
  for (const proxy of CORS_PROXIES) {
    try {
      console.log(`Attempting with CORS proxy: ${proxy}`);
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl, {
        ...options,
        // Some proxies need different headers
        headers: {
          ...options.headers,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.ok) {
        console.log(`Success with proxy: ${proxy}`);
        return response;
      }
    } catch (error) {
      console.warn(`Failed with proxy ${proxy}:`, error);
    }
  }
  
  return null;
};

/**
 * Make a direct API call with CORS handling
 * Attempts to use various CORS workarounds if direct call fails
 */
const makeApiCall = async (endpoint: string, options: RequestInit): Promise<Response | null> => {
  const url = `${BASE_API_URL}${endpoint}`;
  let response = null;
  
  // First try with mode: 'no-cors' as a last resort for the direct call
  try {
    console.log("Attempting direct API call with standard CORS");
    response = await fetch(url, options);
    if (response.ok) {
      console.log("Direct API call succeeded");
      return response;
    }
  } catch (error) {
    console.warn("Standard direct API call failed:", error);
  }
  
  // Try with no-cors mode (this will limit what we can do with the response but might work)
  try {
    console.log("Attempting direct API call with no-cors mode");
    const noCorsOptions = {
      ...options,
      mode: 'no-cors' as RequestMode
    };
    response = await fetch(url, noCorsOptions);
    
    // Note: with no-cors, we can't actually check response.ok
    // so we just return it and let the caller handle it
    console.log("no-cors request completed");
    return response;
  } catch (error) {
    console.warn("no-cors direct API call failed:", error);
  }
  
  // If direct access fails, try CORS proxies
  console.log("Direct API calls failed, trying CORS proxies");
  return await tryMultipleCorsProxies(url, options);
};

/**
 * Uses a fallback method if streaming fails
 * Immediately returns dummy data in local mode if configured
 */
const getFallbackResponse = async (message: string): Promise<any> => {
  console.log("Using fallback dummy data for prompt:", message);
  // Return the dummy building story as a fallback
  return tallestBuildingsStory;
};

/**
 * Streams a conversation with a prompt
 * Tries direct API, CORS proxies, then fallback data if necessary
 */
export const streamConversation = async (
  message: string,
  onEvent: (eventType: string, data: any) => void
): Promise<StreamResponse> => {
  console.log(`Streaming conversation with message: ${message}`);
  
  // If in LOCAL_MODE and FALLBACK_TO_DUMMY is enabled, use dummy data
  if (API_CONFIG.LOCAL_MODE && API_CONFIG.FALLBACK_TO_DUMMY) {
    console.log("🔥 LOCAL MODE: Using dummy data but will still try API call if FALLBACK_TO_DUMMY is disabled");
    if (API_CONFIG.FALLBACK_TO_DUMMY) {
      onEvent('data', { content: tallestBuildingsStory });
      return {
        success: true
      };
    }
  }
  
  try {
    // Set up request options with all possible CORS headers
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors' as RequestMode, 
      credentials: 'omit' as RequestCredentials,
      body: JSON.stringify({ message }),
    };
    
    // Try to make the API call with our enhanced function
    const response = await makeApiCall('/headless/stream', options);
    
    // If all attempts fail and FALLBACK_TO_DUMMY is enabled, use fallback data
    if (!response || !response.ok) {
      console.error("All API access methods failed");
      
      if (API_CONFIG.FALLBACK_TO_DUMMY) {
        console.log("Using fallback data");
        onEvent('error', { 
          message: "CORS error: Unable to access the API due to cross-origin restrictions. Using fallback data." 
        });
        
        const fallbackData = await getFallbackResponse(message);
        onEvent('data', { content: fallbackData });
        
        return {
          success: false,
          error: "CORS restrictions prevented API access. Using fallback data instead."
        };
      } else {
        // If fallback is disabled, report the error
        onEvent('error', { 
          message: "API access failed and fallback data is disabled. Please check network settings."
        });
        
        return {
          success: false,
          error: "All API access methods failed and fallback is disabled."
        };
      }
    }
    
    // Handle no-cors responses (which are opaque and can't be properly read)
    if (response.type === 'opaque') {
      console.log("Received opaque response (no-cors mode), cannot read content");
      onEvent('error', {
        message: "Received opaque response from API due to CORS. Cannot read the actual content."
      });
      
      if (API_CONFIG.FALLBACK_TO_DUMMY) {
        const fallbackData = await getFallbackResponse(message);
        onEvent('data', { content: fallbackData });
      }
      
      return {
        success: false,
        error: "Received opaque response from API due to CORS."
      };
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
    
    // Use fallback data for all errors if FALLBACK_TO_DUMMY is enabled
    if (API_CONFIG.FALLBACK_TO_DUMMY) {
      try {
        const fallbackData = await getFallbackResponse(message);
        onEvent('data', { content: fallbackData });
      } catch (fallbackError) {
        console.error('Even fallback failed:', fallbackError);
      }
    }
    
    if (isCorsError) {
      return {
        success: false,
        error: "CORS error: The API server doesn't allow requests from this origin."
      };
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Helper function to process the SSE buffer
 */
const processBuffer = (buffer: string, onEvent: (eventType: string, data: any) => void): string => {
  // Process various SSE formats
  const events = buffer.split(/\n\n|\r\n\r\n/);
  
  // Keep the last incomplete event in the buffer
  const lastEvent = events.pop() || '';
  
  for (const event of events) {
    if (event.trim() === '') continue;
    
    try {
      // Try different formats of SSE
      // Format 1: "event: type\ndata: {...}"
      const eventMatch = event.match(/^event:\s*(.+)$/m);
      const dataMatch = event.match(/^data:\s*(.+)$/m);
      
      if (eventMatch && dataMatch) {
        const eventType = eventMatch[1].trim();
        try {
          const eventData = JSON.parse(dataMatch[1].trim());
          onEvent(eventType, eventData);
        } catch (e) {
          console.log('Non-JSON data received:', dataMatch[1]);
          onEvent('data', { text: dataMatch[1].trim() });
        }
      } 
      // Format 2: Just "data: {...}"
      else if (dataMatch) {
        try {
          const eventData = JSON.parse(dataMatch[1].trim());
          onEvent('data', eventData);
        } catch (e) {
          console.log('Non-JSON data received:', dataMatch[1]);
          onEvent('data', { text: dataMatch[1].trim() });
        }
      }
      // Format 3: Just a JSON string without data: prefix
      else if (event.trim().startsWith('{')) {
        try {
          const eventData = JSON.parse(event.trim());
          onEvent('data', eventData);
        } catch (e) {
          console.error('Error parsing JSON:', e, event);
        }
      }
      // Format 4: Plain text
      else {
        console.log('Plain text message:', event);
        onEvent('data', { text: event.trim() });
      }
    } catch (error) {
      console.error('Error processing event:', error, event);
    }
  }
  
  return lastEvent;
};

/**
 * Invokes a conversation with a prompt
 * Attempts to use real API if not in LOCAL_MODE
 */
export const invokeConversation = async (prompt: string): Promise<Story> => {
  console.log(`Invoking conversation with prompt: ${prompt}`);
  
  // In local mode with fallback enabled, immediately return dummy data
  if (API_CONFIG.LOCAL_MODE && API_CONFIG.FALLBACK_TO_DUMMY) {
    console.log("🔥 LOCAL MODE: Using dummy data for invokeConversation");
    
    // Return the dummy building story with the original prompt
    const dummyStory = {
      ...tallestBuildingsStory,
      originalPrompt: prompt,
      metadata: {
        ...tallestBuildingsStory.metadata,
      }
    };
    
    return dummyStory;
  }
  
  // If not in LOCAL_MODE or fallback is disabled, try to use the real API
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors' as RequestMode,
      credentials: 'omit' as RequestCredentials,
      body: JSON.stringify({ message: prompt }),
    };
    
    // Try to make the API call with our enhanced function
    const response = await makeApiCall('/headless/complete', options);
    
    // If we got a response, process it
    if (response && response.ok) {
      const data = await response.json();
      console.log("API response for invokeConversation:", data);
      
      // Use the dummy data but merge in the API response data
      const responseStory = {
        ...tallestBuildingsStory,
        originalPrompt: prompt,
        metadata: {
          ...tallestBuildingsStory.metadata,
          apiResponse: data
        }
      };
      
      return responseStory;
    }
    
    // If response is opaque (no-cors mode), we can't read it
    if (response && response.type === 'opaque') {
      console.log("Received opaque response from invokeConversation (no-cors mode)");
      // Fall back to dummy data
      if (API_CONFIG.FALLBACK_TO_DUMMY) {
        return {
          ...tallestBuildingsStory,
          originalPrompt: prompt,
          metadata: {
            ...tallestBuildingsStory.metadata,
            error: "Received opaque response due to CORS restrictions"
          }
        };
      }
    }
    
    // If all API attempts fail and FALLBACK_TO_DUMMY is enabled, use fallback data
    if (API_CONFIG.FALLBACK_TO_DUMMY) {
      console.warn("All API access methods failed for invokeConversation, using fallback data");
      return {
        ...tallestBuildingsStory,
        originalPrompt: prompt,
        metadata: {
          ...tallestBuildingsStory.metadata,
        }
      };
    } else {
      // If fallback is disabled, throw an error
      throw new Error("All API access methods failed and fallback is disabled");
    }
  } catch (error) {
    console.error("Error in invokeConversation:", error);
    
    if (API_CONFIG.FALLBACK_TO_DUMMY) {
      // Use fallback data if enabled
      return {
        ...tallestBuildingsStory,
        originalPrompt: prompt,
        metadata: {
          ...tallestBuildingsStory.metadata,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    } else {
      // Rethrow the error if fallback is disabled
      throw error;
    }
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
