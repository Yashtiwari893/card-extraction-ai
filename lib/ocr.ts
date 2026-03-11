export async function extractTextFromImage(imageUrl: string) {
  const apiKey = process.env.FUTURIXAI_API_KEY;
  if (!apiKey) {
    throw new Error('FUTURIXAI_API_KEY is missing');
  }

  // 1️⃣ Download image
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) {
    throw new Error(`Failed to download image: ${imageRes.status}`);
  }
  const imageBlob = await imageRes.blob();

  // 2️⃣ Prepare multipart form-data
  const formData = new FormData();

  // Try sending settings FIRST (some servers require non-file fields first)
  formData.append('settings', JSON.stringify({
    language: 'auto',
    includeBoundingBoxes: false,
  }));

  // Then append the file
  formData.append('file', imageBlob, 'card.jpg');

  // 3️⃣ Send to Futurix AI
  console.log('--- Sending OCR Request to Futurix AI ---');
  const ocrRes = await fetch('https://ai.futurixai.com/v1/ocr/process', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!ocrRes.ok) {
    const errorText = await ocrRes.text();
    console.error('Futurix RAW Error:', errorText);
    throw new Error(`OCR Failed (${ocrRes.status}): ${errorText}`);
  }

  const data = await ocrRes.json();
  console.log('Futurix Success!');

  const text = data?.text?.trim();

  if (!text) {
    throw new Error('No text extracted from image');
  }

  return text;
}




