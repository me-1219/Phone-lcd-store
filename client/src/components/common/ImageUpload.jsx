import { useRef, useState } from "react";
import { Upload, X, ImageOff, Loader2 } from "lucide-react";
import * as uploadService from "../../services/uploadService";

// multiple=false -> value is a single URL string, onChange(url)
// multiple=true  -> value is an array of URLs, onChange(urls[])
const ImageUpload = ({ value, onChange, multiple = false, maxFiles = 6 }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const urls = multiple ? value || [] : value ? [value] : [];

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setError("");
    setUploading(true);

    try {
      if (multiple) {
        const remainingSlots = maxFiles - urls.length;
        const files = Array.from(fileList).slice(0, remainingSlots);
        if (files.length === 0) {
          setError(`You can upload up to ${maxFiles} images.`);
          return;
        }
        const res = await uploadService.uploadMultipleImages(files);
        onChange([...urls, ...res.data.urls]);
      } else {
        const res = await uploadService.uploadSingleImage(fileList[0]);
        onChange(res.data.url);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Try a smaller image.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (urlToRemove) => {
    // Best-effort cleanup — the form should still work even if the
    // delete call fails, since the reference is removed either way.
    uploadService.deleteUploadedImage(urlToRemove).catch(() => {});

    if (multiple) {
      onChange(urls.filter((u) => u !== urlToRemove));
    } else {
      onChange("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {urls.map((url) => (
          <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-950/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {(multiple ? urls.length < maxFiles : urls.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-ink-500 hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span className="text-[10px]">Upload</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {error && <p className="mt-2 text-xs text-danger-500">{error}</p>}
      {!error && (
        <p className="mt-2 text-xs text-ink-500">
          {multiple ? `Up to ${maxFiles} images, ` : ""}JPEG/PNG/WEBP/GIF, max 5MB each.
        </p>
      )}
    </div>
  );
};

export default ImageUpload;