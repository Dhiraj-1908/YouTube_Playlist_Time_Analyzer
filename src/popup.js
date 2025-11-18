document.addEventListener('DOMContentLoaded', function() {
  calculateDuration();
  
  document.getElementById('recalculate').addEventListener('click', function() {
    calculateDuration();
  });
});

async function calculateDuration() {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const results = document.getElementById('results');
  
  loading.style.display = 'flex';
  error.style.display = 'none';
  results.style.display = 'none';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('youtube.com')) {
      showError('Please open a YouTube playlist page.');
      return;
    }
    
    chrome.tabs.sendMessage(
      tab.id,
      { action: 'calculateDuration' },
      function(response) {
        loading.style.display = 'none';
        
        if (chrome.runtime.lastError) {
          showError('Error: Please refresh the YouTube page and try again.');
          return;
        }
        
        if (response.error) {
          showError(response.error);
          return;
        }
        
        document.getElementById('totalDuration').textContent = response.totalDuration;
        document.getElementById('at15x').textContent = response.at15x;
        document.getElementById('at2x').textContent = response.at2x;
        document.getElementById('videosCount').textContent = response.videosCount;
        document.getElementById('videosNotCounted').textContent = response.videosNotCounted;
        
        results.style.display = 'block';
      }
    );
  } catch (err) {
    showError('An unexpected error occurred. Please try again.');
  }
}

function showError(message) {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const errorMessage = document.getElementById('errorMessage');
  
  loading.style.display = 'none';
  errorMessage.textContent = message;
  error.style.display = 'block';
}
