class VideoPlayer {
  constructor() {
    this.video = document.getElementById('video');
    this.playBtn = document.getElementById('playBtn');
    this.rewindBtn = document.getElementById('rewindBtn');
    this.forwardBtn = document.getElementById('forwardBtn');
    this.playIcon = document.getElementById('playIcon');
    this.pauseIcon = document.getElementById('pauseIcon');
    this.progressContainer = document.getElementById('progressContainer');
    this.progressBar = document.getElementById('progressBar');
    this.timeDisplay = document.getElementById('timeDisplay');
    this.muteBtn = document.getElementById('muteBtn');
    this.volumeIcon = document.getElementById('volumeIcon');
    this.muteIcon = document.getElementById('muteIcon');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.speedBtn = document.getElementById('speedBtn');
    this.speedText = document.getElementById('speedText');
    this.speedMenu = document.getElementById('speedMenu');
    this.screenshotBtn = document.getElementById('screenshotBtn');
    this.fileBtn = document.getElementById('fileBtn');
    this.fileInput = document.getElementById('fileInput');
    this.fileInputContainer = document.getElementById('fileInputContainer');
    this.fileDropZone = document.getElementById('fileDropZone');
    this.uploadBtn = document.getElementById('uploadBtn');
    this.fileInfo = document.getElementById('fileInfo');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');
    this.controls = document.getElementById('controls');
    this.demoText = document.getElementById('demoText');
    this.rotateLeftBtn = document.getElementById('rotateLeftBtn');
    this.rotateRightBtn = document.getElementById('rotateRightBtn');
    this.rotation = 0; // Track current rotation

    // URL input elements
    this.videoUrl = document.getElementById('videoUrl');
    this.loadUrlBtn = document.getElementById('loadUrlBtn');

    this.controlsTimeout = null;
    this.init();
  }

  init() {
    this.addEventListeners();
    this.updateTimeDisplay();
  }

  addEventListeners() {
    // Play/Pause
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.rewindBtn.addEventListener('click', () => this.skipBackward());
    this.forwardBtn.addEventListener('click', () => this.skipForward());
    this.video.addEventListener('click', () => this.togglePlay());

    // Progress bar
    this.progressContainer.addEventListener('click', (e) => this.seek(e));
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.video.addEventListener('loadedmetadata', () => this.updateTimeDisplay());

    // Volume
    this.muteBtn.addEventListener('click', () => this.toggleMute());
    this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));

    // Speed control
    this.speedBtn.addEventListener('click', () => this.toggleSpeedMenu());
    this.speedMenu.addEventListener('click', (e) => this.setSpeed(e));
    document.addEventListener('click', (e) => this.closeSpeedMenu(e));

    // File upload
    this.screenshotBtn.addEventListener('click', () => this.takeScreenshot());
    this.fileBtn.addEventListener('click', () => this.openFileDialog());
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    this.uploadBtn.addEventListener('click', () => this.openFileDialog());
    this.fileDropZone.addEventListener('click', () => this.openFileDialog());
    this.fileDropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.fileDropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    this.fileDropZone.addEventListener('drop', (e) => this.handleFileDrop(e));

    // Fullscreen
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

    // Keyboard controls
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Mouse controls
    this.video.addEventListener('mousemove', () => this.showControls());
    this.controls.addEventListener('mouseenter', () => this.showControls());
    this.controls.addEventListener('mouseleave', () => this.hideControls());

    this.rotateLeftBtn.addEventListener('click', () => this.rotateVideo(-90));
    this.rotateRightBtn.addEventListener('click', () => this.rotateVideo(90));

    // Video events
    this.video.addEventListener('play', () => this.onPlay());
    this.video.addEventListener('pause', () => this.onPause());
    this.video.addEventListener('ended', () => this.onEnded());
    this.video.addEventListener('loadstart', () => this.demoText.style.display = 'block');
    this.video.addEventListener('canplay', () => this.demoText.style.display = 'none');

    // URL input handling
    this.loadUrlBtn.addEventListener('click', () => {
      const url = this.videoUrl.value.trim();
      if (url) {
        this.openURL(url);
        this.fileInputContainer.style.display = 'none';
      } else {
        this.showNotification('Please enter a valid URL', 'error');
      }
    });
  }

  togglePlay() {
    if (!this.video.paused) {
      this.video.pause();
      return;
    }
    /************************************************/
    this.video.play();
  }

  skipBackward() {
    this.video.currentTime = Math.max(0, this.video.currentTime - 10);
    this.showSkipFeedback('rewind');
  }

  skipForward() {
    this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
    this.showSkipFeedback('forward');
  }

  takeScreenshot() {
    if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
      this.showNotification('No video loaded', 'error');
      return;
    }

  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions to match video
  canvas.width = this.video.videoWidth;
  canvas.height = this.video.videoHeight;

  // Draw the current video frame onto the canvas
  ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);

  // Convert canvas to blob
  canvas.toBlob((blob) => {
  if (blob) {
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const currentTime = this.formatTime(this.video.currentTime).replace(':', 'm') + 's';
  a.download = `screenshot_${timestamp}_${currentTime}.png`;

  // Trigger download
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up
  URL.revokeObjectURL(url);

  // Show success notification
    this.showNotification('Screenshot saved!', 'success');
  } else {
      this.showNotification('Failed to capture screenshot', 'error');
    }
    }, 'image/png', 1.0);
  }

showNotification(message, type = 'info') {
// Create notification element
const notification = document.createElement('div');
notification.style.cssText = `
position: fixed;
top: 20px;
right: 20px;
background: ${type === 'success' ? 'linear-gradient(135deg, #4ecdc4, #44a08d)' : 
type === 'error' ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' : 
'linear-gradient(135deg, #667eea, #764ba2)'};
color: white;
padding: 12px 20px;
border-radius: 8px;
font-size: 14px;
font-weight: 600;
box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
z-index: 10000;
opacity: 0;
transform: translateX(100%);
transition: all 0.3s ease;
backdrop-filter: blur(10px);
`;
notification.textContent = message;

document.body.appendChild(notification);

// Animate in
requestAnimationFrame(() => {
notification.style.opacity = '1';
notification.style.transform = 'translateX(0)';
});

// Animate out and remove
setTimeout(() => {
notification.style.opacity = '0';
notification.style.transform = 'translateX(100%)';
setTimeout(() => {
if (notification.parentElement) {
notification.parentElement.removeChild(notification);
}
}, 300);
}, 3000);
}

showSkipFeedback(type) {
  // Create temporary feedback element
  const feedback = document.createElement('div');
  feedback.style.cssText = `
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  `;
  feedback.textContent = type === 'forward' ? '+10s' : '-10s';

  this.video.parentElement.appendChild(feedback);

  // Animate in
  requestAnimationFrame(() => {
    feedback.style.opacity = '1';
  });

  // Remove after animation
  setTimeout(() => {
    feedback.style.opacity = '0';
    setTimeout(() => {
    if (feedback.parentElement) {
      feedback.parentElement.removeChild(feedback);
    }
    }, 200);
    }, 800);
}

onPlay() {
  this.playIcon.style.display = 'none';
  this.pauseIcon.style.display = 'block';
  this.demoText.style.display = 'none';
}

updateUI() {
  if (this.video.paused) {
    this.playIcon.style.display = 'block';
    this.pauseIcon.style.display = 'none';
  } else {
    this.playIcon.style.display = 'none';
    this.pauseIcon.style.display = 'block';
  }
}

onPause() {
  this.playIcon.style.display = 'block';
  this.pauseIcon.style.display = 'none';
}

onEnded() {
  this.playIcon.style.display = 'block';
  this.pauseIcon.style.display = 'none';
  this.progressBar.style.width = '100%';
}

seek(e) {
  const rect = this.progressContainer.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  this.video.currentTime = pos * this.video.duration;
}

updateProgress() {
  const progress = (this.video.currentTime / this.video.duration) * 100;
  this.progressBar.style.width = progress + '%';
  this.updateTimeDisplay();
}

updateTimeDisplay() {
  const current = this.formatTime(this.video.currentTime);
  const duration = this.formatTime(this.video.duration);
  this.timeDisplay.textContent = `${current} / ${duration}`;
}

formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

toggleMute() {
  this.video.muted = !this.video.muted;
  this.updateVolumeIcon();
}

setVolume(value) {
  this.video.volume = value / 100;
  this.video.muted = value == 0;
  this.updateVolumeIcon();
}

updateVolumeIcon() {
  if (this.video.muted || this.video.volume === 0) {
    this.volumeIcon.style.display = 'none';
    this.muteIcon.style.display = 'block';
  } else {
    this.volumeIcon.style.display = 'block';
    this.muteIcon.style.display = 'none';
  }
}

toggleFullscreen() {
  if (!document.fullscreenElement) {
    this.video.parentElement.parentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

toggleSpeedMenu() {
  this.speedMenu.classList.toggle('show');
}

closeSpeedMenu(e) {
  if (!this.speedBtn.contains(e.target) && !this.speedMenu.contains(e.target)) {
    this.speedMenu.classList.remove('show');
  }
}

setSpeed(e) {
  if (e.target.classList.contains('speed-option')) {
    const speed = parseFloat(e.target.dataset.speed);
    this.video.playbackRate = speed;
    this.speedText.textContent = speed + 'x';

    // Update active state
    this.speedMenu.querySelectorAll('.speed-option').forEach(option => {
      option.classList.remove('active');
    });
    e.target.classList.add('active');

    this.speedMenu.classList.remove('show');
  }
}

showControls() {
  this.controls.classList.add('show');
  clearTimeout(this.controlsTimeout);
  this.controlsTimeout = setTimeout(() => {
    if (!this.video.paused) {
      this.hideControls();
    }
  }, 3000);
}

hideControls() {
  this.controls.classList.remove('show');
}

handleKeyboard(e) {
  if (e.target.tagName.toLowerCase() === 'input') return;

  switch(e.code) {
    case 'Space':
    e.preventDefault();
    this.togglePlay();
    break;
    case 'ArrowLeft':
    e.preventDefault();
    this.skipBackward();
    break;
    case 'ArrowRight':
    e.preventDefault();
    this.skipForward();
    break;
    case 'ArrowUp':
    e.preventDefault();
    this.video.volume = Math.min(1, this.video.volume + 0.1);
    this.volumeSlider.value = this.video.volume * 100;
    break;
    case 'ArrowDown':
    e.preventDefault();
    this.video.volume = Math.max(0, this.video.volume - 0.1);
    this.volumeSlider.value = this.video.volume * 100;
    break;
    case 'KeyM':
    this.toggleMute();
    break;
    case 'KeyF':
    this.toggleFullscreen();
    break;
    case 'KeyO':
    e.preventDefault();
    this.openFileDialog();
    break;
    case 'KeyR':
    e.preventDefault();
    this.rotateVideo(90);
    break;
    case 'KeyL':
    e.preventDefault();
    this.rotateVideo(-90);
    break;
    case 'Escape':
    if (this.fileInputContainer && !this.fileInputContainer.classList.contains('hidden')) {
    this.fileInputContainer.classList.add('hidden');
    }
    break;
    case 'Comma':
    e.preventDefault();
    this.changeSpeed(-0.25);
    break;
    case 'KeyS':
    e.preventDefault();
    this.takeScreenshot();
    break;
    case 'Period':
    e.preventDefault();
    this.changeSpeed(0.25);
    break;
  }
}

changeSpeed(delta) {
  const currentSpeed = this.video.playbackRate;
  const newSpeed = Math.max(0.25, Math.min(2, currentSpeed + delta));
  this.video.playbackRate = newSpeed;
  this.speedText.textContent = newSpeed + 'x';

  // Update active state in menu
  this.speedMenu.querySelectorAll('.speed-option').forEach(option => {
    option.classList.remove('active');
    if (parseFloat(option.dataset.speed) === newSpeed) {
      option.classList.add('active');
    }
  });
}

rotateVideo(degrees) {
  this.rotation = (this.rotation + degrees) % 360;
  if (this.rotation < 0) this.rotation += 360;

  this.video.style.transform = `rotate(${this.rotation}deg)`;

  // Show rotation feedback
  this.showRotationFeedback(this.rotation);
}

showRotationFeedback(rotation) {
// Create temporary feedback element
const feedback = document.createElement('div');
feedback.style.cssText = `
position: absolute;
top: 20px;
left: 50%;
transform: translateX(-50%);
background: rgba(0, 0, 0, 0.8);
color: white;
padding: 10px 20px;
border-radius: 20px;
font-size: 14px;
font-weight: bold;
z-index: 1000;
pointer-events: none;
opacity: 0;
transition: opacity 0.2s ease;
backdrop-filter: blur(10px);
`;
feedback.textContent = `Rotation: ${rotation}°`;

this.video.parentElement.appendChild(feedback);

// Animate in
requestAnimationFrame(() => {
  feedback.style.opacity = '1';
});

// Remove after animation
setTimeout(() => {
feedback.style.opacity = '0';
setTimeout(() => {
if (feedback.parentElement) {
feedback.parentElement.removeChild(feedback);
}
}, 200);
}, 1500);
}

openFileDialog() {
  this.fileInput.click();
}

handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
  this.loadVideoFile(file);
  }
}

handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  this.fileDropZone.classList.add('drag-over');
}

handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  this.fileDropZone.classList.remove('drag-over');
}

handleFileDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  this.fileDropZone.classList.remove('drag-over');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
  const file = files[0];
  if (file.type.startsWith('video/')) {
  this.loadVideoFile(file);
  } else {
  alert('Please select a valid video file.');
  }
  }
}

loadVideoFile(file) {
  // Create object URL for the file
  const videoURL = URL.createObjectURL(file);

  // Update video source
  this.video.src = videoURL;

  // Hide file input overlay
  this.fileInputContainer.classList.add('hidden');

  // Show file info
  this.showFileInfo(file);

  // Reset player state
  this.video.currentTime = 0;
  this.rotation = 0;
  this.video.style.transform = 'rotate(0deg)';
  this.progressBar.style.width = '0%';
  this.updateTimeDisplay();
  this.updateTimeDisplay();

  // Clean up previous object URL
  this.video.addEventListener('loadstart', () => {
  if (this.currentObjectURL && this.currentObjectURL !== videoURL) {
  URL.revokeObjectURL(this.currentObjectURL);
  }
  this.currentObjectURL = videoURL;
  }, { once: true });
}

openURL(url) {
  try {
    // Validate URL
    const validatedURL = new URL(url);
    if (!validatedURL.protocol.startsWith('http')) {
      this.showNotification('Invalid URL: Only HTTP/HTTPS URLs are supported', 'error');
      return;
    }

    // Set video source
    this.video.src = url;
    
    // Show loading state
    this.demoText.style.display = 'block';
    this.demoText.textContent = 'Loading video from URL...';
    
    // Handle successful load
    this.video.oncanplay = () => {
      this.demoText.style.display = 'none';
      this.showNotification('Video loaded successfully!', 'success');
      this.video.oncanplay = null;
    };
    
    // Handle errors
    this.video.onerror = () => {
      this.demoText.style.display = 'none';
      this.showNotification('Failed to load video from URL', 'error');
      this.video.onerror = null;
    };
  } catch (error) {
    this.showNotification('Invalid URL format', 'error');
  }
}

showFileInfo(file) {
  const fileSize = this.formatFileSize(file.size);
  this.fileInfo.textContent = `${file.name} (${fileSize})`;
  this.fileInfo.classList.add('show');

  // Hide after 3 seconds
  setTimeout(() => {
  this.fileInfo.classList.remove('show');
  }, 3000);
}

formatFileSize(bytes) {
if (bytes === 0) return '0 Bytes';
const k = 1024;
const sizes = ['Bytes', 'KB', 'MB', 'GB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));
return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
}