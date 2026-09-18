import { createClient } from '@supabase/supabase-js';

const DOCUMENTS_BUCKET = 'documents';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

export async function uploadDocument(path: string, file: File): Promise<void> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw new Error(error.message);
}

export async function getDocumentDownloadUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).createSignedUrl(path, 60 * 5);
  if (error || !data) throw new Error(error?.message || 'Failed to sign URL');
  return data.signedUrl;
}

export async function deleteDocument(path: string): Promise<void> {
  await supabase.storage.from(DOCUMENTS_BUCKET).remove([path]);
}
