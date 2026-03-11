export async function extractTextFromImage(imageUrl: string) {
  // 1️⃣ Download image on YOUR server
  const imageRes = await fetch(imageUrl);

  if (!imageRes.ok) {
    throw new Error('Failed to download image');
  }

  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

  // 2️⃣ Prepare multipart form-data for Futurix AI
  const formData = new FormData();
  formData.append(
    'file',
    new Blob([imageBuffer]),
    'card.jpg'
  );
  
  // Settings for Shivaay OCR (optional)
  formData.append('settings', JSON.stringify({
    language: 'auto',
    includeBoundingBoxes: false,
  }));

  // 3️⃣ Send file to Futurix AI
  const ocrRes = await fetch('https://ai.futurixai.com/v1/ocr/process', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FUTURIXAI_API_KEY}`,
    },
    body: formData,
  });

  if (!ocrRes.ok) {
    const errorText = await ocrRes.text();
    console.error('Futurix AI Error:', errorText);
    throw new Error(`OCR request failed: ${ocrRes.status}`);
  }

  const data = await ocrRes.json();
  console.log('Futurix AI RAW RESPONSE:', JSON.stringify(data, null, 2));

  // 4️⃣ Extract text from Futurix AI response
  const text = data?.text?.trim();

  if (!text) {
    throw new Error('No text detected by Futurix AI');
  }

  return text;
}

