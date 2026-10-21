export const allowedFiles: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
};
export function validSignature(bytes: Uint8Array, mime: string) {
  const b = Buffer.from(bytes);
  if (mime === "image/jpeg")
    return b[0] === 255 && b[1] === 216 && b[2] === 255;
  if (mime === "image/png")
    return b
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === "application/pdf")
    return b.subarray(0, 5).toString() === "%PDF-";
  if (mime === "image/webp" || mime === "audio/wav")
    return (
      b.subarray(0, 4).toString() === "RIFF" &&
      b.subarray(8, 12).toString() === (mime === "image/webp" ? "WEBP" : "WAVE")
    );
  if (mime === "audio/mpeg")
    return (
      b.subarray(0, 3).toString() === "ID3" ||
      (b[0] === 255 && (b[1] & 224) === 224)
    );
  return false;
}
