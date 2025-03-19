import { Story } from '@/types/story';
import { tallestBuildingsStory } from '@/utils/dummyData';
import { fetchEventSource } from '@microsoft/fetch-event-source';

// Base URL for the API
const BASE_API_URL = 'https://v0-0-43b4---genv-opengpts-al23s7k26q-de.a.run.app';

// Configuration for API behavior
const API_CONFIG = {
  LOCAL_MODE: false, // Set to false to enable real API calls
  FALLBACK_TO_DUMMY: true, // Whether to fall back to dummy data if API fails
  USE_EVENT_SOURCE: true // Whether to use fetchEventSource instead of fetch
};

export interface StreamRequest {
  message: string;
}

export interface StreamResponse {
  success: boolean;
  error?: string;
}

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
 * Streams a conversation with a prompt using fetchEventSource
 * Provides better handling for CORS and streaming
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
  
  if (API_CONFIG.USE_EVENT_SOURCE) {
    try {
      const controller = new AbortController();
      let receivedData = false;
      
      await fetchEventSource(`${BASE_API_URL}/headless/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
        openWhenHidden: true,
        
        // This is called when a message is received
        onmessage(msg) {
          receivedData = true;
          try {
            let data;
            try {
              data = JSON.parse(msg.data);
            } catch (e) {
              data = { text: msg.data };
            }
            
            onEvent('data', { content: data });
          } catch (error) {
            console.error('Error processing message:', error);
            onEvent('error', { message: 'Error processing server response' });
          }
        },
        
        // This is called when the connection is closed
        onclose() {
          console.log('Stream connection closed');
          if (!receivedData && API_CONFIG.FALLBACK_TO_DUMMY) {
            getFallbackResponse(message).then(fallbackData => {
              onEvent('data', { content: fallbackData });
            });
          }
        },
        
        // This is called when there's an error
        onerror(error) {
          console.error('Stream connection error:', error);
          // If we didn't receive any data and fallback is enabled, use fallback
          if (!receivedData && API_CONFIG.FALLBACK_TO_DUMMY) {
            getFallbackResponse(message).then(fallbackData => {
              onEvent('data', { content: fallbackData });
            });
          }
          
          controller.abort();
          // We don't throw here to prevent the promise from rejecting
          return new Response(); // This tells fetchEventSource to retry
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error in stream request:', error);
      onEvent('error', { message: error instanceof Error ? error.message : 'Unknown error' });
      
      // Use fallback data for all errors if FALLBACK_TO_DUMMY is enabled
      if (API_CONFIG.FALLBACK_TO_DUMMY) {
        try {
          const fallbackData = await getFallbackResponse(message);
          onEvent('data', { content: fallbackData });
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError);
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  } else {
    // Fallback to the previous implementation if USE_EVENT_SOURCE is disabled
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
      
      // Direct API call
      const response = await fetch(`${BASE_API_URL}/headless/stream`, options);
      
      if (!response.ok) {
        if (API_CONFIG.FALLBACK_TO_DUMMY) {
          const fallbackData = await getFallbackResponse(message);
          onEvent('data', { content: fallbackData });
          
          return {
            success: false,
            error: "API request failed. Using fallback data instead."
          };
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
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
      
      // Use fallback data for all errors if FALLBACK_TO_DUMMY is enabled
      if (API_CONFIG.FALLBACK_TO_DUMMY) {
        try {
          const fallbackData = await getFallbackResponse(message);
          onEvent('data', { content: fallbackData });
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError);
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
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
    if (API_CONFIG.USE_EVENT_SOURCE) {
      // Use fetchEventSource for complete requests as well
      return new Promise((resolve, reject) => {
        let responseData = '';
        
        fetchEventSource(`${BASE_API_URL}/headless/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin,
          },
          body: JSON.stringify({ message: prompt }),
          
          onmessage(msg) {
            responseData += msg.data;
          },
          
          onclose() {
            try {
              let data;
              try {
                data = JSON.parse(responseData);
              } catch (e) {
                data = { text: responseData };
              }
              
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
              
              resolve(responseStory);
            } catch (error) {
              if (API_CONFIG.FALLBACK_TO_DUMMY) {
                resolve({
                  ...tallestBuildingsStory,
                  originalPrompt: prompt,
                  metadata: {
                    ...tallestBuildingsStory.metadata,
                    error: error instanceof Error ? error.message : "Unknown error"
                  }
                });
              } else {
                reject(error);
              }
            }
          },
          
          onerror(error) {
            console.error('Error in invokeConversation:', error);
            
            if (API_CONFIG.FALLBACK_TO_DUMMY) {
              resolve({
                ...tallestBuildingsStory,
                originalPrompt: prompt,
                metadata: {
                  ...tallestBuildingsStory.metadata,
                  error: error instanceof Error ? error.message : "Unknown error"
                }
              });
            } else {
              reject(error);
            }
          }
        });
      });
    } else {
      // Fallback to the previous implementation if USE_EVENT_SOURCE is disabled
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
      
      // Direct API call
      const response = await fetch(`${BASE_API_URL}/headless/complete`, options);
      
      if (response.ok) {
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
      
      // If API call fails and FALLBACK_TO_DUMMY is enabled, use fallback data
      if (API_CONFIG.FALLBACK_TO_DUMMY) {
        console.warn("API call failed for invokeConversation, using fallback data");
        return {
          ...tallestBuildingsStory,
          originalPrompt: prompt,
          metadata: {
            ...tallestBuildingsStory.metadata,
          }
        };
      } else {
        // If fallback is disabled, throw an error
        throw new Error("API call failed and fallback is disabled");
      }
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
