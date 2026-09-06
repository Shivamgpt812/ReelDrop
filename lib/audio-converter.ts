/**
 * Client-Side Pure Audio Extractor using Web Audio API
 * Decodes the video container and extracts a pure audio stream with 0 video frames.
 */

export async function extractPureAudioBlob(videoUrl: string): Promise<Blob> {
  // 1. Fetch binary video data
  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch video stream for audio extraction.');
  }

  const arrayBuffer = await response.arrayBuffer();

  // 2. Decode audio channels using browser AudioContext
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  // 3. Encode decoded PCM audio to clean, standard audio file
  const wavBlob = encodeAudioBufferToWav(audioBuffer);

  // Close context to free memory
  if (audioCtx.state !== 'closed') {
    await audioCtx.close();
  }

  return wavBlob;
}

/**
 * Encodes an AudioBuffer into standard 16-bit PCM WAV (which plays purely as audio on all devices)
 */
function encodeAudioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // 1 = PCM
  const bitDepth = 16;

  let interleaved: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    interleaved = new Float32Array(left.length + right.length);
    let inputIndex = 0;
    for (let i = 0; i < interleaved.length; ) {
      interleaved[i++] = left[inputIndex];
      interleaved[i++] = right[inputIndex];
      inputIndex++;
    }
  } else {
    interleaved = buffer.getChannelData(0);
  }

  const dataLength = interleaved.length * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // Write RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');

  // Write fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitDepth / 8), true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // Write data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write PCM audio samples (float to 16-bit PCM)
  let offset = 44;
  for (let i = 0; i < interleaved.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, interleaved[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/mp3' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
