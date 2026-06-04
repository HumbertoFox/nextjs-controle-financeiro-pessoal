import { HandleImageChangeResult } from './definitions';

export async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>): Promise<HandleImageChangeResult> {
    const file = e.target.files?.[0];
    if (!file) return { file: null, preview: null, error: null };

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return { file: null, preview: null, error: 'Only JPEG, PNG, or WebP images are allowed.' };
    }

    if (file.size > 512 * 1024) {
        return { file: null, preview: null, error: 'The image cannot exceed 512 KB.' };
    }

    try {
        const imageBitmap = await createImageBitmap(file);
        const { width, height } = imageBitmap;

        if (width > 512 || height > 512) {
            return { file: null, preview: null, error: `The image cannot have dimensions larger than 512x512 pixels. (current: ${width}x${height}).` };
        }
    } catch {
        return { file: null, preview: null, error: 'Failed to read image dimensions.' };
    }

    return { file, preview: URL.createObjectURL(file), error: null };
}