const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

class FestivalAudioGenerator {
  constructor() {
    this.ensureDirectories();
    this.voices = this.getDefaultVoices();
  }

  ensureDirectories() {
    const dirs = ['./audio-output', './temp-audio'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  // Get only default voices - NO edge-tts fetching
  async getAvailableVoices() {
    return this.voices;
  }

  getDefaultVoices() {
    return [
      {
        id: 'en-US-AvaMultilingualNeural',
        name: 'Ava (English US)',
        locale: 'en-US',
        gender: 'Female',
        language: 'en',
        provider: 'microsoft',
        description: 'Clear American English - Female'
      },
      {
        id: 'en-US-AndrewMultilingualNeural',
        name: 'Andrew (English US)',
        locale: 'en-US',
        gender: 'Male',
        language: 'en',
        provider: 'microsoft',
        description: 'Professional American English - Male'
      },
      {
        id: 'en-GB-SoniaNeural',
        name: 'Sonia (English UK)',
        locale: 'en-GB',
        gender: 'Female',
        language: 'en',
        provider: 'microsoft',
        description: 'British English - Female'
      },
      {
        id: 'en-GB-RyanNeural',
        name: 'Ryan (English UK)',
        locale: 'en-GB',
        gender: 'Male',
        language: 'en',
        provider: 'microsoft',
        description: 'British English - Male'
      },
      {
        id: 'hi-IN-SwaraNeural',
        name: 'Swara (Hindi)',
        locale: 'hi-IN',
        gender: 'Female',
        language: 'hi',
        provider: 'microsoft',
        description: 'Hindi - Female'
      },
      {
        id: 'hi-IN-MadhurNeural',
        name: 'Madhur (Hindi)',
        locale: 'hi-IN',
        gender: 'Male',
        language: 'hi',
        provider: 'microsoft',
        description: 'Hindi - Male'
      },
      {
        id: 'gu-IN-DhwaniNeural',
        name: 'Dhwani (Gujarati)',
        locale: 'gu-IN',
        gender: 'Female',
        language: 'gu',
        provider: 'microsoft',
        description: 'Gujarati - Female'
      },
      {
        id: 'gu-IN-NiranjanNeural',
        name: 'Niranjan (Gujarati)',
        locale: 'gu-IN',
        gender: 'Male',
        language: 'gu',
        provider: 'microsoft',
        description: 'Gujarati - Male'
      },
      {
        id: 'mr-IN-AarohiNeural',
        name: 'Aarohi (Marathi)',
        locale: 'mr-IN',
        gender: 'Female',
        language: 'mr',
        provider: 'microsoft',
        description: 'Marathi - Female'
      },
      {
        id: 'mr-IN-ManoharNeural',
        name: 'Manohar (Marathi)',
        locale: 'mr-IN',
        gender: 'Male',
        language: 'mr',
        provider: 'microsoft',
        description: 'Marathi - Male'
      },
      {
        id: 'ta-IN-PallaviNeural',
        name: 'Pallavi (Tamil)',
        locale: 'ta-IN',
        gender: 'Female',
        language: 'ta',
        provider: 'microsoft',
        description: 'Tamil - Female'
      },
      {
        id: 'te-IN-MohanNeural',
        name: 'Mohan (Telugu)',
        locale: 'te-IN',
        gender: 'Male',
        language: 'te',
        provider: 'microsoft',
        description: 'Telugu - Male'
      },
      {
        id: 'kn-IN-SapnaNeural',
        name: 'Sapna (Kannada)',
        locale: 'kn-IN',
        gender: 'Female',
        language: 'kn',
        provider: 'microsoft',
        description: 'Kannada - Female'
      },
      {
        id: 'ml-IN-MidhunNeural',
        name: 'Midhun (Malayalam)',
        locale: 'ml-IN',
        gender: 'Male',
        language: 'ml',
        provider: 'microsoft',
        description: 'Malayalam - Male'
      },
      {
        id: 'bn-IN-BashkarNeural',
        name: 'Bashkar (Bengali)',
        locale: 'bn-IN',
        gender: 'Male',
        language: 'bn',
        provider: 'microsoft',
        description: 'Bengali - Male'
      },
      {
        id: 'pa-IN-GurleenNeural',
        name: 'Gurleen (Punjabi)',
        locale: 'pa-IN',
        gender: 'Female',
        language: 'pa',
        provider: 'microsoft',
        description: 'Punjabi - Female'
      }
    ];
  }

  // Get voices by language filter
  async getVoicesByLanguage(languageCode) {
    const allVoices = this.voices;
    if (!languageCode) return allVoices;

    return allVoices.filter(voice => voice.language === languageCode);
  }

  // Get popular/recommended voices
  async getRecommendedVoices() {
    const popularIds = [
      'en-US-AvaMultilingualNeural',
      'en-GB-SoniaNeural',
      'hi-IN-SwaraNeural',
      'hi-IN-MadhurNeural',
      'gu-IN-DhwaniNeural'
    ];

    return this.voices.filter(voice => popularIds.includes(voice.id));
  }

  // Validate if voice exists in default list
  validateVoice(voiceId) {
    return this.voices.some(voice => voice.id === voiceId);
  }

  // Generate speech with specific voice (only from default list)
  async generateSpeech(text, voiceId = 'en-US-AvaMultilingualNeural', options = {}) {
    const { festivalType = 'generic', rate = '+10%', outputFormat = 'wav' } = options;

    // Validate voice
    if (!this.validateVoice(voiceId)) {
      throw new Error(`Voice "${voiceId}" is not in the available voice list. Use GET /api/voices to see available voices.`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = uuidv4().substring(0, 8);
    const filename = `tts_${festivalType}_${voiceId.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}_${randomId}`;
    const tempFile = `./temp-audio/${filename}.mp3`;
    const outputFile = `./audio-output/${filename}.${outputFormat}`;

    // Clean text for command line
    const cleanedText = text
      .replace(/"/g, '\\"')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$')
      .replace(/\n/g, ' ')
      .trim();

    if (cleanedText.length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (cleanedText.length > 5000) {
      throw new Error('Text too long (max 5000 characters)');
    }

    const command = `edge-tts --voice "${voiceId}" --text "${cleanedText}" --write-media "${tempFile}" --rate="${rate}"`;

    console.log(`🔄 Generating speech: ${voiceId}, ${text.length} chars`);

    return new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) {
          console.error('Edge TTS error:', error);
          return reject(new Error(`Failed to generate speech with voice "${voiceId}". Make sure edge-tts is installed: pip install edge-tts`));
        }

        // Convert to desired format if needed
        if (outputFormat !== 'mp3') {
          this.convertAudio(tempFile, outputFile, outputFormat)
            .then(() => {
              // Clean up temp file
              fs.unlink(tempFile, () => { });

              resolve({
                success: true,
                file: outputFile,
                filename: `${filename}.${outputFormat}`,
                format: outputFormat,
                voice: voiceId,
                voiceInfo: this.voices.find(v => v.id === voiceId),
                textLength: text.length,
                downloadUrl: `/api/download/${filename}.${outputFormat}`,
                streamUrl: `/api/stream/${filename}.${outputFormat}`,
                festivalType: festivalType,
                timestamp: timestamp
              });
            })
            .catch(convertError => {
              reject(new Error(`Failed to convert audio: ${convertError.message}`));
            });
        } else {
          // Move mp3 to output directory
          fs.rename(tempFile, outputFile, (renameError) => {
            if (renameError) {
              // Copy if rename fails
              fs.copyFile(tempFile, outputFile, () => {
                fs.unlink(tempFile, () => { });

                resolve({
                  success: true,
                  file: outputFile,
                  filename: `${filename}.mp3`,
                  format: 'mp3',
                  voice: voiceId,
                  voiceInfo: this.voices.find(v => v.id === voiceId),
                  textLength: text.length,
                  downloadUrl: `/api/download/${filename}.mp3`,
                  streamUrl: `/api/stream/${filename}.mp3`,
                  festivalType: festivalType,
                  timestamp: timestamp
                });
              });
            } else {
              resolve({
                success: true,
                file: outputFile,
                filename: `${filename}.mp3`,
                format: 'mp3',
                voice: voiceId,
                voiceInfo: this.voices.find(v => v.id === voiceId),
                textLength: text.length,
                downloadUrl: `/api/download/${filename}.mp3`,
                streamUrl: `/api/stream/${filename}.mp3`,
                festivalType: festivalType,
                timestamp: timestamp
              });
            }
          });
        }
      });
    });
  }

  // Rest of the methods remain the same (convertAudio, getAudioDuration, etc.)
  // Convert audio format - FIXED VERSION
  async convertAudio(inputFile, outputFile, format = 'wav') {
    const formats = {
      wav: 'pcm_s16le',  // Changed from 'wav' to 'pcm_s16le'
      mp3: 'libmp3lame',
      ogg: 'libvorbis',
      m4a: 'aac',
      flac: 'flac'
    };

    if (!formats[format]) {
      throw new Error(`Unsupported format: ${format}`);
    }

    // Different command for WAV format
    let command;
    if (format === 'wav') {
      command = `ffmpeg -i "${inputFile}" -c:a ${formats[format]} -ar 44100 -ac 2 "${outputFile}"`;
    } else {
      command = `ffmpeg -i "${inputFile}" -c:a ${formats[format]} -ar 44100 -ac 2 -y "${outputFile}"`;
    }

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg error details:', stderr);
          reject(new Error(`FFmpeg conversion failed: ${error.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  async getAudioDuration(filePath) {
    return new Promise((resolve, reject) => {
      const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;

      exec(command, (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          const duration = parseFloat(stdout.trim());
          resolve(isNaN(duration) ? 0 : duration);
        }
      });
    });
  }

  cleanOldFiles(maxAgeHours = 24) {
    const dirs = ['./audio-output', './temp-audio'];
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    dirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
          const filePath = path.join(dir, file);
          try {
            const stats = fs.statSync(filePath);
            if (now - stats.mtimeMs > maxAge) {
              fs.unlinkSync(filePath);
              console.log(`Cleaned up old file: ${filePath}`);
            }
          } catch (e) {
            // Ignore errors
          }
        });
      }
    });
  }
}

// Create Express app
const app = express();
const generator = new FestivalAudioGenerator();


const os = require('os');

const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function log(message, data = null) {
  const time = new Date().toISOString();
  const logLine = `[${time}] ${message} ${data ? JSON.stringify(data) : ''}\n`;

  console.log(logLine);
  fs.appendFileSync(path.join(LOG_DIR, 'server.log'), logLine);
}

function logError(message, error) {
  const time = new Date().toISOString();
  const logLine = `[${time}] ❌ ${message}\n${error?.stack || error}\n`;

  console.error(logLine);
  fs.appendFileSync(path.join(LOG_DIR, 'error.log'), logLine);
}


log('🚀 Server Boot Info', {
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  user: os.userInfo(),
  cwd: process.cwd(),
  PATH: process.env.PATH
});



// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/audio', express.static('audio-output'));

// API Routes

// 1. GET /api/voices - Get all available voices (only default ones)
app.get('/api/voices', async (req, res) => {
  try {
    const { language, gender } = req.query;
    let voices = await generator.getAvailableVoices();

    // Apply filters if provided
    if (language) {
      voices = voices.filter(v => v.language === language);
    }

    if (gender) {
      voices = voices.filter(v => v.gender.toLowerCase() === gender.toLowerCase());
    }

    // Group by language
    const groupedByLanguage = voices.reduce((acc, voice) => {
      if (!acc[voice.language]) {
        acc[voice.language] = [];
      }
      acc[voice.language].push(voice);
      return acc;
    }, {});

    // Group by gender
    const groupedByGender = voices.reduce((acc, voice) => {
      if (!acc[voice.gender]) {
        acc[voice.gender] = [];
      }
      acc[voice.gender].push(voice);
      return acc;
    }, {});

    res.json({
      success: true,
      total: voices.length,
      voices: voices,
      grouped: {
        byLanguage: groupedByLanguage,
        byGender: groupedByGender
      },
      recommended: await generator.getRecommendedVoices(),
      filters: {
        languages: [...new Set(voices.map(v => v.language))],
        genders: [...new Set(voices.map(v => v.gender))]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 2. GET /api/voices/:language - Get voices by language
app.get('/api/voices/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const voices = await generator.getVoicesByLanguage(language);

    if (voices.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No voices found for language: ${language}`,
        availableLanguages: ['en', 'hi', 'gu', 'mr', 'ta', 'te', 'kn', 'ml', 'bn', 'pa']
      });
    }

    res.json({
      success: true,
      language: language,
      total: voices.length,
      voices: voices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3. GET /api/voices/recommended - Get recommended voices
app.get('/api/voices/recommended', async (req, res) => {
  try {
    const voices = await generator.getRecommendedVoices();

    res.json({
      success: true,
      total: voices.length,
      voices: voices,
      message: 'Top 5 recommended voices for festival messages'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 4. POST /api/generate - Generate speech from text
app.post('/api/generate', async (req, res) => {
  try {
    const { text, voice, format = 'wav', rate = '+10%', festivalType = 'generic' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    // Use default voice if not specified
    const voiceToUse = voice || 'hi-IN-SwaraNeural';

    // Validate format
    const validFormats = ['wav', 'mp3', 'ogg', 'm4a', 'flac'];
    if (!validFormats.includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid format. Valid formats: ${validFormats.join(', ')}`
      });
    }

    // Generate speech
    const result = await generator.generateSpeech(text, voiceToUse, {
      festivalType,
      rate,
      outputFormat: format.toLowerCase()
    });

    // Read the file as binary data
    const filePath = path.join(__dirname, 'audio-output', result.filename);
    const audioBuffer = fs.readFileSync(filePath);
    
    // Convert Buffer to Uint8Array for the response
    const uint8Array = new Uint8Array(audioBuffer);
    
    // Add bodyBytes to result
    const responseData = {
      ...result,
      bodyBytes: Array.from(uint8Array) // Convert Uint8Array to array for JSON serialization
    };

    res.json(responseData);

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      tip: 'Make sure edge-tts is installed: pip install edge-tts'
    });
  }
});

// 5. GET /api/generate/quick - Quick generation with query parameters
app.get('/api/generate/quick', async (req, res) => {
  log('➡️ /api/generate/quick called', {
    query: req.query,
    ip: req.ip,
    headers: req.headers
  });

  try {
    const { text, voice = 'en-US-AvaMultilingualNeural', format = 'wav' } = req.query;

    if (!text) {
      log('⚠️ Missing text param');
      return res.status(400).json({ success: false, error: 'Text parameter is required' });
    }

    log('🧪 Starting TTS', { textLength: text.length, voice, format });

    const result = await generator.generateSpeech(text, voice, {
      outputFormat: format.toLowerCase()
    });

    log('✅ TTS completed', result);

    // Read the file as binary data
    const filePath = path.join(__dirname, 'audio-output', result.filename);
    const audioBuffer = fs.readFileSync(filePath);
    
    // Convert Buffer to Uint8Array for the response
    const uint8Array = new Uint8Array(audioBuffer);
    
    // Add bodyBytes to result
    const responseData = {
      ...result,
      bodyBytes: Array.from(uint8Array) // Convert Uint8Array to array for JSON serialization
    };

    if (req.query.download === 'true') {
      log('⬇️ Redirecting to download', result.filename);
      res.redirect(`/api/download/${result.filename}`);
    } else if (req.query.play === 'true') {
      log('▶️ Redirecting to stream', result.filename);
      res.redirect(`/api/stream/${result.filename}`);
    } else {
      res.json(responseData);
    }

  } catch (error) {
    logError('❌ /api/generate/quick failed', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. GET /api/stream/:filename - Stream audio file
app.get('/api/stream/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join('./audio-output', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'Audio file not found'
    });
  }

  // Determine content type based on extension
  const ext = path.extname(filename).toLowerCase();
  const contentType = {
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac'
  }[ext] || 'audio/wav';

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Handle range requests for streaming
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;

    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // Full file stream
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType
    };

    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// 7. GET /api/download/:filename - Download audio file
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join('./audio-output', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'Audio file not found'
    });
  }

  // Determine content type
  const ext = path.extname(filename).toLowerCase();
  const contentType = {
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac'
  }[ext] || 'application/octet-stream';

  // Get voice info from filename
  const voiceMatch = filename.match(/tts_[^_]+_([^_]+)_/);
  const voiceId = voiceMatch ? voiceMatch[1] : 'unknown';
  const voiceInfo = generator.voices.find(v => v.id === voiceId);

  // Create a friendly filename for download
  const friendlyName = voiceInfo ?
    `festival_${voiceInfo.language}_${voiceInfo.gender}.${ext.substring(1)}` :
    `festival_audio.${ext.substring(1)}`;

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${friendlyName}"`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// 8. GET /api/status - API status
app.get('/api/status', async (req, res) => {
  try {
    const voices = await generator.getAvailableVoices();

    res.json({
      success: true,
      status: 'operational',
      version: '1.0.0',
      voices: {
        total: voices.length,
        languages: [...new Set(voices.map(v => v.language))],
        default: 'en-US-AvaMultilingualNeural'
      },
      endpoints: [
        'GET /api/voices - List available voices',
        'GET /api/voices/:language - Voices by language',
        'GET /api/voices/recommended - Recommended voices',
        'POST /api/generate - Generate speech (JSON)',
        'GET /api/generate/quick - Quick generation',
        'GET /api/stream/:filename - Stream audio',
        'GET /api/download/:filename - Download audio',
        'GET /api/status - API status'
      ],
      features: [
        '16 pre-defined high-quality voices',
        'Multiple Indian languages support',
        'Multiple audio formats (WAV, MP3, OGG, M4A, FLAC)',
        'Festival-specific audio generation',
        'Rate/speed control',
        'Batch processing available'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/voices',
      'POST /api/generate',
      'GET /api/generate/quick',
      'GET /api/status'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 807;
app.listen(PORT, () => {
  console.log(`
🎉 Festival TTS API Server Started!
📡 Using ONLY predefined voices (NO edge-tts voice fetching)

📊 Available Voices: 16 voices across 10 languages
🌐 API Base URL: http://localhost:${PORT}

📡 API Endpoints:
   GET  /api/voices                 - List all 16 available voices
   GET  /api/voices/:language       - Filter voices by language
   GET  /api/voices/recommended     - Get recommended voices
   POST /api/generate               - Generate speech (JSON body)
   GET  /api/generate/quick         - Quick generation (query params)
   GET  /api/download/:filename     - Download audio file
   GET  /api/stream/:filename       - Stream audio file
   GET  /api/status                 - API status

🎯 Default Voice: en-US-AvaMultilingualNeural
🎨 Supported Formats: WAV, MP3, OGG, M4A, FLAC
🌍 Supported Languages: English, Hindi, Gujarati, Marathi, Tamil, Telugu, Kannada, Malayalam, Bengali, Punjabi

💡 Quick Test:
   curl "http://localhost:${PORT}/api/generate/quick?text=Happy%20Diwali&voice=hi-IN-SwaraNeural&format=mp3"

🔧 Prerequisites:
   pip install edge-tts
   ffmpeg installed (for audio conversion)
  `);

  // Clean old files every hour
  setInterval(() => {
    generator.cleanOldFiles();
  }, 60 * 60 * 1000);
});