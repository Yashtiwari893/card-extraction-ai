export async function extractTextFromImage(imageUrl: string) {
  // 1️⃣ Check for API Key first
  const apiKey = process.env.FUTURIXAI_API_KEY;
  if (!apiKey) {
    throw new Error('FUTURIXAI_API_KEY is missing in environment variables');
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

  // Minimal approach: Just file
  const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
  formData.append('file', blob, 'card.jpg');

  // 4️⃣ Send file to Futurix AI
  console.log('Sending request to Futurix AI...');
  const ocrRes = await fetch('https://ai.futurixai.com/v1/ocr/process', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!ocrRes.ok) {
    const errorText = await ocrRes.text();
    console.error('OCR Error Details:', { status: ocrRes.status, body: errorText });
    throw new Error(`Futurix AI failed with status ${ocrRes.status}: ${errorText || 'Internal Server Error'}`);
  }

  const data = await ocrRes.json();
  console.log('Futurix AI Success Response');

  // 5️⃣ Extract text
  const text = data?.text?.trim();

  if (!text) {
    throw new Error('Futurix AI processed the image but returned no text');
  }

  return text;
}



