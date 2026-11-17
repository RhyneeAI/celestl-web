import { defineEventHandler, readMultipartFormData, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No image uploaded',
        });
    }

    const fileItem = formData.find((f) => f.name === 'file' || f.type?.startsWith('image/'));
    if (!fileItem || !fileItem.data) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid image file provided',
        });
    }

    const visionUrl = process.env.VISION_SERVICE_URL || 'http://127.0.0.1:8001';

    try {
        const forwardForm = new FormData();
        const blob = new Blob([new Uint8Array(fileItem.data)], { type: fileItem.type || 'image/png' });
        forwardForm.append('file', blob, fileItem.filename || 'screenshot.png');

        const response = await fetch(`${visionUrl}/ocr/best50`, {
            method: 'POST',
            body: forwardForm,
        });

        if (!response.ok) {
            const errText = await response.text();
            throw createError({
                statusCode: response.status,
                statusMessage: `Vision OCR service error: ${errText}`,
            });
        }

        const data = await response.json();
        return data;
    } catch (err: any) {
        throw createError({
            statusCode: err.statusCode || 502,
            statusMessage: err.statusMessage || `Failed to connect to Vision OCR service at ${visionUrl}. Make sure the FastAPI service is running.`,
        });
    }
});

