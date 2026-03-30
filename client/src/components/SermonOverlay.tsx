import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Type, Image, MessageSquare, Settings, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export type OverlayType = "text" | "image" | "announcement" | "lyrics";

export interface OverlayContent {
  id: string;
  type: OverlayType;
  content: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  position?: "top" | "center" | "bottom";
  duration?: number;
}

interface SermonOverlayProps {
  isLive?: boolean;
  onClose?: () => void;
}

export function SermonOverlayControls({ isLive = false, onClose }: SermonOverlayProps) {
  const [overlays, setOverlays] = useState<OverlayContent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(isLive);
  const [showControls, setShowControls] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [advanceTime, setAdvanceTime] = useState(10);

  const addOverlay = (type: OverlayType) => {
    const newOverlay: OverlayContent = {
      id: Date.now().toString(),
      type,
      content: type === "text" ? "Enter your text here" : type === "announcement" ? "Important Announcement" : "",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      textColor: "#ffffff",
      fontSize: type === "lyrics" ? 24 : 32,
      position: "center",
    };
    setOverlays([...overlays, newOverlay]);
    setCurrentIndex(overlays.length);
  };

  const removeOverlay = (id: string) => {
    setOverlays(overlays.filter(o => o.id !== id));
    if (currentIndex >= overlays.length - 1) setCurrentIndex(Math.max(0, overlays.length - 2));
  };

  const updateOverlay = (id: string, updates: Partial<OverlayContent>) => {
    setOverlays(overlays.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const nextSlide = () => setCurrentIndex((currentIndex + 1) % overlays.length);
  const prevSlide = () => setCurrentIndex((currentIndex - 1 + overlays.length) % overlays.length);

  useEffect(() => {
    if (isPlaying && autoAdvance && overlays.length > 1) {
      const timer = setInterval(nextSlide, advanceTime * 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, autoAdvance, advanceTime, overlays.length]);

  const currentOverlay = overlays[currentIndex];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {currentOverlay && (
        <div 
          className={`absolute inset-x-0 flex items-${currentOverlay.position === "top" ? "start" : currentOverlay.position === "bottom" ? "end" : "center"} justify-center p-8 pointer-events-auto`}
          style={{ backgroundColor: currentOverlay.backgroundColor }}
        >
          <div className="max-w-4xl w-full text-center">
            {currentOverlay.type === "text" && (
              <p style={{ color: currentOverlay.textColor, fontSize: `${currentOverlay.fontSize}px` }}>
                {currentOverlay.content}
              </p>
            )}
            {currentOverlay.type === "image" && currentOverlay.imageUrl && (
              <img src={currentOverlay.imageUrl} alt="Slide" className="max-h-[70vh] mx-auto rounded-lg" />
            )}
            {currentOverlay.type === "announcement" && (
              <div>
                <h2 style={{ color: currentOverlay.textColor, fontSize: `${currentOverlay.fontSize}px` }} className="font-bold mb-4">
                  {currentOverlay.content}
                </h2>
              </div>
            )}
            {currentOverlay.type === "lyrics" && (
              <pre style={{ color: currentOverlay.textColor, fontSize: `${currentOverlay.fontSize}px` }} className="whitespace-pre-wrap font-sans">
                {currentOverlay.content}
              </pre>
            )}
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 rounded-full px-4 py-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={prevSlide} disabled={overlays.length <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-white text-sm min-w-[60px] text-center">
            {overlays.length > 0 ? `${currentIndex + 1}/${overlays.length}` : "0/0"}
          </span>
          <Button variant="ghost" size="icon" onClick={nextSlide} disabled={overlays.length <= 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-white/30 mx-2" />
          <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "⏸" : "▶"}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowControls(false)}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          {onClose && <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>}
        </div>
      )}

      {!showControls && (
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute bottom-4 right-4 rounded-full"
          onClick={() => setShowControls(true)}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      )}

      {showControls && (
        <div className="absolute top-4 right-4 bg-black/90 rounded-lg p-4 w-80 pointer-events-auto max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Overlay Controls</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowControls(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Tabs defaultValue="slides">
            <TabsList className="w-full">
              <TabsTrigger value="slides" className="flex-1">Slides</TabsTrigger>
              <TabsTrigger value="add" className="flex-1">Add</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="slides" className="space-y-2 mt-2">
              {overlays.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No slides added</p>
              ) : (
                overlays.map((overlay, idx) => (
                  <div key={overlay.id} className={`p-2 rounded ${idx === currentIndex ? 'bg-blue-600' : 'bg-gray-700'} flex items-center gap-2`}>
                    <span className="text-white text-sm flex-1 truncate">{overlay.type}: {overlay.content.slice(0, 20)}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentIndex(idx)}>
                      {idx === currentIndex ? "▶" : ""}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => removeOverlay(overlay.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="add" className="space-y-3 mt-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => addOverlay("text")}>
                <Type className="w-4 h-4 mr-2" /> Add Text
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addOverlay("image")}>
                <Image className="w-4 h-4 mr-2" /> Add Image
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addOverlay("announcement")}>
                <MessageSquare className="w-4 h-4 mr-2" /> Add Announcement
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addOverlay("lyrics")}>
                <Type className="w-4 h-4 mr-2" /> Add Lyrics
              </Button>
            </TabsContent>

            <TabsContent value="settings" className="space-y-3 mt-2">
              {currentOverlay && (
                <>
                  <div>
                    <Label className="text-gray-300">Content</Label>
                    {currentOverlay.type === "lyrics" || currentOverlay.type === "text" ? (
                      <Textarea 
                        value={currentOverlay.content} 
                        onChange={(e) => updateOverlay(currentOverlay.id, { content: e.target.value })}
                        className="mt-1 bg-gray-800 text-white"
                        rows={4}
                      />
                    ) : (
                      <Input 
                        value={currentOverlay.content} 
                        onChange={(e) => updateOverlay(currentOverlay.id, { content: e.target.value })}
                        className="mt-1 bg-gray-800 text-white"
                      />
                    )}
                  </div>
                  {currentOverlay.type === "image" && (
                    <div>
                      <Label className="text-gray-300">Image URL</Label>
                      <Input 
                        value={currentOverlay.imageUrl || ""} 
                        onChange={(e) => updateOverlay(currentOverlay.id, { imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="mt-1 bg-gray-800 text-white"
                      />
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-300">Font Size: {currentOverlay.fontSize}px</Label>
                    <Slider 
                      value={[currentOverlay.fontSize || 24]} 
                      min={12} max={72} 
                      onValueChange={(v) => updateOverlay(currentOverlay.id, { fontSize: v[0] })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Position</Label>
                    <Select value={currentOverlay.position} onValueChange={(v: "top" | "center" | "bottom") => updateOverlay(currentOverlay.id, { position: v })}>
                      <SelectTrigger className="mt-1 bg-gray-800 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-gray-300">Background</Label>
                      <Input 
                        type="color"
                        value={currentOverlay.backgroundColor?.replace(/rgba?\([^)]+\)/, '#000000') || '#000000'}
                        onChange={(e) => updateOverlay(currentOverlay.id, { backgroundColor: `${e.target.value}cc` })}
                        className="mt-1 h-10"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-gray-300">Text Color</Label>
                      <Input 
                        type="color"
                        value={currentOverlay.textColor || '#ffffff'}
                        onChange={(e) => updateOverlay(currentOverlay.id, { textColor: e.target.value })}
                        className="mt-1 h-10"
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Auto-advance</Label>
                  <input type="checkbox" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} />
                </div>
                {autoAdvance && (
                  <div className="mt-2">
                    <Label className="text-gray-300">Seconds: {advanceTime}s</Label>
                    <Slider value={[advanceTime]} min={3} max={60} onValueChange={(v) => setAdvanceTime(v[0])} className="mt-1" />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
