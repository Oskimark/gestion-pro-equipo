"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    RotateCw,
    RotateCcw,
    Crop,
    Check,
    X,
    ZoomIn,
    ZoomOut,
    Move
} from "lucide-react";

interface ImageEditorProps {
    imageUrl: string;
    onSave: (editedBlob: Blob) => void;
    onCancel: () => void;
    aspectRatio?: number; // Optional aspect ratio (width / height)
}

export default function ImageEditor({ imageUrl, onSave, onCancel, aspectRatio }: ImageEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [rotation, setRotation] = useState(0); // in degrees
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [activeHandle, setActiveHandle] = useState<string | null>(null);

    // Load image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            setImage(img);
            // Initialize crop rect to 80% of image size
            const size = Math.min(img.width, img.height) * 0.8;
            let w = size;
            let h = size;
            if (aspectRatio) {
                if (aspectRatio > 1) {
                    h = w / aspectRatio;
                } else {
                    w = h * aspectRatio;
                }
            }
            setCropRect({
                x: (img.width - w) / 2,
                y: (img.height - h) / 2,
                width: w,
                height: h
            });
        };
    }, [imageUrl, aspectRatio]);

    const draw = useCallback(() => {
        if (!canvasRef.current || !image) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!container) return;

        // Set canvas internal size to match container
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();

        // Translate to center for rotation and zoom
        ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        // Draw image centered
        const drawX = -image.width / 2;
        const drawY = -image.height / 2;
        ctx.drawImage(image, drawX, drawY);

        ctx.restore();

        // Draw overlay and crop area
        drawOverlay(ctx, canvas, container);
    }, [image, rotation, zoom, offset, cropRect]);

    const drawOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, container: HTMLDivElement) => {
        // Simple translucent overlay with clear crop area
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

        // Calculate crop rect in screen coordinates
        const screenCrop = getScreenCropRect(canvas);

        // Draw 4 rectangles around crop area
        ctx.fillRect(0, 0, canvas.width, screenCrop.y); // top
        ctx.fillRect(0, screenCrop.y + screenCrop.height, canvas.width, canvas.height - (screenCrop.y + screenCrop.height)); // bottom
        ctx.fillRect(0, screenCrop.y, screenCrop.x, screenCrop.height); // left
        ctx.fillRect(screenCrop.x + screenCrop.width, screenCrop.y, canvas.width - (screenCrop.x + screenCrop.width), screenCrop.height); // right

        // Draw selection border
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenCrop.x, screenCrop.y, screenCrop.width, screenCrop.height);

        // Draw handles
        const handleSize = 10;
        ctx.fillStyle = "white";
        // Corners
        ctx.fillRect(screenCrop.x - handleSize / 2, screenCrop.y - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(screenCrop.x + screenCrop.width - handleSize / 2, screenCrop.y - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(screenCrop.x - handleSize / 2, screenCrop.y + screenCrop.height - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(screenCrop.x + screenCrop.width - handleSize / 2, screenCrop.y + screenCrop.height - handleSize / 2, handleSize, handleSize);

        ctx.restore();
    };

    const getScreenCropRect = (canvas: HTMLCanvasElement) => {
        // Convert image-space crop rect back to screen-space
        // This is complex because of rotation. For simplicity in this v1, 
        // let's keep the crop rect in SCREEN space and then map back to IMAGE space for final export.
        return cropRect;
    };

    useEffect(() => {
        draw();
    }, [draw]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if hitting a handle
        const handleSize = 20;
        const corners = [
            { id: 'tl', x: cropRect.x, y: cropRect.y },
            { id: 'tr', x: cropRect.x + cropRect.width, y: cropRect.y },
            { id: 'bl', x: cropRect.x, y: cropRect.y + cropRect.height },
            { id: 'br', x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
        ];

        const hitHandle = corners.find(c => Math.abs(c.x - x) < handleSize && Math.abs(c.y - y) < handleSize);

        if (hitHandle) {
            setActiveHandle(hitHandle.id);
        } else if (x > cropRect.x && x < cropRect.x + cropRect.width && y > cropRect.y && y < cropRect.y + cropRect.height) {
            setActiveHandle('move');
        } else {
            setActiveHandle('pan');
        }

        setIsDragging(true);
        setDragStart({ x, y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - dragStart.x;
        const dy = y - dragStart.y;

        if (activeHandle === 'pan') {
            setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        } else if (activeHandle === 'move') {
            setCropRect(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        } else if (activeHandle) {
            // Resize logic
            const newRect = { ...cropRect };
            if (activeHandle.includes('t')) { newRect.y += dy; newRect.height -= dy; }
            if (activeHandle.includes('b')) { newRect.height += dy; }
            if (activeHandle.includes('l')) { newRect.x += dx; newRect.width -= dx; }
            if (activeHandle.includes('r')) { newRect.width += dx; }

            // Apply aspect ratio if needed
            if (aspectRatio) {
                if (activeHandle === 'br' || activeHandle === 'tr' || activeHandle === 'bl' || activeHandle === 'tl') {
                    newRect.height = newRect.width / aspectRatio;
                }
            }

            setCropRect(newRect);
        }

        setDragStart({ x, y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setActiveHandle(null);
    };

    const handleRotate = (dir: number) => {
        setRotation(prev => (prev + dir + 360) % 360);
    };

    const handleSave = () => {
        if (!canvasRef.current || !image) return;

        // Create an offscreen canvas for higher quality export
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = cropRect.width / zoom;
        exportCanvas.height = cropRect.height / zoom;
        const exCtx = exportCanvas.getContext("2d");
        if (!exCtx) return;

        exCtx.save();
        // Translate to match the crop area relative to image
        // This is tricky, let's use the screen-to-image mapping
        // Simplest: use the current canvas and draw just the crop area

        // Actually, easier way: 
        // 1. Clear offscreen canvas
        // 2. Mirror the transformations of the main canvas
        // 3. Move the origin based on cropRect

        exCtx.translate(-cropRect.x, -cropRect.y);

        const canvas = canvasRef.current;
        exCtx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
        exCtx.rotate((rotation * Math.PI) / 180);
        exCtx.scale(zoom, zoom);
        exCtx.drawImage(image, -image.width / 2, -image.height / 2);

        exportCanvas.toBlob((blob) => {
            if (blob) onSave(blob);
        }, "image/jpeg", 0.9);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            {/* Toolbar Top */}
            <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/40">
                <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                    <X className="h-6 w-6" />
                </button>
                <div className="flex gap-4">
                    <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-2 hover:bg-white/10 rounded-full text-white"><ZoomOut className="h-5 w-5" /></button>
                    <span className="flex items-center text-[10px] font-black uppercase text-white/50">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="p-2 hover:bg-white/10 rounded-full text-white"><ZoomIn className="h-5 w-5" /></button>
                </div>
                <button onClick={handleSave} className="px-6 py-2 bg-secondary text-primary rounded-full font-black uppercase tracking-widest italic text-xs hover:scale-105 transition-all">
                    Guardar
                </button>
            </div>

            {/* Canvas Area */}
            <div ref={containerRef} className="flex-1 relative cursor-crosshair overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}>
                <canvas ref={canvasRef} className="absolute inset-0" />
            </div>

            {/* Toolbar Bottom */}
            <div className="p-6 flex items-center justify-center gap-8 bg-black/40 border-t border-white/10">
                <button onClick={() => handleRotate(-90)} className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors group">
                    <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                        <RotateCcw className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Rotar Izq.</span>
                </button>
                <button onClick={() => handleRotate(90)} className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors group">
                    <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                        <RotateCw className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Rotar Der.</span>
                </button>
                <div className="h-10 w-[1px] bg-white/10 mx-4"></div>
                <div className="flex flex-col items-center gap-2 text-white/40">
                    <div className="p-3">
                        <Move className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Pan & Crop</span>
                </div>
            </div>
        </div>
    );
}
