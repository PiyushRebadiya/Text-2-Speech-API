// ultra_simple_voices.js
const { exec } = require('child_process');
const fs = require('fs');

// Enhanced voice mapping with gender/type support
const VOICES = {
  // Indian voices
  'indian-male': { lang: 'en', tld: 'co.in', gender: 'male', pitch: 'normal' },
  'indian-female': { lang: 'en', tld: 'co.in', gender: 'female', pitch: 'normal' },
  'indian-boy': { lang: 'en', tld: 'co.in', gender: 'male', pitch: 'high', speed: 'fast' },
  'indian-girl': { lang: 'en', tld: 'co.in', gender: 'female', pitch: 'high', speed: 'fast' },
  'indian-elder': { lang: 'en', tld: 'co.in', gender: 'male', pitch: 'low', speed: 'slow' },

  // Hindi voices
  'hindi-male': { lang: 'hi', tld: 'com', gender: 'male', pitch: 'normal' },
  'hindi-female': { lang: 'hi', tld: 'com', gender: 'female', pitch: 'normal' },
  'hindi-boy': { lang: 'hi', tld: 'com', gender: 'male', pitch: 'high', speed: 'fast' },

  // British voices
  'british-male': { lang: 'en', tld: 'co.uk', gender: 'male', pitch: 'normal' },
  'british-female': { lang: 'en', tld: 'co.uk', gender: 'female', pitch: 'normal' },
  'british-boy': { lang: 'en', tld: 'co.uk', gender: 'male', pitch: 'high', speed: 'fast' },
  'british-robot': { lang: 'en', tld: 'co.uk', gender: 'neutral', pitch: 'robotic', effect: 'robot' },

  // American voices
  'american-male': { lang: 'en', tld: 'com', gender: 'male', pitch: 'normal' },
  'american-female': { lang: 'en', tld: 'com', gender: 'female', pitch: 'normal' },
  'american-child': { lang: 'en', tld: 'com', gender: 'neutral', pitch: 'high', speed: 'fast' },
  'american-robot': { lang: 'en', tld: 'com', gender: 'neutral', pitch: 'robotic', effect: 'robot' },
  'american-alien': { lang: 'en', tld: 'com', gender: 'neutral', pitch: 'alien', effect: 'alien' },

  // Tamil voices
  'tamil-male': { lang: 'ta', tld: 'com', gender: 'male', pitch: 'normal' },
  'tamil-female': { lang: 'ta', tld: 'com', gender: 'female', pitch: 'normal' },

  // Telugu voices
  'telugu-male': { lang: 'te', tld: 'com', gender: 'male', pitch: 'normal' },
  'telugu-female': { lang: 'te', tld: 'com', gender: 'female', pitch: 'normal' },

  // Special effect voices (simulated with audio processing)
  'robot': { lang: 'en', tld: 'com', gender: 'neutral', pitch: 'robotic', effect: 'robot' },
  'alien': { lang: 'en', tld: 'com', gender: 'neutral', pitch: 'alien', effect: 'alien' },
  'monster': { lang: 'en', tld: 'com', gender: 'neutral', pitch: 'low', effect: 'monster', speed: 'slow' },
  'child': { lang: 'en', tld: 'com', gender: 'neutral', pitch: 'high', speed: 'fast' },
  'old-man': { lang: 'en', tld: 'co.in', gender: 'male', pitch: 'low', speed: 'slow', effect: 'elder' },
  'old-woman': { lang: 'en', tld: 'co.in', gender: 'female', pitch: 'low', speed: 'slow', effect: 'elder' },
  'helium': { lang: 'en', tld: 'com', gender: 'neutral', pitch: 'very-high', effect: 'helium' },
  'demon': { lang: 'en', tld: 'com', gender: 'neutral', pitch: 'very-low', effect: 'demon' },
  'fast': { lang: 'en', tld: 'com', gender: 'neutral', speed: 'very-fast' },
  'slow': { lang: 'en', tld: 'com', gender: 'neutral', speed: 'very-slow' },

  // Regional accents
  'australian-male': { lang: 'en', tld: 'com.au', gender: 'male', pitch: 'normal' },
  'australian-female': { lang: 'en', tld: 'com.au', gender: 'female', pitch: 'normal' },
  'canadian-male': { lang: 'en', tld: 'ca', gender: 'male', pitch: 'normal' },
  'canadian-female': { lang: 'en', tld: 'ca', gender: 'female', pitch: 'normal' },
  'scottish-male': { lang: 'en', tld: 'co.uk', gender: 'male', pitch: 'normal', effect: 'scottish' },
  'irish-male': { lang: 'en', tld: 'ie', gender: 'male', pitch: 'normal', effect: 'irish' },
  'south-african-male': { lang: 'en', tld: 'co.za', gender: 'male', pitch: 'normal' },
};

// Voice presets for quick access
const VOICE_PRESETS = {
  // Default voices
  'indian': 'indian-male',
  'hindi': 'hindi-male',
  'british': 'british-male',
  'american': 'american-female',
  'tamil': 'tamil-male',
  'telugu': 'telugu-male',

  // Gender/Type shortcuts
  'male': 'indian-male',
  'female': 'indian-female',
  'boy': 'indian-boy',
  'girl': 'indian-girl',
  'child': 'american-child',
  'robot': 'american-robot',
  'alien': 'american-alien',
  'monster': 'monster',
  'demon': 'demon',
  'helium': 'helium',
  'fast': 'fast',
  'slow': 'slow',
  'old': 'old-man',
  'elder': 'old-man',
  'australian': 'australian-male',
  'canadian': 'canadian-male',
  'scottish': 'scottish-male',
  'irish': 'irish-male',
  'south-african': 'south-african-male',
};

// Voice effects configuration
const VOICE_EFFECTS = {
  'robot': {
    pitch: '1.5',          // Higher pitch
    tempo: '1.0',          // Normal speed
    echo: '0.8:0.88:60:0.4', // Slight echo
    filter: 'afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\'',
    description: 'Robotic voice effect'
  },
  'alien': {
    pitch: '2.0',          // Very high pitch
    tempo: '0.8',          // Slower
    filter: 'vibrato=f=6:d=0.5', // Vibrato effect
    description: 'Alien voice effect'
  },
  'monster': {
    pitch: '0.5',          // Very low pitch
    tempo: '0.7',          // Slower
    filter: 'chorus=0.5:0.9:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3',
    description: 'Monster voice effect'
  },
  'demon': {
    pitch: '0.3',          // Extremely low pitch
    tempo: '0.6',          // Very slow
    filter: 'tremolo=f=10:d=0.9',
    description: 'Demon voice effect'
  },
  'helium': {
    pitch: '3.0',          // Extremely high pitch
    tempo: '1.2',          // Faster
    description: 'Helium voice effect'
  },
  'elder': {
    pitch: '0.8',          // Lower pitch
    tempo: '0.8',          // Slower
    filter: 'atempo=0.9', // Slight slowdown
    description: 'Elderly voice effect'
  },
  'child': {
    pitch: '1.8',          // Higher pitch
    tempo: '1.3',          // Faster
    description: 'Child voice effect'
  },
  'fast': {
    pitch: '1.0',          // Normal pitch
    tempo: '1.5',          // Faster
    description: 'Fast speaking voice'
  },
  'slow': {
    pitch: '1.0',          // Normal pitch
    tempo: '0.6',          // Slower
    description: 'Slow speaking voice'
  },
  'scottish': {
    pitch: '1.0',          // Normal pitch
    tempo: '1.0',          // Normal speed
    filter: 'chorus=0.7:0.9:55:0.4:0.25:2',
    description: 'Scottish accent simulation'
  },
  'irish': {
    pitch: '1.0',          // Normal pitch
    tempo: '1.0',          // Normal speed
    filter: 'vibrato=f=4:d=0.3',
    description: 'Irish accent simulation'
  }
};

async function generateVoice(text, voiceName = 'indian-male') {
  // Check if it's a preset and resolve to actual voice
  if (VOICE_PRESETS[voiceName]) {
    voiceName = VOICE_PRESETS[voiceName];
  }

  const voice = VOICES[voiceName] || VOICES['indian-male'];
  const hasEffect = voice.effect && VOICE_EFFECTS[voice.effect];

  console.log(`🎤 Generating ${voiceName} voice (${voice.gender}, ${voice.pitch} pitch)...`);

  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const tempMp3 = `temp_${timestamp}.mp3`;
    const tempWav = `temp_${timestamp}.wav`;
    const outputFile = `voice_${voiceName}_${timestamp}.wav`;

    // Escape text for command line
    const escapedText = text.replace(/'/g, "'\"'\"'");

    // Step 1: Generate base voice with gTTS
    let cmd = `python -c "from gtts import gTTS; tts = gTTS('${escapedText}', lang='${voice.lang}', tld='${voice.tld}')`;

    // Add slow parameter for slow voices
    if (voice.speed === 'slow' || voice.speed === 'very-slow') {
      cmd += `, slow=True`;
    }

    cmd += `; tts.save('${tempMp3}')"`;

    // Step 2: Convert to WAV
    cmd += ` && ffmpeg -i ${tempMp3} ${tempWav} -y`;

    // Step 3: Apply effects if specified
    if (hasEffect) {
      const effect = VOICE_EFFECTS[voice.effect];
      let ffmpegFilter = '';

      // Build FFmpeg filter chain
      const filters = [];

      if (effect.pitch) {
        filters.push(`asetrate=44100*${effect.pitch},aresample=44100`);
      }

      if (effect.tempo) {
        filters.push(`atempo=${effect.tempo}`);
      }

      if (effect.echo) {
        filters.push(`aecho=${effect.echo}`);
      }

      if (effect.filter) {
        filters.push(effect.filter);
      }

      if (filters.length > 0) {
        ffmpegFilter = `-af "${filters.join(',')}"`;
      }

      cmd += ` && ffmpeg -i ${tempWav} ${ffmpegFilter} ${outputFile} -y`;
    } else {
      // Apply basic pitch adjustments based on voice type
      let ffmpegFilter = '';

      if (voice.pitch === 'high' || voice.pitch === 'very-high') {
        const pitchFactor = voice.pitch === 'very-high' ? '1.8' : '1.5';
        ffmpegFilter = `-af "asetrate=44100*${pitchFactor},aresample=44100"`;
      } else if (voice.pitch === 'low' || voice.pitch === 'very-low') {
        const pitchFactor = voice.pitch === 'very-low' ? '0.4' : '0.7';
        ffmpegFilter = `-af "asetrate=44100*${pitchFactor},aresample=44100"`;
      } else if (voice.pitch === 'robotic') {
        ffmpegFilter = `-af "asetrate=44100*1.5,aresample=44100,aecho=0.8:0.88:60:0.4"`;
      } else if (voice.pitch === 'alien') {
        ffmpegFilter = `-af "asetrate=44100*2.0,aresample=44100,vibrato=f=6:d=0.5"`;
      }

      // Apply speed adjustments
      if (voice.speed === 'fast' || voice.speed === 'very-fast') {
        const tempoFactor = voice.speed === 'very-fast' ? '1.5' : '1.3';
        ffmpegFilter = ffmpegFilter ?
          ffmpegFilter.replace('"', `,atempo=${tempoFactor}"`) :
          `-af "atempo=${tempoFactor}"`;
      } else if (voice.speed === 'slow' || voice.speed === 'very-slow') {
        const tempoFactor = voice.speed === 'very-slow' ? '0.6' : '0.8';
        ffmpegFilter = ffmpegFilter ?
          ffmpegFilter.replace('"', `,atempo=${tempoFactor}"`) :
          `-af "atempo=${tempoFactor}"`;
      }

      if (ffmpegFilter) {
        cmd += ` && ffmpeg -i ${tempWav} ${ffmpegFilter} ${outputFile} -y`;
      } else {
        cmd += ` && cp ${tempWav} ${outputFile}`;
      }
    }

    // Step 4: Clean up
    cmd += ` && rm -f ${tempMp3} ${tempWav}`;

    console.log(`Command: ${cmd.substring(0, 100)}...`);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Error details:', stderr);
        reject(new Error(`Failed to generate voice: ${error.message}`));
      } else if (fs.existsSync(outputFile)) {
        console.log(`✅ Created: ${outputFile}`);
        console.log(`   Type: ${voice.gender} | Pitch: ${voice.pitch} | Effect: ${voice.effect || 'none'}`);

        // Return voice info along with filename
        resolve({
          file: outputFile,
          voice: voiceName,
          language: voice.lang,
          gender: voice.gender,
          pitch: voice.pitch,
          effect: voice.effect,
          tld: voice.tld
        });
      } else {
        reject(new Error('Output file was not created'));
      }
    });
  });
}

// Voice selector helper function
function selectVoice(options = {}) {
  const {
    language = 'en',
    gender = 'male',
    pitch = 'normal',
    effect = null
  } = options;

  // Find matching voices
  let availableVoices = Object.entries(VOICES);

  // Filter by language if specified
  if (language) {
    availableVoices = availableVoices.filter(([name, voice]) => voice.lang === language);
  }

  // Filter by gender if specified
  if (gender) {
    availableVoices = availableVoices.filter(([name, voice]) => voice.gender === gender);
  }

  // Filter by pitch if specified
  if (pitch && pitch !== 'any') {
    availableVoices = availableVoices.filter(([name, voice]) => voice.pitch === pitch);
  }

  // Filter by effect if specified
  if (effect) {
    availableVoices = availableVoices.filter(([name, voice]) => voice.effect === effect);
  }

  // If no match, return default
  if (availableVoices.length === 0) {
    return 'indian-male';
  }

  // Return the first matching voice
  return availableVoices[0][0];
}

// List all available effects
function listEffects() {
  console.log('\n🎭 Available Voice Effects:');
  console.log('==========================\n');

  Object.entries(VOICE_EFFECTS).forEach(([name, effect]) => {
    const emoji = name === 'robot' ? '🤖' :
      name === 'alien' ? '👽' :
        name === 'monster' ? '👹' :
          name === 'demon' ? '😈' :
            name === 'helium' ? '🎈' :
              name === 'child' ? '👶' :
                name === 'elder' ? '👴' : '🎤';

    console.log(`${emoji} ${name}: ${effect.description}`);
    console.log(`   Pitch: ${effect.pitch || 'normal'} | Tempo: ${effect.tempo || 'normal'}`);
  });
}

// Test voice effects
async function testVoiceEffects() {
  const text = "Hello, I am a test voice. How do I sound?";

  console.log('\n🔊 Testing Voice Effects:');
  console.log('========================\n');

  const effectsToTest = ['robot', 'alien', 'monster', 'demon', 'helium', 'child', 'fast', 'slow'];

  for (const effect of effectsToTest) {
    try {
      const result = await generateVoice(text, effect);
      console.log(`✅ ${effect}: ${result.file}`);
    } catch (error) {
      console.log(`❌ ${effect} failed: ${error.message}`);
    }
  }
}

// Test male/female voices
async function testGenderVoices() {
  const text = "This is a test of male and female voices";

  console.log('\n👥 Testing Gender Voices:');
  console.log('========================\n');

  const voicesToTest = [
    'indian-male',
    'indian-female',
    'british-male',
    'british-female',
    'american-male',
    'american-female',
    'hindi-male',
    'hindi-female'
  ];

  for (const voiceName of voicesToTest) {
    try {
      const result = await generateVoice(text, voiceName);
      console.log(`✅ ${voiceName}: ${result.file}`);
    } catch (error) {
      console.log(`❌ ${voiceName} failed: ${error.message}`);
    }
  }
}

// Voice information function
function listVoices() {
  console.log('\n📢 Available Voices:');
  console.log('==================\n');

  // Group by language
  const grouped = {};

  Object.entries(VOICES).forEach(([name, voice]) => {
    if (!grouped[voice.lang]) {
      grouped[voice.lang] = [];
    }
    grouped[voice.lang].push({ name, ...voice });
  });

  // Display grouped voices
  for (const [lang, voices] of Object.entries(grouped)) {
    console.log(`${lang.toUpperCase()}:`);
    voices.forEach(voice => {
      const genderEmoji = voice.gender === 'male' ? '👨' :
        voice.gender === 'female' ? '👩' : '👤';
      const pitchIcon = voice.pitch === 'high' ? '↑' :
        voice.pitch === 'low' ? '↓' :
          voice.pitch === 'very-high' ? '⇈' :
            voice.pitch === 'very-low' ? '⇊' : '•';
      const effectIcon = voice.effect ? '🎭' : '';
      console.log(`  ${genderEmoji} ${pitchIcon} ${voice.name}${effectIcon}`);
    });
    console.log('');
  }

  console.log('\n🎯 Presets:');
  Object.entries(VOICE_PRESETS).forEach(([preset, actualVoice]) => {
    console.log(`  ${preset} → ${actualVoice}`);
  });
}

// Generate voice with custom effect parameters
async function generateCustomVoice(text, options = {}) {
  const {
    language = 'en',
    tld = 'com',
    pitch = '1.0',
    tempo = '1.0',
    echo = false,
    outputName = 'custom'
  } = options;

  console.log(`🎨 Generating custom voice: ${text.substring(0, 30)}...`);

  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const tempMp3 = `temp_custom_${timestamp}.mp3`;
    const tempWav = `temp_custom_${timestamp}.wav`;
    const outputFile = `voice_${outputName}_${timestamp}.wav`;

    // Escape text
    const escapedText = text.replace(/'/g, "'\"'\"'");

    // Build FFmpeg filter
    let ffmpegFilter = '';
    const filters = [];

    if (pitch !== '1.0') {
      filters.push(`asetrate=44100*${pitch},aresample=44100`);
    }

    if (tempo !== '1.0') {
      filters.push(`atempo=${tempo}`);
    }

    if (echo) {
      filters.push(`aecho=0.8:0.88:60:0.4`);
    }

    if (filters.length > 0) {
      ffmpegFilter = `-af "${filters.join(',')}"`;
    }

    const cmd = `python -c "from gtts import gTTS; tts = gTTS('${escapedText}', lang='${language}', tld='${tld}'); tts.save('${tempMp3}')" && ffmpeg -i ${tempMp3} ${tempWav} -y && ffmpeg -i ${tempWav} ${ffmpegFilter} ${outputFile} -y && rm -f ${tempMp3} ${tempWav}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed: ${error.message}`));
      } else if (fs.existsSync(outputFile)) {
        console.log(`✅ Custom voice created: ${outputFile}`);
        resolve({
          file: outputFile,
          settings: { language, tld, pitch, tempo, echo }
        });
      } else {
        reject(new Error('File not created'));
      }
    });
  });
}

// Main execution
async function main() {
  console.log('\n🎵 Enhanced Voice Generation System');
  console.log('==================================\n');

  // List available voices
  listVoices();

  // List effects
  listEffects();

  // Test different voice types
  await testGenderVoices();
  await testVoiceEffects();

  // Example: Custom voice generation
  console.log('\n🎨 Custom Voice Example:');
  try {
    const custom = await generateCustomVoice(
      "This is a custom pitched voice",
      { pitch: '0.7', tempo: '0.8', outputName: 'deep-slow' }
    );
    console.log(`✅ Custom: ${custom.file}`);
  } catch (error) {
    console.log(`❌ Custom failed: ${error.message}`);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export functions
module.exports = {
  generateVoice,
  selectVoice,
  generateCustomVoice,
  listVoices,
  listEffects,
  testGenderVoices,
  testVoiceEffects,
  VOICES,
  VOICE_PRESETS,
  VOICE_EFFECTS
};