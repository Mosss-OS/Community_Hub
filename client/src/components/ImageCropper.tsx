import { useState, useEffect, useRef } from "react";
import { HiCrop, HiRotateClockwise, HiZoomIn, HiCheck, HiX } from "react-icons/hi";

interface ImageCropperProps {
  image: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ image, onCrop, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = 300;
      canvas.width = size;
      canvas.height = size;

      ctx?.clearRect(0, 0, size, size);
      ctx?.save();
      ctx?.translate(size / 2, size / 2);
      ctx?.rotate((rotation * Math.PI) / 180);
      ctx?.scale(scale, scale);
      ctx?.drawImage(img, -size / 2, -size / 2, size, size);
      ctx?.restore();

      onCrop(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.src = image;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl max-w-lg w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Crop Profile Photo</h3>
        
        <div className="flex justify-center mb-4 overflow-hidden rounded-lg">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Zoom</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Rotation</label>
            <input
              type="range"
              min="0"
              max="360"
              step="90"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 border rounded-lg">
            Cancel
          </button>
          <button onClick={handleCrop} className="flex-1 py-2 bg-primary text-white rounded-lg">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}