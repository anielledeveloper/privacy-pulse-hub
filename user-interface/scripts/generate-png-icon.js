const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Create a simple 48x48 PNG icon
function createIcon(size = 48) {
  const png = new PNG({
    width: size,
    height: size,
    filterType: -1
  });

  // Create a simple green circle with white elements
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      
      // Calculate distance from center
      const center = size / 2;
      const distance = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
      
      if (distance < center - 2) {
        // Inside circle - green background
        png.data[idx] = 76;     // R: 76 (dark green)
        png.data[idx + 1] = 175; // G: 175 (green)
        png.data[idx + 2] = 80;  // B: 80 (green)
        png.data[idx + 3] = 255; // A: 255 (opaque)
      } else {
        // Outside circle - transparent
        png.data[idx] = 0;       // R: 0
        png.data[idx + 1] = 0;   // G: 0
        png.data[idx + 2] = 0;   // B: 0
        png.data[idx + 3] = 0;   // A: 0 (transparent)
      }
    }
  }

  return png;
}

// Generate the icon
const icon = createIcon(48);

// Write to file
const iconPath = path.join(__dirname, '..', 'icons', 'icon48.png');
const writeStream = fs.createWriteStream(iconPath);

icon.pack().pipe(writeStream);

writeStream.on('finish', () => {
  console.log('✅ Icon generated successfully: icon48.png');
  console.log('📁 Location:', iconPath);
});

writeStream.on('error', (err) => {
  console.error('❌ Error generating icon:', err);
});
