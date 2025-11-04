const functions = require('firebase-functions');
const crypto = require('crypto');

// Cloud Functions endpoint to provide a signature for Cloudinary uploads.
// Set the following environment variables in your functions environment before deploying:
//  - CLOUDINARY_API_KEY
//  - CLOUDINARY_API_SECRET
//  - CLOUDINARY_CLOUD_NAME

exports.getCloudinarySignature = functions.https.onRequest((req, res) => {
  // Allow CORS for local development; tighten in production
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    console.error('Cloudinary env not configured');
    return res.status(500).json({ error: 'Cloudinary not configured on functions environment' });
  }

  // minimal signing: timestamp only
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `timestamp=${timestamp}${apiSecret}`; // keep order stable
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  return res.json({ timestamp, signature, api_key: apiKey, cloud_name: cloudName });
});