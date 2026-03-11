export async function extractTextFromImage(imageUrl: string) {
  // 1️⃣ Check for API Key first
  if (!process.env.FUTURIXAI_API_KEY) {
    throw new Error('FUTURIXAI_API_KEY is missing in .env file');
  }

  // 2️⃣ Download image on YOUR server
  console.log('Fetching image from:', imageUrl);
  const imageRes = await fetch(imageUrl);

  if (!imageRes.ok) {
    throw new Error(`Failed to download image from URL: ${imageRes.statusText}`);
  }

  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

  // 3️⃣ Prepare multipart form-data for Futurix AI
  const formData = new FormData();

  // Adding type: 'image/jpeg' to help the server identify the file
  const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
  formData.append('file', blob, 'card.jpg');

  // Settings for Shivaay OCR (Keeping it simple as per documentation)
  formData.append('settings', JSON.stringify({
    language: 'auto',
  }));

  // 4️⃣ Send file to Futurix AI
  console.log('Sending request to Futurix AI...');
  const ocrRes = await fetch('https://ai.futurixai.com/v1/ocr/process', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FUTURIXAI_API_KEY}`,
    },
    body: formData,
  });

  if (!ocrRes.ok) {
    const errorText = await ocrRes.text();
    console.error('Futurix AI Response Status:', ocrRes.status);
    console.error('Futurix AI Error Body:', errorText);
    throw new Error(`Futurix AI OCR failed (${ocrRes.status}): ${errorText || 'Internal Server Error'}`);
  }

  const data = await ocrRes.json();
  console.log('Futurix AI Success Response');

  // 5️⃣ Extract text from Futurix AI response
  const text = data?.text?.trim();

  if (!text) {
    throw new Error('Futurix AI processed the image but returned no text');
  }

  return text;
}


