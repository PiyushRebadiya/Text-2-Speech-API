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
    const dirs = ['./audio-output', './temp-audio', './background-music'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
    
    // Check if background music directory exists, create if not
    if (!fs.existsSync('./background-music')) {
      fs.mkdirSync('./background-music', { recursive: true });
      console.log('📁 Created background-music directory. Please add your melody.mp3 file there.');
    }
  }

  // Get only default voices - NO edge-tts fetching
  async getAvailableVoices() {
    return this.voices;
  }

  getDefaultVoices() {
    return [
      {
        id: 'en-US-AvaMultilingualNeural',
        voiceId: 'en-US-AvaMultilingualNeural',
        name: 'Ava (English US)',
        voiceName: 'Ava (English US)',
        locale: 'en-US',
        gender: 'Female',
        language: 'en',
        languageName: 'English',
        provider: 'microsoft',
        description: 'Clear American English - Female'
      },
      {
        id: 'en-US-AndrewMultilingualNeural',
        voiceId: 'en-US-AndrewMultilingualNeural',
        name: 'Andrew (English US)',
        voiceName: 'Andrew (English US)',
        locale: 'en-US',
        gender: 'Male',
        language: 'en',
        languageName: 'English',
        provider: 'microsoft',
        description: 'Professional American English - Male'
      },
      {
        id: 'en-GB-SoniaNeural',
        voiceId: 'en-GB-SoniaNeural',
        name: 'Sonia (English UK)',
        voiceName: 'Sonia (English UK)',
        locale: 'en-GB',
        gender: 'Female',
        language: 'en',
        languageName: 'English',
        provider: 'microsoft',
        description: 'British English - Female'
      },
      {
        id: 'en-GB-RyanNeural',
        voiceId: 'en-GB-RyanNeural',
        name: 'Ryan (English UK)',
        voiceName: 'Ryan (English UK)',
        locale: 'en-GB',
        gender: 'Male',
        language: 'en',
        languageName: 'English',
        provider: 'microsoft',
        description: 'British English - Male'
      },
      {
        id: 'hi-IN-SwaraNeural',
        voiceId: 'hi-IN-SwaraNeural',
        name: 'Swara (Hindi)',
        voiceName: 'Swara (Hindi)',
        locale: 'hi-IN',
        gender: 'Female',
        language: 'hi',
        languageName: 'Hindi',
        provider: 'microsoft',
        description: 'Hindi - Female'
      },
      {
        id: 'hi-IN-MadhurNeural',
        voiceId: 'hi-IN-MadhurNeural',
        name: 'Madhur (Hindi)',
        voiceName: 'Madhur (Hindi)',
        locale: 'hi-IN',
        gender: 'Male',
        language: 'hi',
        languageName: 'Hindi',
        provider: 'microsoft',
        description: 'Hindi - Male'
      },
      {
        id: 'gu-IN-DhwaniNeural',
        voiceId: 'gu-IN-DhwaniNeural',
        name: 'Dhwani (Gujarati)',
        voiceName: 'Dhwani (Gujarati)',
        locale: 'gu-IN',
        gender: 'Female',
        language: 'gu',
        languageName: 'Gujarati',
        provider: 'microsoft',
        description: 'Gujarati - Female'
      },
      {
        id: 'gu-IN-NiranjanNeural',
        voiceId: 'gu-IN-NiranjanNeural',
        name: 'Niranjan (Gujarati)',
        voiceName: 'Niranjan (Gujarati)',
        locale: 'gu-IN',
        gender: 'Male',
        language: 'gu',
        languageName: 'Gujarati',
        provider: 'microsoft',
        description: 'Gujarati - Male'
      },
      {
        id: 'mr-IN-AarohiNeural',
        voiceId: 'mr-IN-AarohiNeural',
        name: 'Aarohi (Marathi)',
        voiceName: 'Aarohi (Marathi)',
        locale: 'mr-IN',
        gender: 'Female',
        language: 'mr',
        languageName: 'Marathi',
        provider: 'microsoft',
        description: 'Marathi - Female'
      },
      {
        id: 'mr-IN-ManoharNeural',
        voiceId: 'mr-IN-ManoharNeural',
        name: 'Manohar (Marathi)',
        voiceName: 'Manohar (Marathi)',
        locale: 'mr-IN',
        gender: 'Male',
        language: 'mr',
        languageName: 'Marathi',
        provider: 'microsoft',
        description: 'Marathi - Male'
      },
      {
        id: 'ta-IN-PallaviNeural',
        voiceId: 'ta-IN-PallaviNeural',
        name: 'Pallavi (Tamil)',
        voiceName: 'Pallavi (Tamil)',
        locale: 'ta-IN',
        gender: 'Female',
        language: 'ta',
        languageName: 'Tamil',
        provider: 'microsoft',
        description: 'Tamil - Female'
      },
      {
        id: 'te-IN-MohanNeural',
        voiceId: 'te-IN-MohanNeural',
        name: 'Mohan (Telugu)',
        voiceName: 'Mohan (Telugu)',
        locale: 'te-IN',
        gender: 'Male',
        language: 'te',
        languageName: 'Telugu',
        provider: 'microsoft',
        description: 'Telugu - Male'
      },
      {
        id: 'kn-IN-SapnaNeural',
        voiceId: 'kn-IN-SapnaNeural',
        name: 'Sapna (Kannada)',
        voiceName: 'Sapna (Kannada)',
        locale: 'kn-IN',
        gender: 'Female',
        language: 'kn',
        languageName: 'Kannada',
        provider: 'microsoft',
        description: 'Kannada - Female'
      },
      {
        id: 'ml-IN-MidhunNeural',
        voiceId: 'ml-IN-MidhunNeural',
        name: 'Midhun (Malayalam)',
        voiceName: 'Midhun (Malayalam)',
        locale: 'ml-IN',
        gender: 'Male',
        language: 'ml',
        languageName: 'Malayalam',
        provider: 'microsoft',
        description: 'Malayalam - Male'
      },
      {
        id: 'bn-IN-BashkarNeural',
        voiceId: 'bn-IN-BashkarNeural',
        name: 'Bashkar (Bengali)',
        voiceName: 'Bashkar (Bengali)',
        locale: 'bn-IN',
        gender: 'Male',
        language: 'bn',
        languageName: 'Bengali',
        provider: 'microsoft',
        description: 'Bengali - Male'
      },
      {
        id: 'pa-IN-GurleenNeural',
        voiceId: 'pa-IN-GurleenNeural',
        name: 'Gurleen (Punjabi)',
        voiceName: 'Gurleen (Punjabi)',
        locale: 'pa-IN',
        gender: 'Female',
        language: 'pa',
        languageName: 'Punjabi',
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

  // Get available background music files
  getAvailableBackgroundMusic() {
    const musicDir = './background-music';
    if (!fs.existsSync(musicDir)) return [];
    
    const files = fs.readdirSync(musicDir)
      .filter(file => file.match(/\.(mp3|wav|ogg|m4a)$/i))
      .map(file => ({
        filename: file,
        path: path.join(musicDir, file),
        name: file.replace(/\.[^/.]+$/, ''),
        format: path.extname(file).substring(1).toLowerCase()
      }));
    
    return files;
  }

  // Mix voice with background music using ffmpeg
  async mixWithBackgroundMusic(voiceFile, musicFile, outputFile, options = {}) {
    const {
      musicVolume = 0.3,  // Background music volume (30% by default)
      voiceVolume = 1.0,   // Voice volume (100% by default)
      fadeIn = 0.5,        // Fade in music in seconds
      fadeOut = 1.0        // Fade out music in seconds
    } = options;

    // First, get the duration of the voice file
    const voiceDuration = await this.getAudioDuration(voiceFile);
    
    // Create ffmpeg command to mix audio
    // This uses sophisticated filtering to keep voice clear while having subtle background music
    const command = `ffmpeg -i "${voiceFile}" -stream_loop -1 -i "${musicFile}" ` +
      `-filter_complex ` +
      `"[0:a]volume=${voiceVolume}[voice]; ` +
      `[1:a]volume=${musicVolume}, ` +
      `afade=t=in:st=0:d=${fadeIn}, ` +
      `afade=t=out:st=${Math.max(0, voiceDuration - fadeOut)}:d=${fadeOut}[music]; ` +
      `[voice][music]amix=inputs=2:duration=first:dropout_transition=0" ` +
      `-c:a libmp3lame -q:a 2 -ar 44100 -ac 2 -y "${outputFile}"`;

    console.log(`🎵 Mixing with background music: ${path.basename(musicFile)}`);
    
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Audio mixing error:', stderr);
          reject(new Error(`Failed to mix audio with background music: ${error.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  // Generate speech with background music option
  async generateSpeechWithMusic(text, voiceId = 'en-US-AvaMultilingualNeural', options = {}) {
    const { 
      festivalType = 'generic', 
      rate = '+10%', 
      outputFormat = 'wav',
      backgroundMusic = 'melody.mp3',
      musicVolume = 0.3,
      includeMusic = false  // New parameter to control background music
    } = options;

    // Validate voice
    if (!this.validateVoice(voiceId)) {
      throw new Error(`Voice "${voiceId}" is not in the available voice list. Use GET /api/voices to see available voices.`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = uuidv4().substring(0, 8);
    const baseFilename = `tts_${festivalType}_${voiceId.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}_${randomId}`;
    const tempFile = `./temp-audio/${baseFilename}.mp3`;
    const finalFile = `./audio-output/${baseFilename}_with_music.${outputFormat}`;
    const voiceOnlyFile = `./audio-output/${baseFilename}.${outputFormat}`;

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

    console.log(`🔄 Generating speech: ${voiceId}, ${text.length} chars, Music: ${includeMusic ? 'Yes' : 'No'}`);

    return new Promise((resolve, reject) => {
      exec(command, async (error) => {
        if (error) {
          console.error('Edge TTS error:', error);
          return reject(new Error(`Failed to generate speech with voice "${voiceId}". Make sure edge-tts is installed: pip install edge-tts`));
        }

        try {
          let finalOutputFile;
          let musicInfo = null;

          // Check if background music is requested and available
          if (includeMusic) {
            const musicFiles = this.getAvailableBackgroundMusic();
            let musicPath = `./background-music/${backgroundMusic}`;
            
            // Use default melody.mp3 if available
            if (!fs.existsSync(musicPath) && musicFiles.length > 0) {
              musicPath = musicFiles[0].path;
              console.log(`Using available background music: ${musicFiles[0].filename}`);
            }
            
            if (fs.existsSync(musicPath)) {
              // Convert temp file to desired format first
              await this.convertAudio(tempFile, voiceOnlyFile, outputFormat);
              
              // Mix with background music
              await this.mixWithBackgroundMusic(
                voiceOnlyFile, 
                musicPath, 
                finalFile,
                { musicVolume }
              );
              
              finalOutputFile = finalFile;
              musicInfo = {
                filename: path.basename(musicPath),
                volume: musicVolume,
                mixed: true
              };
              
              // Clean up voice-only file
              fs.unlink(voiceOnlyFile, () => {});
            } else {
              console.log('⚠️ Background music not found, generating voice-only audio');
              // Fallback to voice-only if music not found
              await this.convertAudio(tempFile, voiceOnlyFile, outputFormat);
              finalOutputFile = voiceOnlyFile;
            }
          } else {
            // Generate voice-only audio
            await this.convertAudio(tempFile, voiceOnlyFile, outputFormat);
            finalOutputFile = voiceOnlyFile;
          }

          // Clean up temp file
          fs.unlink(tempFile, () => {});

          const result = {
            success: true,
            file: finalOutputFile,
            filename: path.basename(finalOutputFile),
            format: outputFormat,
            voice: voiceId,
            voiceInfo: this.voices.find(v => v.id === voiceId),
            textLength: text.length,
            downloadUrl: `/api/download/${path.basename(finalOutputFile)}`,
            streamUrl: `/api/stream/${path.basename(finalOutputFile)}`,
            festivalType: festivalType,
            timestamp: timestamp,
            backgroundMusic: musicInfo
          };

          resolve(result);
        } catch (convertError) {
          reject(new Error(`Failed to process audio: ${convertError.message}`));
        }
      });
    });
  }

  // Original generateSpeech method (without music)
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
                timestamp: timestamp,
                backgroundMusic: null
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
                  timestamp: timestamp,
                  backgroundMusic: null
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
                timestamp: timestamp,
                backgroundMusic: null
              });
            }
          });
        }
      });
    });
  }

  // Convert audio format
  async convertAudio(inputFile, outputFile, format = 'wav') {
    const formats = {
      wav: 'pcm_s16le',
      mp3: 'libmp3lame',
      ogg: 'libvorbis',
      m4a: 'aac',
      flac: 'flac'
    };

    if (!formats[format]) {
      throw new Error(`Unsupported format: ${format}`);
    }

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
app.use('/background-music', express.static('background-music'));

// API Routes

// 1. GET /api/voices - Get all available voices
app.get('/api/voices', async (req, res) => {
  try {
    let voices = await generator.getAvailableVoices();
    res.json({
      success: true,
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

// 2. GET /api/background-music - Get available background music
app.get('/api/background-music', (req, res) => {
  try {
    const musicFiles = generator.getAvailableBackgroundMusic();
    res.json({
      success: true,
      total: musicFiles.length,
      music: musicFiles,
      default: 'melody.mp3',
      tip: 'Place your background music files in ./background-music/ directory'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3. POST /api/generate - Generate speech from text (with optional background music)
app.post('/api/generate', async (req, res) => {
  try {
    const { 
      text, 
      voice, 
      format = 'wav', 
      rate = '+10%', 
      festivalType = 'generic',
      backgroundMusic = false,  // New parameter
      musicVolume = 0.3,        // New parameter
      musicFile = 'melody.mp3'  // New parameter
    } = req.body;

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

    let result;
    
    // Use new method with background music if requested
    if (backgroundMusic) {
      result = await generator.generateSpeechWithMusic(text, voiceToUse, {
        festivalType,
        rate,
        outputFormat: format.toLowerCase(),
        includeMusic: true,
        backgroundMusic: musicFile,
        musicVolume: Math.min(Math.max(parseFloat(musicVolume), 0.1), 1.0) // Clamp between 0.1 and 1.0
      });
    } else {
      // Use original method without music
      result = await generator.generateSpeech(text, voiceToUse, {
        festivalType,
        rate,
        outputFormat: format.toLowerCase()
      });
    }

    // Read the file as binary data
    const filePath = path.join(__dirname, result.file.replace('./', ''));
    const audioBuffer = fs.readFileSync(filePath);
    
    // Convert Buffer to Uint8Array for the response
    const uint8Array = new Uint8Array(audioBuffer);
    
    // Add bodyBytes to result
    const responseData = {
      ...result,
      bodyBytes: Array.from(uint8Array)
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

// 4. GET /api/generate/quick - Quick generation with query parameters
app.get('/api/generate/quick', async (req, res) => {
  log('➡️ /api/generate/quick called', {
    query: req.query,
    ip: req.ip,
    headers: req.headers
  });

  try {
    const { 
      text, 
      voice = 'en-US-AvaMultilingualNeural', 
      format = 'wav',
      backgroundMusic = 'false',
      musicVolume = '0.3'
    } = req.query;

    if (!text) {
      log('⚠️ Missing text param');
      return res.status(400).json({ success: false, error: 'Text parameter is required' });
    }

    log('🧪 Starting TTS', { 
      textLength: text.length, 
      voice, 
      format,
      backgroundMusic,
      musicVolume 
    });

    let result;
    
    // Check if background music is requested
    const includeMusic = backgroundMusic.toLowerCase() === 'true';
    
    if (includeMusic) {
      result = await generator.generateSpeechWithMusic(text, voice, {
        outputFormat: format.toLowerCase(),
        includeMusic: true,
        musicVolume: Math.min(Math.max(parseFloat(musicVolume), 0.1), 1.0)
      });
    } else {
      result = await generator.generateSpeech(text, voice, {
        outputFormat: format.toLowerCase()
      });
    }

    log('✅ TTS completed', result);

    // Read the file as binary data
    const filePath = path.join(__dirname, result.file.replace('./', ''));
    const audioBuffer = fs.readFileSync(filePath);
    
    // Convert Buffer to Uint8Array for the response
    const uint8Array = new Uint8Array(audioBuffer);
    
    // Add bodyBytes to result
    const responseData = {
      ...result,
      bodyBytes: Array.from(uint8Array)
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

// 5. GET /api/stream/:filename - Stream audio file
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

// 6. GET /api/download/:filename - Download audio file
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

  // Check if file has background music
  const hasMusic = filename.includes('_with_music');
  
  // Create a friendly filename for download
  let friendlyName;
  if (voiceInfo) {
    friendlyName = `festival_${voiceInfo.language}_${voiceInfo.gender}`;
    if (hasMusic) friendlyName += '_with_music';
    friendlyName += `.${ext.substring(1)}`;
  } else {
    friendlyName = hasMusic ? `festival_audio_with_music.${ext.substring(1)}` : `festival_audio.${ext.substring(1)}`;
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${friendlyName}"`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// 7. GET /api/status - API status
app.get('/api/status', async (req, res) => {
  try {
    const voices = await generator.getAvailableVoices();
    const backgroundMusic = generator.getAvailableBackgroundMusic();

    res.json({
      success: true,
      status: 'operational',
      version: '1.1.0',  // Updated version
      voices: {
        total: voices.length,
        languages: [...new Set(voices.map(v => v.language))],
        default: 'en-US-AvaMultilingualNeural'
      },
      backgroundMusic: {
        available: backgroundMusic.length > 0,
        files: backgroundMusic.map(m => m.filename),
        default: 'melody.mp3'
      },
      endpoints: [
        'GET /api/voices - List available voices',
        'GET /api/background-music - List available background music',
        'POST /api/generate - Generate speech (JSON body)',
        'GET /api/generate/quick - Quick generation',
        'GET /api/stream/:filename - Stream audio',
        'GET /api/download/:filename - Download audio',
        'GET /api/status - API status'
      ],
      features: [
        '16 pre-defined high-quality voices',
        'Multiple Indian languages support',
        'Background music mixing (30% volume by default)',
        'Voice clarity preservation',
        'Multiple audio formats (WAV, MP3, OGG, M4A, FLAC)',
        'Festival-specific audio generation',
        'Rate/speed control',
        'Background music volume control',
        'Fade in/out effects'
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
      'GET /api/background-music',
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

🎵 NEW FEATURE: Background Music Support
   Place your melody.mp3 in ./background-music/ directory

📊 Available Voices: 16 voices across 10 languages
🌐 API Base URL: http://localhost:${PORT}

📡 API Endpoints:
   GET  /api/voices                 - List all 16 available voices
   GET  /api/background-music       - List available background music
   POST /api/generate               - Generate speech with background music option
   GET  /api/generate/quick         - Quick generation (query params)
   GET  /api/download/:filename     - Download audio file
   GET  /api/stream/:filename       - Stream audio file
   GET  /api/status                 - API status

🎯 Default Voice: en-US-AvaMultilingualNeural
🎵 Background Music: Optional (30% volume by default)
🎨 Supported Formats: WAV, MP3, OGG, M4A, FLAC

💡 Quick Test with Music:
   curl "http://localhost:${PORT}/api/generate/quick?text=Happy%20Diwali&voice=hi-IN-SwaraNeural&format=mp3&backgroundMusic=true&musicVolume=0.3"

💡 Quick Test without Music:
   curl "http://localhost:${PORT}/api/generate/quick?text=Happy%20Diwali&voice=hi-IN-SwaraNeural&format=mp3"

🔧 Prerequisites:
   pip install edge-tts
   ffmpeg installed (for audio conversion and mixing)
  `);

  // Check for background music
  const musicFiles = generator.getAvailableBackgroundMusic();
  if (musicFiles.length === 0) {
    console.log(`
⚠️  No background music found!
   Please add your melody.mp3 to ./background-music/ directory
   Or use the API without background music
    `);
  } else {
    console.log(`✅ Found ${musicFiles.length} background music file(s): ${musicFiles.map(m => m.filename).join(', ')}`);
  }

  // Clean old files every hour
  setInterval(() => {
    generator.cleanOldFiles();
  }, 60 * 60 * 1000);
});