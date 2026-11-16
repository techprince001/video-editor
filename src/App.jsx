
import { useRef, useState } from "react";
import {
  Upload,
  Play,
  Pause,
  Scissors,
  Download,
  Film,
  Sparkles,
  Clock3,
  Volume2,
  RotateCcw,
  Video,
} from "lucide-react";
import "./App.css";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function App() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [message, setMessage] = useState(
    "Upload a video to start editing."
  );

  function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setMessage("Please select a valid video file.");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;

    setVideoUrl(url);
    setFileName(file.name);
    setCurrentTime(0);
    setStartTime(0);
    setEndTime(0);
    setDuration(0);
    setIsPlaying(false);
    setMessage("Video loaded. Ready to edit.");
  }

  function handleMetadata() {
    const video = videoRef.current;
    if (!video) return;

    const length = Number.isFinite(video.duration)
      ? video.duration
      : 0;

    setDuration(length);
    setStartTime(0);
    setEndTime(length);
  }

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {
        setMessage("Unable to play this video format.");
      });
    } else {
      video.pause();
    }
  }

  function handleTimeUpdate() {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }

  function seekVideo(value) {
    const time = Number(value);
    setCurrentTime(time);

    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }

  function setTrimStart() {
    if (!duration) return;

    const newStart = Math.min(currentTime, endTime - 0.1);
    if (newStart < 0) return;

    setStartTime(newStart);
    setMessage(`Trim start set to ${formatTime(newStart)}.`);
  }

  function setTrimEnd() {
    if (!duration) return;

    const newEnd = Math.max(currentTime, startTime + 0.1);
    if (newEnd > duration) return;

    setEndTime(newEnd);
    setMessage(`Trim end set to ${formatTime(newEnd)}.`);
  }

  function applyInstruction() {
    const text = instruction.trim().toLowerCase();

    if (!videoUrl || !duration) {
      setMessage("Upload a video first.");
      return;
    }

    // This first version supports simple trim instructions.
    const match = text.match(
      /trim from (\d+)(?:\s*seconds?|\s*s)? to (\d+)(?:\s*seconds?|\s*s)?/
    );

    if (match) {
      const start = Number(match[1]);
      const end = Number(match[2]);

      if (start >= 0 && end > start && end <= duration) {
        setStartTime(start);
        setEndTime(end);
        seekVideo(start);
        setMessage(
          `Trim selection set from ${formatTime(start)} to ${formatTime(end)}.`
        );
        return;
      }

      setMessage("Invalid trim range. Check the video duration.");
      return;
    }

    setMessage(
      'Try an instruction like "trim from 5 to 20 seconds". AI will be added later.'
    );
  }

  function resetEditor() {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    setCurrentTime(0);
    setStartTime(0);
    setEndTime(duration);
    setInstruction("");
    setIsPlaying(false);
    setMessage("Editing selection reset.");
  }

  function handleExport() {
    setMessage(
      "Frontend demo only: actual trimmed MP4 export will be added with FFmpeg."
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Film size={22} />
          </div>
          <div>
            <h1>FrameFlow</h1>
            <p>AI VIDEO STUDIO</p>
          </div>
        </div>

        <div className="topbar-right">
          <span className="status-dot" />
          <span>Local workspace</span>
          <button className="export-button" onClick={handleExport}>
            <Download size={16} />
            Export
          </button>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <p className="section-label">WORKSPACE</p>

          <button className="nav-item active">
            <Video size={18} />
            Video editor
          </button>

          <button className="nav-item" onClick={resetEditor}>
            <RotateCcw size={18} />
            Reset editor
          </button>

          <div className="sidebar-card">
            <Sparkles size={19} />
            <h3>AI editing</h3>
            <p>
              Soon, you will be able to edit videos using everyday
              language.
            </p>
            <span className="coming-soon">COMING SOON</span>
          </div>

          <div className="sidebar-bottom">
            <div className="avatar">FF</div>
            <div>
              <strong>My workspace</strong>
              <p>Personal project</p>
            </div>
          </div>
        </aside>

        <div className="editor">
          <div className="page-heading">
            <div>
              <p className="eyebrow">VIDEO WORKSPACE / EDITOR</p>
              <h2>Your creative studio</h2>
              <p className="subtitle">
                Upload a clip, select a range and prepare your edit.
              </p>
            </div>
            <span className="draft-badge">Draft project</span>
          </div>

          <section className="ai-panel">
            <div className="ai-heading">
              <div className="ai-symbol">
                <Sparkles size={19} />
              </div>
              <div>
                <h3>What would you like to edit?</h3>
                <p>Natural-language editing · Basic demo mode</p>
              </div>
            </div>

            <div className="prompt-row">
              <input
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyInstruction();
                }}
                placeholder='Try "trim from 5 to 20 seconds"'
                aria-label="Video editing instruction"
              />
              <button className="apply-button" onClick={applyInstruction}>
                <Sparkles size={16} />
                Apply
              </button>
            </div>
            <p className="hint">
              Currently supports simple trim-range instructions. AI comes later.
            </p>
          </section>

          <section className="preview-section">
            <div className="section-heading">
              <div>
                <h3>Preview</h3>
                <p>Review your source video</p>
              </div>
              <span className="time-chip">
                <Clock3 size={14} />
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="video-stage">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  onLoadedMetadata={handleMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() =>
                    setMessage("This video could not be loaded.")
                  }
                  className="video-player"
                  playsInline
                  controls={false}
                />
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">
                    <Film size={32} />
                  </div>
                  <h3>Your next great edit starts here</h3>
                  <p>Upload an MP4 or another browser-supported video.</p>
                  <button
                    className="upload-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={17} />
                    Choose video
                  </button>
                  <span>Video stays in your browser in this demo.</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              className="hidden-input"
              type="file"
              accept="video/*"
              onChange={handleUpload}
            />

            <div className="playback-controls">
              <button
                className="icon-button"
                onClick={() => seekVideo(0)}
                disabled={!videoUrl}
                aria-label="Go to beginning"
              >
                <RotateCcw size={17} />
              </button>

              <button
                className="play-button"
                onClick={togglePlayback}
                disabled={!videoUrl}
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <div className="seek-control">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 1}
                  step="0.1"
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) => seekVideo(event.target.value)}
                  disabled={!videoUrl || !duration}
                  aria-label="Seek video"
                />
                <span>{formatTime(duration)}</span>
              </div>

              <Volume2 size={18} className="volume-icon" />
            </div>
          </section>

          <section className="timeline-section">
            <div className="section-heading">
              <div>
                <h3>
                  <Film size={17} />
                  Timeline
                </h3>
                <p>Choose the part you want to keep</p>
              </div>
              <button className="text-button" onClick={resetEditor}>
                Reset
              </button>
            </div>

            <div className="timeline-ruler">
              <span>00:00</span>
              <span>{formatTime(duration / 4)}</span>
              <span>{formatTime(duration / 2)}</span>
              <span>{formatTime((duration * 3) / 4)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="timeline-track">
              <div className="track-label">
                <Film size={15} />
                <span>VIDEO 1</span>
              </div>

              <div className="clip-track">
                {videoUrl ? (
                  <div
                    className="selected-clip"
                    style={{
                      left: `${duration ? (startTime / duration) * 100 : 0}%`,
                      width: `${
                        duration
                          ? ((endTime - startTime) / duration) * 100
                          : 100
                      }%`,
                    }}
                  >
                    <span>{fileName}</span>
                  </div>
                ) : (
                  <span className="empty-track">
                    Upload a video to populate the timeline
                  </span>
                )}
              </div>
            </div>

            <div className="trim-controls">
              <div className="trim-field">
                <label htmlFor="trim-start">Start time (seconds)</label>
                <input
                  id="trim-start"
                  type="number"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={startTime}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (
                      value >= 0 &&
                      value < endTime &&
                      value <= duration
                    ) {
                      setStartTime(value);
                    }
                  }}
                  disabled={!videoUrl}
                />
                <button
                  onClick={setTrimStart}
                  disabled={!videoUrl}
                  className="small-button"
                >
                  <Scissors size={14} />
                  Set at playhead
                </button>
              </div>

              <div className="trim-field">
                <label htmlFor="trim-end">End time (seconds)</label>
                <input
                  id="trim-end"
                  type="number"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={endTime}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (
                      value > startTime &&
                      value <= duration
                    ) {
                      setEndTime(value);
                    }
                  }}
                  disabled={!videoUrl}
                />
                <button
                  onClick={setTrimEnd}
                  disabled={!videoUrl}
                  className="small-button"
                >
                  <Scissors size={14} />
                  Set at playhead
                </button>
              </div>
            </div>

            <div className="selection-summary">
              <span>Selected duration</span>
              <strong>
                {formatTime(Math.max(0, endTime - startTime))}
              </strong>
            </div>
          </section>

          <div className="message-bar" role="status">
            <Sparkles size={15} />
            {message}
          </div>

          <footer className="footer">
            <span>FrameFlow Studio · Frontend prototype</span>
            <span>Built step by step</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default App;

