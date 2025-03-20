
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define the chapter interface for better typing
export interface StoryChapter {
  html: string;
  gliastar: string;
  article: {
    title: string;
    content: string;
  };
  _timestamp?: number;
}

// Query key for chapters
export const chaptersQueryKey = ["storyChapters"];

export function useStoryChapters() {
  const queryClient = useQueryClient();

  // Fetch chapters from localStorage
  const fetchChapters = (): StoryChapter[] => {
    try {
      const stored = localStorage.getItem("storyChapters");
      if (stored) {
        console.log("useStoryChapters: Retrieved chapters from localStorage");
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("useStoryChapters: Error retrieving chapters from localStorage", error);
    }
    return [];
  };

  // Query to get chapters
  const chaptersQuery = useQuery({
    queryKey: chaptersQueryKey,
    queryFn: fetchChapters,
    staleTime: 1000 * 60 * 30, // Consider data fresh for 30 minutes
  });

  // Mutation to update chapters
  const updateChaptersMutation = useMutation({
    mutationFn: (newChapters: StoryChapter[]) => {
      console.log("useStoryChapters: Updating chapters:", newChapters);
      
      // Add timestamp to track freshness
      const chaptersWithTimestamp = newChapters.map(chapter => ({
        ...chapter,
        _timestamp: new Date().getTime()
      }));
      
      // Save to localStorage
      localStorage.setItem("storyChapters", JSON.stringify(chaptersWithTimestamp));
      
      return chaptersWithTimestamp;
    },
    onSuccess: (updatedChapters) => {
      // Update the query cache with new data
      queryClient.setQueryData(chaptersQueryKey, updatedChapters);
      console.log("useStoryChapters: Cache updated with new chapters");
    }
  });

  // Format video URL to ensure consistency
  const formatVideoUrl = (url: string): string => {
    if (!url) return "";
    
    // Remove any query parameters that we may have added
    const baseUrl = url.split("?")[0];
    
    if (baseUrl.endsWith(".webm")) {
      return baseUrl;
    } else if (!baseUrl.startsWith("https://")) {
      return `https://static-gstudio.gliacloud.com/${baseUrl}`;
    }
    return baseUrl;
  };

  // Get current video URL with force refresh option
  const getCurrentVideoUrl = (chapterIndex: number = 0, forceRefresh: boolean = false): string => {
    const chapters = chaptersQuery.data || [];
    
    if (chapters.length === 0 || !chapters[chapterIndex] || !chapters[chapterIndex].gliastar) {
      return "";
    }
    
    const url = formatVideoUrl(chapters[chapterIndex].gliastar);
    
    // Add timestamp to force refresh if needed
    return forceRefresh ? `${url}?t=${new Date().getTime()}` : url;
  };

  return {
    chapters: chaptersQuery.data || [],
    isLoading: chaptersQuery.isLoading,
    error: chaptersQuery.error,
    updateChapters: updateChaptersMutation.mutate,
    getCurrentVideoUrl,
    formatVideoUrl
  };
}
