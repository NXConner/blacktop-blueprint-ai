import { getEnv } from '@/lib/env';

const HF_BASE = 'https://api-inference.huggingface.co/models';

// Choose a general-purpose segmentation model (can be replaced with a fine-tuned asphalt model later)
const DEFAULT_SEGMENTATION_MODEL = 'facebook/detr-resnet-50-panoptic';
const DEFAULT_TEXT_MODEL = 'google/flan-t5-base';

function getAuthHeaders() {
  const token = getEnv('VITE_HUGGINGFACE_TOKEN') || getEnv('HUGGINGFACE_TOKEN');
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function segmentImage(image: Blob, model: string = DEFAULT_SEGMENTATION_MODEL): Promise<Blob> {
  const url = `${HF_BASE}/${encodeURIComponent(model)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: image,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF segmentation error: ${res.status} ${text}`);
  }
  // Many segmentation models return an image mask (PNG) in binary
  const buf = await res.arrayBuffer();
  return new Blob([buf], { type: res.headers.get('content-type') || 'image/png' });
}

export async function generateText(prompt: string, model: string = DEFAULT_TEXT_MODEL): Promise<string> {
  const url = `${HF_BASE}/${encodeURIComponent(model)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 128, temperature: 0.2 } }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF text error: ${res.status} ${text}`);
  }
  const data = await res.json();
  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text as string;
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
}