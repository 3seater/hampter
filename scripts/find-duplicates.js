import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to hamster comments folder
const imagesFolder = path.join(__dirname, '../src/assets/hamster comments');

/**
 * Calculate MD5 hash of file (for exact duplicates)
 */
function calculateFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

/**
 * Calculate perceptual hash (pHash) for similar images
 * This detects the same artwork even if quality/format differs
 */
async function calculatePerceptualHash(filePath) {
  try {
    // Resize to 8x8 for hash calculation
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Convert to grayscale and resize to 8x8
    const buffer = await image
      .greyscale()
      .resize(8, 8, { fit: 'fill' })
      .raw()
      .toBuffer();
    
    // Calculate average pixel value
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i];
    }
    const avg = sum / buffer.length;
    
    // Create hash: 1 if pixel > average, 0 otherwise
    let hash = '';
    for (let i = 0; i < buffer.length; i++) {
      hash += buffer[i] > avg ? '1' : '0';
    }
    
    return hash;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Calculate Hamming distance between two hashes
 */
function hammingDistance(hash1, hash2) {
  if (hash1.length !== hash2.length) return Infinity;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

/**
 * Main function to find duplicates
 */
async function findDuplicates() {
  console.log('🔍 Scanning for duplicate images...\n');
  
  // Get all image files
  const files = fs.readdirSync(imagesFolder)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .map(file => path.join(imagesFolder, file));
  
  console.log(`Found ${files.length} image files\n`);
  
  // Calculate hashes for all files
  const fileData = [];
  
  for (const file of files) {
    const fileName = path.basename(file);
    console.log(`Processing: ${fileName}...`);
    
    const fileHash = calculateFileHash(file);
    const perceptualHash = await calculatePerceptualHash(file);
    const stats = fs.statSync(file);
    
    fileData.push({
      file: fileName,
      fullPath: file,
      fileHash,
      perceptualHash,
      size: stats.size
    });
  }
  
  console.log('\n📊 Analyzing duplicates...\n');
  
  // Find exact duplicates (same file hash)
  const exactDuplicates = new Map();
  fileData.forEach(data => {
    if (!exactDuplicates.has(data.fileHash)) {
      exactDuplicates.set(data.fileHash, []);
    }
    exactDuplicates.get(data.fileHash).push(data);
  });
  
  // Find similar images (perceptual hash with small hamming distance)
  const similarImages = [];
  for (let i = 0; i < fileData.length; i++) {
    for (let j = i + 1; j < fileData.length; j++) {
      if (fileData[i].perceptualHash && fileData[j].perceptualHash) {
        const distance = hammingDistance(
          fileData[i].perceptualHash,
          fileData[j].perceptualHash
        );
        // Threshold: if hamming distance is small, images are similar
        if (distance <= 5) { // Adjust threshold as needed (0-64, lower = stricter)
          similarImages.push({
            file1: fileData[i].file,
            file2: fileData[j].file,
            distance,
            hash1: fileData[i].perceptualHash,
            hash2: fileData[j].perceptualHash
          });
        }
      }
    }
  }
  
  // Report results
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 DUPLICATE DETECTION RESULTS');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Exact duplicates
  let exactCount = 0;
  exactDuplicates.forEach((files, hash) => {
    if (files.length > 1) {
      exactCount++;
      console.log(`\n🔴 EXACT DUPLICATE GROUP ${exactCount}:`);
      files.forEach(f => {
        console.log(`   - ${f.file} (${(f.size / 1024).toFixed(2)} KB)`);
      });
      console.log(`   Hash: ${hash.substring(0, 16)}...`);
    }
  });
  
  if (exactCount === 0) {
    console.log('✅ No exact duplicates found (same file content)\n');
  }
  
  // Similar images
  if (similarImages.length > 0) {
    console.log(`\n\n🟡 SIMILAR IMAGES (same artwork, different quality/format):`);
    console.log(`   Found ${similarImages.length} similar pairs\n`);
    
    similarImages.forEach((pair, index) => {
      console.log(`   Pair ${index + 1}:`);
      console.log(`   - ${pair.file1}`);
      console.log(`   - ${pair.file2}`);
      console.log(`   Similarity: ${((64 - pair.distance) / 64 * 100).toFixed(1)}% (distance: ${pair.distance}/64)`);
      console.log('');
    });
  } else {
    console.log('\n✅ No similar images found\n');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log(`\nSummary:`);
  console.log(`- Total files scanned: ${files.length}`);
  console.log(`- Exact duplicate groups: ${exactCount}`);
  console.log(`- Similar image pairs: ${similarImages.length}`);
  console.log('\n💡 Tip: Exact duplicates can be safely removed. Review similar images manually.\n');
}

// Run the script
findDuplicates().catch(console.error);

