import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

export interface ProcessMediaOptions {
  quality?: string;
  format?: string;
}

export interface ProcessedMediaResult {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

export async function isFfmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const proc = spawn('ffmpeg', ['-version']);
      proc.on('error', () => resolve(false));
      proc.on('close', (code) => resolve(code === 0));
    } catch {
      resolve(false);
    }
  });
}

/**
 * Transcodes and compresses video/audio media using FFmpeg.
 * Significantly reduces MB size for 720p, 480p, and 360p profiles.
 */
export async function processMediaWithFfmpeg(
  inputBuffer: Buffer,
  options: ProcessMediaOptions
): Promise<ProcessedMediaResult> {
  const quality = options.quality?.toLowerCase() || '1080p';
  const format = options.format?.toLowerCase() || 'mp4';

  const isAudioOnly = format === 'mp3' || format === 'm4a' || quality.startsWith('mp3') || quality === 'm4a';

  // 1. Direct Passthrough if original 1080p MP4 is requested
  if ((quality === '1080p' || quality === 'original') && !isAudioOnly) {
    return {
      buffer: inputBuffer,
      contentType: 'video/mp4',
      extension: 'mp4',
    };
  }

  // 2. Prepare temporary working files
  const randomId = crypto.randomBytes(8).toString('hex');
  const tempDir = os.tmpdir();
  const inputFilePath = path.join(tempDir, `reeldrop_in_${randomId}.mp4`);
  
  let outputExtension = 'mp4';
  let contentType = 'video/mp4';

  if (format === 'mp3' || quality.startsWith('mp3')) {
    outputExtension = 'mp3';
    contentType = 'audio/mpeg';
  } else if (format === 'm4a' || quality === 'm4a') {
    outputExtension = 'm4a';
    contentType = 'audio/mp4';
  }

  const outputFilePath = path.join(tempDir, `reeldrop_out_${randomId}.${outputExtension}`);

  try {
    await fs.promises.writeFile(inputFilePath, inputBuffer);

    const ffmpegArgs: string[] = ['-y', '-i', inputFilePath];

    if (outputExtension === 'mp3') {
      const bitrate = quality === 'mp3_320' ? '320k' : '128k';
      ffmpegArgs.push(
        '-vn',
        '-c:a', 'libmp3lame',
        '-b:a', bitrate,
        '-ar', '44100',
        outputFilePath
      );
    } else if (outputExtension === 'm4a') {
      ffmpegArgs.push(
        '-vn',
        '-c:a', 'aac',
        '-b:a', '128k',
        outputFilePath
      );
    } else {
      let scaleFilter = '';
      let crf = '23';
      let audioBitrate = '128k';

      switch (quality) {
        case '720p':
          scaleFilter = "scale='if(gt(a,1),-2,720)':'if(gt(a,1),720,-2)'";
          crf = '24';
          audioBitrate = '128k';
          break;
        case '480p':
          scaleFilter = "scale='if(gt(a,1),-2,480)':'if(gt(a,1),480,-2)'";
          crf = '26';
          audioBitrate = '96k';
          break;
        case '360p':
          scaleFilter = "scale='if(gt(a,1),-2,360)':'if(gt(a,1),360,-2)'";
          crf = '28';
          audioBitrate = '64k';
          break;
        default:
          scaleFilter = '';
          crf = '23';
          audioBitrate = '128k';
          break;
      }

      if (scaleFilter) {
        ffmpegArgs.push('-vf', scaleFilter);
      }

      ffmpegArgs.push(
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', crf,
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', audioBitrate,
        '-movflags', '+faststart',
        outputFilePath
      );
    }

    await new Promise<void>((resolve, reject) => {
      const proc = spawn('ffmpeg', ffmpegArgs);
      let stderrData = '';

      proc.stderr.on('data', (d) => {
        stderrData += d.toString();
      });

      proc.on('error', (err) => reject(err));
      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}: ${stderrData.slice(-300)}`));
        }
      });
    });

    const outputBuffer = await fs.promises.readFile(outputFilePath);

    return {
      buffer: outputBuffer,
      contentType,
      extension: outputExtension,
    };
  } catch (error) {
    console.error('[ReelDrop FFmpeg Error]:', error);
    return {
      buffer: inputBuffer,
      contentType: isAudioOnly ? 'audio/mpeg' : 'video/mp4',
      extension: isAudioOnly ? 'mp3' : 'mp4',
    };
  } finally {
    try {
      if (fs.existsSync(inputFilePath)) await fs.promises.unlink(inputFilePath);
    } catch {}
    try {
      if (fs.existsSync(outputFilePath)) await fs.promises.unlink(outputFilePath);
    } catch {}
  }
}
