import { useState } from "react";
import type { CarFormData } from "../../types/Cars";
import { uploadImages } from "../../services/carService";
import "./Step5Images.css";

interface Props {
  onNext: (data: Partial<CarFormData>) => void;
  onBack: () => void;
  defaultValues: CarFormData;
  carId: number;
}

export default function Step5Images({
  onNext,
  onBack,
  defaultValues,
  carId,
}: Props) {
  const [images, setImages] = useState<File[]>(defaultValues.images || []);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      setImages(Array.from(files));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (images.length < 5) {
      alert("Please upload at least 5 images");
      return;
    }

    setUploading(true);
    try {
      const data = await uploadImages(carId, images);
      onNext({ images });
      console.log("✅ Images uploaded successfully:", data);
    } catch (error: any) {
      console.error("❌ Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <p className="text-sm text-gray-600 mb-4">
        Use CTRL key to multi-select images
      </p>
      <label className="block mb-2 font-semibold">Upload Images (min 5)</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files)}
        className="w-full border p-2 rounded mb-4"
      />
      {images.length > 0 && (
        <div className="image-preview-container">
          {images.map((file, idx) => (
            <div key={idx} className="image-thumb-wrapper">
              <img
                src={URL.createObjectURL(file)}
                alt={`preview-${idx}`}
                className="image-thumb"
                onLoad={(e) => {
                  console.log(
                    `Image ${idx} size: ${e.currentTarget.width}x${e.currentTarget.height}px`
                  );
                }}
              />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => handleRemoveImage(idx)}
                aria-label={`Remove image ${idx + 1}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          disabled={uploading}
        >
          ← Back
        </button>
        &nbsp;&nbsp;&nbsp;
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Next Step →"}
        </button>
      </div>
    </div>
  );
}
