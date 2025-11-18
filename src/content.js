function parseDuration(durationText) {
  if (!durationText) return 0;
  
  const parts = durationText.split(':').map(Number);
  let seconds = 0;
  
  if (parts.length === 3) {
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    seconds = parts[0];
  }
  
  return seconds;
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function calculatePlaylistDuration() {
  const isPlaylist = window.location.href.includes('list=');
  
  if (!isPlaylist) {
    return {
      error: 'Not a playlist page. Please navigate to a YouTube playlist.'
    };
  }
  
  // Try multiple selectors for different YouTube layouts
  let videoElements = document.querySelectorAll('ytd-playlist-video-renderer');
  
  // If first selector doesn't work, try alternative
  if (videoElements.length === 0) {
    videoElements = document.querySelectorAll('ytd-video-renderer');
  }
  
  // Last resort - check for any video containers
  if (videoElements.length === 0) {
    videoElements = document.querySelectorAll('[id="content"][class*="ytd-playlist"]');
  }
  
  if (videoElements.length === 0) {
    return {
      error: 'No videos found. Please scroll down to load all videos, then try again.',
      debug: `Tried selectors, found: ${videoElements.length} videos`
    };
  }
  
  let totalSeconds = 0;
  let videosCount = 0;
  let videosNotCounted = 0;
  
  videoElements.forEach(video => {
    // Try multiple duration selectors
    let durationElement = video.querySelector('#overlays ytd-thumbnail-overlay-time-status-renderer span');
    
    if (!durationElement) {
      durationElement = video.querySelector('ytd-thumbnail-overlay-time-status-renderer span');
    }
    
    if (!durationElement) {
      durationElement = video.querySelector('.ytd-thumbnail-overlay-time-status-renderer');
    }
    
    if (durationElement) {
      const durationText = durationElement.textContent.trim();
      const seconds = parseDuration(durationText);
      
      if (seconds > 0) {
        totalSeconds += seconds;
        videosCount++;
      } else {
        videosNotCounted++;
      }
    } else {
      videosNotCounted++;
    }
  });
  
  return {
    totalDuration: formatDuration(totalSeconds),
    videosCount: videosCount,
    videosNotCounted: videosNotCounted
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'calculateDuration') {
    const result = calculatePlaylistDuration();
    sendResponse(result);
  }
  return true;
});
