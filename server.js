// festival_voices_fixed.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class FixedMultiVoiceTTS {
  constructor() {
    console.log('🎭 Multi-Voice Festival Audio Generator\n');

    this.voiceProfiles = {
      // Indian Voices
      'indian_male': {
        lang: 'en',
        tld: 'co.in',
        slow: 'False',
        description: 'Indian English Male (Natural)'
      },
      'indian_female': {
        lang: 'en',
        tld: 'co.in',
        slow: 'False',
        description: 'Indian English Female'
      },
      'hindi_male': {
        lang: 'hi',
        tld: 'com',
        slow: 'False',
        description: 'Hindi Male'
      },
      'hindi_female': {
        lang: 'hi',
        tld: 'com',
        slow: 'False',
        description: 'Hindi Female'
      },

      // Regional Languages
      'tamil': {
        lang: 'ta',
        tld: 'com',
        slow: 'False',
        description: 'Tamil'
      },
      'telugu': {
        lang: 'te',
        tld: 'com',
        slow: 'False',
        description: 'Telugu'
      },
      'bengali': {
        lang: 'bn',
        tld: 'com',
        slow: 'False',
        description: 'Bengali'
      },
      'marathi': {
        lang: 'mr',
        tld: 'com',
        slow: 'False',
        description: 'Marathi'
      },
      'gujarati': {
        lang: 'gu',
        tld: 'com',
        slow: 'False',
        description: 'Gujarati'
      },
      'punjabi': {
        lang: 'pa',
        tld: 'com',
        slow: 'False',
        description: 'Punjabi'
      },

      // International Voices
      'british': {
        lang: 'en',
        tld: 'co.uk',
        slow: 'False',
        description: 'British English'
      },
      'american': {
        lang: 'en',
        tld: 'com',
        slow: 'False',
        description: 'American English'
      },
      'australian': {
        lang: 'en',
        tld: 'com.au',
        slow: 'False',
        description: 'Australian English'
      },
      'canadian': {
        lang: 'en',
        tld: 'ca',
        slow: 'False',
        description: 'Canadian English'
      },

      // Special Voices
      'slow_narrator': {
        lang: 'en',
        tld: 'co.in',
        slow: 'True',
        description: 'Slow Narrator'
      },
      'fast_excited': {
        lang: 'en',
        tld: 'com',
        slow: 'False',
        description: 'Fast & Excited'
      }
    };
  }

  // Generate audio with specific voice
  async generateVoice(text, voiceType = 'indian_male') {
    const profile = this.voiceProfiles[voiceType];

    if (!profile) {
      throw new Error(`Voice type "${voiceType}" not found`);
    }

    console.log(`🎤 Using: ${profile.description}`);

    return new Promise((resolve, reject) => {
      const outputFile = `${voiceType}_${Date.now()}.wav`;

      // Create Python script
      const pythonScript = `
import os
import sys

try:
    from gtts import gTTS
    from gtts.lang import tts_langs
    
    # Print available languages for debugging
    # print("Available languages:", tts_langs())
    
except ImportError as e:
    print("ERROR:gtts not installed. Run: pip install gtts")
    sys.exit(1)

text = """${text.replace(/"/g, '\\"').replace(/\n/g, ' ').trim()}"""

try:
    # Create TTS with specific voice
    tts = gTTS(
        text=text,
        lang='${profile.lang}',
        tld='${profile.tld}',
        slow=${profile.slow}
    )
    
    # Save as MP3
    mp3_file = 'temp_audio_${Date.now()}.mp3'
    tts.save(mp3_file)
    
    # Convert to WAV using FFmpeg
    if os.path.exists(mp3_file):
        # Try conversion
        os.system(f'ffmpeg -i "{mp3_file}" -ar 44100 -ac 2 -y "${outputFile}" 2>nul')
        
        # Clean up MP3
        os.remove(mp3_file)
        
        if os.path.exists("${outputFile}"):
            print("SUCCESS:${outputFile}")
        else:
            print("ERROR:Failed to convert to WAV")
    else:
        print("ERROR:MP3 file not created")
        
except Exception as e:
    print(f"ERROR:{str(e)}")
`;

      fs.writeFileSync('generate_voice.py', pythonScript);

      exec('python generate_voice.py', (error, stdout, stderr) => {
        // Cleanup script file
        if (fs.existsSync('generate_voice.py')) {
          fs.unlinkSync('generate_voice.py');
        }

        if (stdout.includes('SUCCESS:')) {
          const file = stdout.split(':')[1].trim();
          if (fs.existsSync(file)) {
            console.log(`✅ Created: ${file}`);
            resolve(file);
          } else {
            reject(new Error('Output file not found'));
          }
        } else if (stdout.includes('ERROR:')) {
          const errorMsg = stdout.split(':')[1] || 'Unknown error';
          reject(new Error(errorMsg.trim()));
        } else if (error) {
          reject(new Error(`Python execution failed: ${error.message}`));
        } else {
          console.log('Debug output:', stdout);
          reject(new Error('Unexpected error occurred'));
        }
      });
    });
  }

  // SIMPLER METHOD: Direct command execution
  async generateVoiceSimple(text, voiceType = 'indian_male') {
    const profile = this.voiceProfiles[voiceType];

    console.log(`🎤 Generating: ${profile.description}`);

    return new Promise((resolve, reject) => {
      const outputFile = `${voiceType}_${Date.now()}.wav`;

      // Escape text for command line
      const escapedText = text.replace(/'/g, "'\"'\"'").replace(/"/g, '\\"');

      // Direct Python command
      const pythonCmd = `python -c "from gtts import gTTS; tts = gTTS(text='${escapedText}', lang='${profile.lang}', tld='${profile.tld}', slow=${profile.slow}); tts.save('temp.mp3')"`;

      // FFmpeg conversion
      const ffmpegCmd = `ffmpeg -i temp.mp3 -ar 44100 -ac 2 -y "${outputFile}"`;

      // Cleanup
      const cleanupCmd = `del temp.mp3`;

      // Combine commands
      const fullCommand = `${pythonCmd} && ${ffmpegCmd} && ${cleanupCmd}`;

      exec(fullCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('Command error:', stderr);
          reject(new Error(`Failed to generate audio: ${error.message}`));
        } else if (fs.existsSync(outputFile)) {
          console.log(`✅ Audio created: ${outputFile}`);
          resolve(outputFile);
        } else {
          reject(new Error('Audio file was not created'));
        }
      });
    });
  }

  // Test all voices quickly
  async testAllVoices() {
    const testText = "Welcome to our festival!";

    console.log('🔊 Testing all available voices...\n');

    const results = [];

    for (const [voiceType, profile] of Object.entries(this.voiceProfiles)) {
      console.log(`Testing: ${profile.description}`);

      try {
        // Use short timeout for testing
        const audioFile = await Promise.race([
          this.generateVoiceSimple(testText, voiceType),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]);

        results.push({
          voice: voiceType,
          description: profile.description,
          file: audioFile,
          status: 'SUCCESS'
        });

        console.log(`✅ Success\n`);

      } catch (error) {
        console.log(`❌ Failed: ${error.message}\n`);
        results.push({
          voice: voiceType,
          description: profile.description,
          status: 'FAILED',
          error: error.message
        });
      }
    }

    return results;
  }

  // List available voices
  listVoices() {
    console.log('\n🎯 AVAILABLE VOICES:');
    console.log('━'.repeat(50));

    Object.entries(this.voiceProfiles).forEach(([key, profile], index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${key.padEnd(15)} - ${profile.description}`);
    });

    console.log('━'.repeat(50));
  }

  // Enhance audio with effects
  async enhanceAudio(audioFile, effect = 'normal') {
    const outputFile = `enhanced_${path.basename(audioFile)}`;

    const effects = {
      'bass_boost': 'bass=gain=5',
      'clear_voice': 'treble=gain=2',
      'radio': 'highpass=300,lowpass=3000',
      'echo': 'aecho=0.8:0.9:1000:0.4',
      'reverb': 'aecho=0.8:0.9:1000:0.3',
      'chorus': 'chorus=0.5:0.9:50:0.4:0.25:2',
      'normal': 'volume=1.0'
    };

    const command = `ffmpeg -i "${audioFile}" -af "${effects[effect]}" -ar 44100 -ac 2 -y "${outputFile}"`;

    return new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) {
          console.warn(`⚠️ Effect "${effect}" failed, using original`);
          resolve(audioFile);
        } else if (fs.existsSync(outputFile)) {
          console.log(`✨ Applied effect: ${effect}`);
          resolve(outputFile);
        } else {
          resolve(audioFile);
        }
      });
    });
  }
}

// ============== MAIN PROGRAM ==============
async function main() {
  console.clear();
  console.log('='.repeat(60));
  console.log('   🎵 FESTIVAL VOICE GENERATOR');
  console.log('='.repeat(60));

  const tts = new FixedMultiVoiceTTS();

  // Show available voices
  tts.listVoices();

  // Sample festival text
  const festivalTexts = {
    diwali: "Happy Diwali to all! May the festival of lights bring joy and prosperity to your home.",
    holi: "Happy Holi! Let's play with colors and spread happiness everywhere.",
    short: "Welcome to our celebration!"
  };

  const text = festivalTexts.short; // Use short text for testing

  console.log(`\n📝 Text to convert: "${text}"\n`);

  // Try a few different voices
  const voicesToTry = ['indian_male', 'indian_female', 'hindi_male', 'british', 'slow_narrator'];

  console.log('🚀 Generating sample voices...\n');

  for (const voiceType of voicesToTry) {
    try {
      console.log(`🎤 Trying: ${tts.voiceProfiles[voiceType].description}`);

      const audioFile = await tts.generateVoiceSimple(text, voiceType);

      // Apply enhancement
      const enhanced = await tts.enhanceAudio(audioFile, 'clear_voice');

      console.log(`✅ Created: ${enhanced}\n`);

      // Optional: Play the audio
      // exec(`ffplay -nodisp -autoexit "${enhanced}"`, () => {});

    } catch (error) {
      console.log(`❌ Failed for ${voiceType}: ${error.message}\n`);
    }
  }

  console.log('='.repeat(60));
  console.log('🎉 Voice generation complete!');
  console.log('='.repeat(60));

  console.log('\n💡 TIPS:');
  console.log('1. For Diwali videos: Use indian_male or hindi_male');
  console.log('2. For Holi fun videos: Use indian_female or fast_excited');
  console.log('3. For formal videos: Use british or slow_narrator');
  console.log('4. For regional videos: Use tamil, telugu, etc.');
}

// ============== QUICK TEST FUNCTION ==============
async function quickTest() {
  console.log('\n⚡ QUICK TEST - Single Voice Generation\n');

  const tts = new FixedMultiVoiceTTS();

  // Test with simple one-liner
  const testText = "Happy Festival!";

  try {
    // Direct test without Python file
    const outputFile = `test_${Date.now()}.wav`;

    const command = `python -c "from gtts import gTTS; tts = gTTS(text='${testText}', lang='en', tld='co.in', slow=False); tts.save('test_temp.mp3')" && ffmpeg -i test_temp.mp3 -ar 44100 -ac 2 -y "${outputFile}" && del test_temp.mp3`;

    console.log('🔄 Running command...');

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error:', stderr);

        // Check if gtts is installed
        exec('python -c "import gtts; print(\"✅ gTTS is installed\")"', (importError) => {
          if (importError) {
            console.log('\n🔧 INSTALLATION REQUIRED:');
            console.log('Run: pip install gtts');
          }
        });

      } else if (fs.existsSync(outputFile)) {
        console.log(`✅ SUCCESS! Audio created: ${outputFile}`);

        // Test playing
        exec(`ffplay -nodisp -autoexit "${outputFile}"`, () => {
          console.log('\n🎧 Audio playback complete!');
        });
      }
    });

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the program
main();

// Uncomment below for quick test
// quickTest();