
import React from 'react';
import { ScrollArea } from './ui/scroll-area';

interface StreamDebuggerProps {
  streamingContent: any[];
  visible: boolean;
}

const StreamDebugger: React.FC<StreamDebuggerProps> = ({ streamingContent, visible }) => {
  if (!visible) return null;

  // Print all streaming content to console for easy debugging
  React.useEffect(() => {
    if (streamingContent.length > 0) {
      console.log('Current streaming content:', streamingContent);
    }
  }, [streamingContent]);

  return (
    <div className="fixed top-16 right-4 w-96 max-h-[70vh] bg-black/80 text-white p-4 rounded-lg z-50 font-mono text-xs shadow-xl border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Stream Debugger</h3>
      </div>
      
      <ScrollArea className="h-[60vh]">
        {streamingContent.length === 0 ? (
          <div className="text-gray-400 italic">No stream data received yet</div>
        ) : (
          streamingContent.map((item, index) => (
            <div key={index} className="mb-4 pb-2 border-b border-white/20">
              <div className="text-xs text-green-400 mb-1 flex justify-between">
                <span>{item.type || 'data'}</span>
                <span className="text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-xs overflow-hidden bg-black/50 p-2 rounded">
                {typeof item.data === 'object' 
                  ? JSON.stringify(item.data, null, 2) 
                  : item.data}
              </pre>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default StreamDebugger;
