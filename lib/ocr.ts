export async function extractTextFromImage(imageUrl: string) {
  // 1️⃣ API Key ko trim karein (hidden spaces hatane ke liye)
  const apiKey = process.env.FUTURIXAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('FUTURIXAI_API_KEY is missing in .env');
  }

  // 2️⃣ Download image
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) {
    throw new Error(`Failed to download image: ${imageRes.status}`);
  }
  const arrayBuffer = await imageRes.arrayBuffer();

  // 3️⃣ Prepare FormData
  const formData = new FormData();

  // Example ke mutabik: file pehle, settings baad mein
  const fileBlob = new Blob([arrayBuffer], { type: 'image/jpeg' });
  formData.append('file', fileBlob, 'card.jpg');

  const settings = {
    languageHints: ['en'],
    includeBoundingBoxes: false
  };
  formData.append('settings', JSON.stringify(settings));

  // 4️⃣ Send to Futurix AI
  console.log('Sending request to Futurix AI with length:', arrayBuffer.byteLength);

  const ocrRes = await fetch('https://ai.futurixai.com/v1/ocr/process', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      // Content-Type yahan manually nahi set karna hai!
    },
    body: formData,
  });

  if (!ocrRes.ok) {
    const errorText = await ocrRes.text();
    console.error('OCR Fatal Error:', {
      status: ocrRes.status,
      body: errorText,
      url: 'https://ai.futurixai.com/v1/ocr/process'
    });
    throw new Error(`Futurix Error (${ocrRes.status}): ${errorText}`);
  }

  const data = await ocrRes.json();
  console.log('Futurix AI Success Response received');

  const text = data?.text?.trim();

  if (!text) {
    throw new Error('Image processed but no text found');
  }

  return text;
}
