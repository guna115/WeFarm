import sharp from 'sharp';

/**
 * Add watermark text to an image buffer
 */
export async function addWatermark(
  imageBuffer: Buffer,
  nurseryName: string
): Promise<Buffer> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN');
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const watermarkText = `${nurseryName} • ${dateStr} ${timeStr}`;

  // Get image dimensions
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1200;
  const height = metadata.height || 900;

  // Create SVG overlay for watermark
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect x="0" y="${height - 50}" width="${width}" height="50" fill="rgba(0,0,0,0.5)" />
      <text x="15" y="${height - 18}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">
        ${escapeXml(watermarkText)}
      </text>
    </svg>
  `);

  return sharp(imageBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toBuffer();
}

/**
 * Compress image to optimize for mobile
 */
export async function compressImage(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
