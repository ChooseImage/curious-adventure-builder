
export interface StoryScene {
  id: string;
  title: string;
  description: string;
  // For 3D content
  threeJsCode?: string;
  // For additional data needed by the scene
  data?: any;
  // For any interactive elements
  interactiveElements?: {
    type: 'button' | 'slider' | 'toggle' | 'input';
    id: string;
    label: string;
    action: string;
    // Additional properties based on type
    [key: string]: any;
  }[];
}

export interface Story {
  id: string;
  title: string;
  originalPrompt: string;
  scenes: StoryScene[];
  metadata?: {
    createdAt: string;
    tags: string[];
    [key: string]: any;
  };
}

export type StoryState = 'idle' | 'loading' | 'ready' | 'error';
