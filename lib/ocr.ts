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
  const imageBuffer = await imageRes.arrayBuffer();

  // 2️⃣ Prepare multipart form-data (Matching the exact order/logic of your example)
  const formData = new FormData();

  // Appending file FIRST as per example
  formData.append(
    'file',
    new Blob([imageBuffer], { type: 'image/jpeg' }),
    'card.jpg'
  );

  // Appending settings SECOND with correct keys
  const settings = {
    languageHints: ['en'],
    includeBoundingBoxes: false
  };
  formData.append('settings', JSON.stringify(settings));

  // 3️⃣ Send to Futurix AI
  console.log('--- Sending OCR Request to Futurix AI (Matches Example Pattern) ---');
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
