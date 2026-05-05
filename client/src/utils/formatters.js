// Extract hashtags from a string and return an object with clean content and tags array
export function extractTags(content) {
  if (!content) return { cleanContent: '', tags: [] };
  
  const tagRegex = /#[\w-]+/g;
  const tags = content.match(tagRegex) || [];
  
  // Clean content by removing the tags
  const cleanContent = content.replace(tagRegex, '').trim();
  
  // Clean tags by removing the # symbol and capitalizing
  const cleanTags = tags.map(tag => {
    const word = tag.slice(1);
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  
  return { cleanContent, tags: cleanTags };
}

// Format date into timeline header format (e.g. "Monday, Oct 23")
export function groupDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// Extract time (e.g. { time: "08:45", period: "AM" })
export function timeOnly(dateString) {
  if (!dateString) return { time: '', period: '' };
  const date = new Date(dateString);
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return { 
    time: `${hours.toString().padStart(2, '0')}:${minutes}`, 
    period 
  };
}

// Calculate relative time (e.g. "2h ago", "Yesterday", "4 days ago")
export function relativeTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
