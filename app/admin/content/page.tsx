"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Save,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Store,
  Loader2,
  GripVertical,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  Video,
  Image as ImageIcon,
  Check,
  X,
  Play,
  ShoppingBag,
  ExternalLink,
  Tag,
  Palette,
  Camera,
  AlertTriangle,
  Link as LinkIcon,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface AdminHeroSlide {
  id: string;
  buttonText: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
  brand?: string;
  title?: string;
  subtitle?: string;
  categoryFilter?: string;
  brandFilter?: string;
  accentColor?: string;
}

export interface AdminReelItem {
  id: string;
  brand?: string;
  title: string;
  subtitle?: string;
  badgeStyle?: "stencil" | "clean" | "graffiti" | "bold";
  image: string;
  videoUrl: string;
  taggedProductId?: string;
  linkUrl?: string;
  linkLabel?: string;
  instagramUrl?: string;
  likes?: string;
  active: boolean;
}

const DEFAULT_HERO_SLIDES: AdminHeroSlide[] = [
  {
    id: "new-arrival-aurora",
    buttonText: "SHOP COLLECTION",
    imageUrl: "/images/figma_hero_banner.png",
    linkUrl: "/shop?category=sunglasses",
    active: true,
  },
  {
    id: "see-beyond",
    buttonText: "SHOP NOW",
    imageUrl: "/images/banner_see_beyond_1785153512408.jpg",
    linkUrl: "/shop?category=sunglasses",
    active: true,
  },
  {
    id: "eyewear-every-you",
    buttonText: "EXPLORE COLLECTION",
    imageUrl: "/images/banner_every_you_1785153527777.jpg",
    linkUrl: "/shop?category=sunglasses",
    active: true,
  },
  {
    id: "theo-eyewear",
    buttonText: "DISCOVER COLLECTION",
    imageUrl: "/images/banner_theo_eyewear_1785153543549.jpg",
    linkUrl: "/shop?brand=theo",
    active: true,
  },
  {
    id: "aurora-polarized",
    buttonText: "EXPLORE POLARIZED",
    imageUrl: "/images/banner_vision_redefined_1785153555788.jpg",
    linkUrl: "/shop?category=sunglasses",
    active: true,
  },
];

const DEFAULT_REEL_ITEMS: AdminReelItem[] = [
  {
    id: "urban-icons",
    title: "URBAN ICONS",
    subtitle: "Built for the ones ahead",
    badgeStyle: "stencil",
    image: "/images/figma/reel_urban_icons.png",
    videoUrl: "/videos/reels/urban_icons.mp4",
    linkUrl: "/shop?category=sunglasses",
    linkLabel: "Shop Urban Icons",
    instagramUrl: "https://www.instagram.com",
    active: true,
  },
  {
    id: "titanium",
    title: "Titanium",
    subtitle: "The Science of Lightness",
    badgeStyle: "clean",
    image: "/images/figma/reel_titanium.png",
    videoUrl: "/videos/reels/titanium.mp4",
    linkUrl: "/shop?category=eyeglasses",
    linkLabel: "Shop Titanium",
    instagramUrl: "https://www.instagram.com",
    active: true,
  },
  {
    id: "streak-drip",
    title: "DRIP",
    subtitle: "Bold street lookbook",
    badgeStyle: "graffiti",
    image: "/images/figma/reel_drip.png",
    videoUrl: "/videos/reels/drip.mp4",
    linkUrl: "/shop?brand=ray-ban",
    linkLabel: "Shop Drip Series",
    active: true,
  },
  {
    id: "flip-ups",
    title: "Flip-ups",
    subtitle: "Seamless clip-on transition",
    badgeStyle: "bold",
    image: "/images/figma/reel_flipups.png",
    videoUrl: "/videos/reels/flipups.mp4",
    linkUrl: "/shop?category=sunglasses",
    linkLabel: "Shop Flip-ups",
    active: true,
  },
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "reels" | "editorial">("hero");

  // Content state
  const [marqueeText, setMarqueeText] = useState(
    "OFFICIAL LUXURY RETAILER FOR CARTIER, MAYBACH, GAST, LINDBERG TITANIUM & ZEISS VISION • COMPLIMENTARY INSURED PAN-INDIA TRANSIT • ESTD. 1969"
  );
  const [heroHeading, setHeroHeading] = useState("Architectural Titanium & Haute Lunetterie");
  const [heroSubheading, setHeroSubheading] = useState(
    "Handcrafted in Japan, Milan, and Paris. Precision Rx optics surfaced with sub-micron German lens technology."
  );
  const [heroSlides, setHeroSlides] = useState<AdminHeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [reels, setReels] = useState<AdminReelItem[]>(DEFAULT_REEL_ITEMS);

  // Loading & Saving states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Drag & drop state
  const [draggedSlideIdx, setDraggedSlideIdx] = useState<number | null>(null);
  const [dragOverSlideIdx, setDragOverSlideIdx] = useState<number | null>(null);
  const [draggedReelIdx, setDraggedReelIdx] = useState<number | null>(null);
  const [dragOverReelIdx, setDragOverReelIdx] = useState<number | null>(null);

  // Modal editor states
  const [editingSlide, setEditingSlide] = useState<AdminHeroSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [isNewSlide, setIsNewSlide] = useState(false);

  const [editingReel, setEditingReel] = useState<AdminReelItem | null>(null);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [isNewReel, setIsNewReel] = useState(false);

  // Uploading & Thumbnail Extraction states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [isExtractingThumbnail, setIsExtractingThumbnail] = useState(false);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "slide" | "reel";
    item: AdminHeroSlide | AdminReelItem;
    title: string;
    imageUrl?: string;
  } | null>(null);
  const [deleteFromStorage, setDeleteFromStorage] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load content settings from API
  useEffect(() => {
    fetch("/api/admin/settings?key=content")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.value) {
          if (data.value.marqueeText) setMarqueeText(data.value.marqueeText);
          if (data.value.heroHeading) setHeroHeading(data.value.heroHeading);
          if (data.value.heroSubheading) setHeroSubheading(data.value.heroSubheading);
          if (Array.isArray(data.value.heroSlides) && data.value.heroSlides.length > 0) {
            setHeroSlides(data.value.heroSlides);
          }
          if (Array.isArray(data.value.reels) && data.value.reels.length > 0) {
            setReels(data.value.reels);
          }
        }
      })
      .catch((e) => console.warn("Failed to load content settings:", e))
      .finally(() => setLoading(false));
  }, []);

  // Save all settings to Supabase
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        marqueeText,
        heroHeading,
        heroSubheading,
        heroSlides,
        reels,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "content",
          value: payload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Content published to storefront successfully!");
      } else {
        toast.error("Failed to publish content settings", {
          description: data.error,
        });
      }
    } catch (e: any) {
      toast.error("Network error while publishing", {
        description: e.message,
      });
    } finally {
      setSaving(false);
    }
  };

  // Auto-save helper to sync updates immediately to database
  const autoPersistContent = async (
    customSlides?: AdminHeroSlide[],
    customReels?: AdminReelItem[]
  ) => {
    try {
      const payload = {
        marqueeText,
        heroHeading,
        heroSubheading,
        heroSlides: customSlides ?? heroSlides,
        reels: customReels ?? reels,
        updatedAt: new Date().toISOString(),
      };

      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "content",
          value: payload,
        }),
      });
    } catch (e) {
      console.warn("Auto-persist background error:", e);
    }
  };

  // -------------------------------------------------------------
  // SLIDES REORDER & ACTIONS
  // -------------------------------------------------------------
  const moveSlide = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= heroSlides.length) return;
    const updated = [...heroSlides];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setHeroSlides(updated);
    autoPersistContent(updated, reels);
  };

  const handleOpenAddSlide = () => {
    const newSlide: AdminHeroSlide = {
      id: `slide-${Date.now()}`,
      buttonText: "SHOP NOW",
      imageUrl: "",
      linkUrl: "/shop",
      active: true,
    };
    setEditingSlide(newSlide);
    setIsNewSlide(true);
    setIsSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: AdminHeroSlide) => {
    setEditingSlide({
      ...slide,
      buttonText: slide.buttonText || "SHOP NOW",
      linkUrl: slide.linkUrl || "/shop",
    });
    setIsNewSlide(false);
    setIsSlideModalOpen(true);
  };

  const handleSaveSlideModal = () => {
    if (!editingSlide) return;
    if (!editingSlide.imageUrl) {
      toast.error("Please upload or enter a banner image URL");
      return;
    }

    let updatedSlides: AdminHeroSlide[];
    if (isNewSlide) {
      updatedSlides = [...heroSlides, editingSlide];
      setHeroSlides(updatedSlides);
      toast.success("New banner slide added & published");
    } else {
      updatedSlides = heroSlides.map((s) =>
        s.id === editingSlide.id ? editingSlide : s
      );
      setHeroSlides(updatedSlides);
      toast.success("Banner slide updated & published");
    }
    autoPersistContent(updatedSlides, reels);
    setIsSlideModalOpen(false);
  };

  const requestDeleteSlide = (slide: AdminHeroSlide) => {
    setDeleteTarget({
      type: "slide",
      item: slide,
      title: slide.buttonText ? `Banner (${slide.buttonText})` : "Hero Banner Slide",
      imageUrl: slide.imageUrl,
    });
    setDeleteFromStorage(true);
    setIsDeleteModalOpen(true);
  };

  const handleToggleSlideActive = (id: string) => {
    const updated = heroSlides.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    setHeroSlides(updated);
    autoPersistContent(updated, reels);
  };

  // -------------------------------------------------------------
  // VIDEO FRAME EXTRACTION (HTML5 CANVAS -> R2)
  // -------------------------------------------------------------
  const captureVideoFrame = (videoUrl: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (res: Blob | null) => {
        if (!settled) {
          settled = true;
          resolve(res);
        }
      };

      try {
        const video = document.createElement("video");
        if (!videoUrl.startsWith("blob:")) {
          video.crossOrigin = "anonymous";
        }
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";
        video.src = videoUrl;

        const timeout = setTimeout(() => {
          finish(null);
        }, 8000);

        const takeSnapshot = () => {
          try {
            const canvas = document.createElement("canvas");
            const w = video.videoWidth || 720;
            const h = video.videoHeight || 1280;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              clearTimeout(timeout);
              finish(null);
              return;
            }
            ctx.drawImage(video, 0, 0, w, h);
            canvas.toBlob(
              (blob) => {
                clearTimeout(timeout);
                finish(blob);
              },
              "image/jpeg",
              0.92
            );
          } catch (err) {
            console.warn("Canvas capture error:", err);
            clearTimeout(timeout);
            finish(null);
          }
        };

        video.onloadedmetadata = () => {
          const seekTime = Math.min(0.5, (video.duration || 1) / 2);
          video.currentTime = seekTime > 0 ? seekTime : 0.1;
        };

        video.onseeked = () => {
          requestAnimationFrame(() => {
            takeSnapshot();
          });
        };

        video.onerror = () => {
          clearTimeout(timeout);
          finish(null);
        };

        video.load();
      } catch {
        finish(null);
      }
    });
  };

  const handleAutoFetchThumbnail = async (videoUrlOverride?: string): Promise<string | null> => {
    const vUrl = videoUrlOverride || editingReel?.videoUrl;
    if (!vUrl) {
      toast.error("Please enter or upload a video first to extract a thumbnail");
      return null;
    }

    setIsExtractingThumbnail(true);
    try {
      // 1. Direct capture
      let blob = await captureVideoFrame(vUrl);

      // 2. If direct capture failed (likely CORS on remote bucket), retry via proxy
      if (!blob && (vUrl.startsWith("http://") || vUrl.startsWith("https://") || vUrl.startsWith("/"))) {
        const proxyUrl = `/api/upload?proxyUrl=${encodeURIComponent(vUrl)}`;
        blob = await captureVideoFrame(proxyUrl);
      }

      if (!blob) {
        toast.error("Could not extract frame automatically. You can upload a poster image manually.");
        return null;
      }

      const file = new File([blob], `thumb_${Date.now()}.jpg`, { type: "image/jpeg" });
      let uploadedUrl: string | null = null;
      await handleUploadFile(
        file,
        "reels",
        (url) => {
          uploadedUrl = url;
          if (editingReel) {
            setEditingReel((prev) => (prev ? { ...prev, image: url } : null));
          }
        },
        setIsUploadingPoster
      );

      if (uploadedUrl) {
        toast.success("Thumbnail auto-extracted and uploaded to Cloudflare R2!");
      }
      return uploadedUrl;
    } catch (err) {
      console.error("Auto-fetch thumbnail error:", err);
      toast.error("Failed to extract video thumbnail");
      return null;
    } finally {
      setIsExtractingThumbnail(false);
    }
  };

  // -------------------------------------------------------------
  // REELS REORDER & ACTIONS
  // -------------------------------------------------------------
  const moveReel = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= reels.length) return;
    const updated = [...reels];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setReels(updated);
    autoPersistContent(heroSlides, updated);
  };

  const handleOpenAddReel = () => {
    const newReel: AdminReelItem = {
      id: `reel-${Date.now()}`,
      title: "",
      subtitle: "",
      badgeStyle: "clean",
      image: "",
      videoUrl: "",
      linkUrl: "",
      linkLabel: "Shop Look",
      instagramUrl: "",
      active: true,
    };
    setEditingReel(newReel);
    setIsNewReel(true);
    setIsReelModalOpen(true);
  };

  const handleOpenEditReel = (reel: AdminReelItem) => {
    setEditingReel({ ...reel });
    setIsNewReel(false);
    setIsReelModalOpen(true);
  };

  const handleSaveReelModal = async () => {
    if (!editingReel) return;

    let finalReel = { ...editingReel };

    // Auto-extract thumbnail if missing or placeholder
    if ((!finalReel.image || finalReel.image.includes("figma") || finalReel.image === "") && finalReel.videoUrl) {
      const autoThumb = await handleAutoFetchThumbnail(finalReel.videoUrl);
      if (autoThumb) {
        finalReel.image = autoThumb;
      }
    }

    let nextReels: AdminReelItem[];
    if (isNewReel) {
      nextReels = [...reels, finalReel];
      setReels(nextReels);
      toast.success("New reel added & published");
    } else {
      nextReels = reels.map((r) => (r.id === finalReel.id ? finalReel : r));
      setReels(nextReels);
      toast.success("Reel updated & published");
    }
    autoPersistContent(heroSlides, nextReels);
    setIsReelModalOpen(false);
  };

  const requestDeleteReel = (reel: AdminReelItem) => {
    setDeleteTarget({
      type: "reel",
      item: reel,
      title: reel.title || "Video Reel",
      imageUrl: reel.image,
    });
    setDeleteFromStorage(true);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    if (deleteFromStorage) {
      try {
        if (deleteTarget.type === "slide") {
          const slide = deleteTarget.item as AdminHeroSlide;
          if (slide.imageUrl) {
            await fetch(`/api/upload?url=${encodeURIComponent(slide.imageUrl)}`, { method: "DELETE" });
          }
        } else if (deleteTarget.type === "reel") {
          const reel = deleteTarget.item as AdminReelItem;
          if (reel.videoUrl) {
            await fetch(`/api/upload?url=${encodeURIComponent(reel.videoUrl)}`, { method: "DELETE" });
          }
          if (reel.image) {
            await fetch(`/api/upload?url=${encodeURIComponent(reel.image)}`, { method: "DELETE" });
          }
        }
      } catch (e) {
        console.warn("Storage delete non-blocking error:", e);
      }
    }

    if (deleteTarget.type === "slide") {
      const updatedSlides = heroSlides.filter((s) => s.id !== deleteTarget.item.id);
      setHeroSlides(updatedSlides);
      autoPersistContent(updatedSlides, reels);
      toast.success(deleteFromStorage ? "Slide and storage assets removed" : "Slide removed from queue");
    } else {
      const updatedReels = reels.filter((r) => r.id !== deleteTarget.item.id);
      setReels(updatedReels);
      autoPersistContent(heroSlides, updatedReels);
      toast.success(deleteFromStorage ? "Reel and storage assets removed" : "Reel removed from lookbooks");
    }

    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleToggleReelActive = (id: string) => {
    const updated = reels.map((r) =>
      r.id === id ? { ...r, active: !r.active } : r
    );
    setReels(updated);
    autoPersistContent(heroSlides, updated);
  };

  // -------------------------------------------------------------
  // R2 FILE UPLOAD HANDLERS
  // -------------------------------------------------------------
  const handleUploadFile = async (
    file: File,
    folder: "banners" | "reels",
    onSuccess: (url: string) => void,
    setLoadingState: (loading: boolean) => void
  ) => {
    setLoadingState(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onSuccess(data.url);
        toast.success(`Uploaded to Cloudflare R2 (${folder})`, {
          description: file.name,
        });
      } else {
        toast.error("Upload failed", { description: data.error });
      }
    } catch (e: any) {
      toast.error("Upload error", { description: e.message });
    } finally {
      setLoadingState(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#C86A28] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCCF]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2A1E17] font-serif">
            Storefront Editorial &amp; Media Management
          </h1>
          <p className="text-xs text-stone-500">
            Customize homepage hero sliders, sequential video lookbooks (Lenskart style), and ticker marquees
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white shadow-xs cursor-pointer"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          <span>{saving ? "Publishing..." : "Publish to Storefront"}</span>
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8DCCF] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "hero"
              ? "bg-[#2A1E17] text-white shadow-xs"
              : "text-stone-600 hover:text-[#2A1E17] hover:bg-[#FAF3EB]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hero Banners ({heroSlides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reels")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "reels"
              ? "bg-[#2A1E17] text-white shadow-xs"
              : "text-stone-600 hover:text-[#2A1E17] hover:bg-[#FAF3EB]"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video Reels &amp; Lookbooks ({reels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("editorial")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "editorial"
              ? "bg-[#2A1E17] text-white shadow-xs"
              : "text-stone-600 hover:text-[#2A1E17] hover:bg-[#FAF3EB]"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Editorial &amp; Announcement</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HERO BANNERS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "hero" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#2A1E17]">
                Hero Banners Slider Queue
              </h2>
              <p className="text-xs text-stone-500">
                Drag slides or use arrows to change sequence. Active slides auto-rotate on the homepage.
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleOpenAddSlide}
              className="text-xs bg-[#2A1E17] hover:bg-[#3D312A] text-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Banner Slide</span>
            </Button>
          </div>

          {/* Slides List */}
          <div className="space-y-3">
            {heroSlides.map((slide, index) => {
              const isDragging = draggedSlideIdx === index;
              const isOver = dragOverSlideIdx === index;

              return (
                <div
                  key={slide.id}
                  draggable
                  onDragStart={() => setDraggedSlideIdx(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverSlideIdx(index);
                  }}
                  onDragLeave={() => {
                    if (dragOverSlideIdx === index) setDragOverSlideIdx(null);
                  }}
                  onDrop={() => {
                    if (draggedSlideIdx !== null) {
                      moveSlide(draggedSlideIdx, index);
                    }
                    setDraggedSlideIdx(null);
                    setDragOverSlideIdx(null);
                  }}
                  className={`bg-white border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    isDragging
                      ? "opacity-50 border-dashed border-[#C86A28]"
                      : isOver
                      ? "border-[#C86A28] ring-2 ring-[#C86A28]/20 bg-[#FFFBF7]"
                      : "border-[#E8DCCF] hover:border-[#C86A28]/50"
                  }`}
                >
                  {/* Left: Drag Handle + Order Badge + Thumbnail + Details */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className="text-stone-400 hover:text-stone-700 cursor-grab active:cursor-grabbing p-1 shrink-0"
                      title="Drag to reorder slide"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <span className="w-6 h-6 rounded-full bg-[#FAF3EB] text-[#C86A28] text-xs font-bold flex items-center justify-center shrink-0 border border-[#E8DCCF]">
                      {index + 1}
                    </span>

                    {/* Banner Image Preview */}
                    <div className="w-24 h-14 sm:w-32 sm:h-18 rounded-lg bg-[#0E0C0A] overflow-hidden relative border border-[#E8DCCF] shrink-0 flex items-center justify-center">
                      <img
                        src={slide.imageUrl}
                        alt={slide.buttonText || "Hero Banner"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/figma_hero_banner.png";
                        }}
                      />
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#FAF3EB] text-[#C86A28] text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border border-[#E8DCCF]">
                          CTA: {slide.buttonText || "SHOP NOW"}
                        </span>
                        {!slide.active && (
                          <span className="bg-rose-50 text-rose-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-stone-700">
                        <LinkIcon className="w-3.5 h-3.5 text-[#C86A28] shrink-0" />
                        <span className="font-mono text-[11px] text-stone-600 truncate">
                          {slide.linkUrl || "/shop"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Sequence Controls + Toggle Active + Edit + Delete */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Up / Down Reorder Buttons */}
                    <div className="flex items-center border border-[#E8DCCF] rounded-lg overflow-hidden bg-[#FAF7F2]">
                      <button
                        onClick={() => moveSlide(index, index - 1)}
                        disabled={index === 0}
                        title="Move slide up"
                        className="p-1.5 hover:bg-white text-stone-600 hover:text-[#C86A28] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-[1px] h-4 bg-[#E8DCCF]" />
                      <button
                        onClick={() => moveSlide(index, index + 1)}
                        disabled={index === heroSlides.length - 1}
                        title="Move slide down"
                        className="p-1.5 hover:bg-white text-stone-600 hover:text-[#C86A28] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Active Visibility Toggle */}
                    <button
                      onClick={() => handleToggleSlideActive(slide.id)}
                      title={slide.active ? "Slide is active (click to hide)" : "Slide is hidden (click to show)"}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        slide.active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200"
                      }`}
                    >
                      {slide.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEditSlide(slide)}
                      title="Edit slide"
                      className="p-1.5 rounded-lg bg-white border border-[#E8DCCF] text-stone-600 hover:text-[#C86A28] hover:border-[#C86A28] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => requestDeleteSlide(slide)}
                      title="Delete slide"
                      className="p-1.5 rounded-lg bg-white border border-[#E8DCCF] text-stone-600 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VIDEO REELS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "reels" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#2A1E17]">
                Video Reels Lookbook Queue (Lenskart Sequential Auto-Play)
              </h2>
              <p className="text-xs text-stone-500">
                The order below dictates the sequential preview order on the homepage. Videos auto-stream from R2.
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleOpenAddReel}
              className="text-xs bg-[#2A1E17] hover:bg-[#3D312A] text-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Lookbook Reel</span>
            </Button>
          </div>

          {/* Reels Grid / Sequence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reels.map((reel, index) => {
              const isDragging = draggedReelIdx === index;
              const isOver = dragOverReelIdx === index;

              return (
                <div
                  key={reel.id}
                  draggable
                  onDragStart={() => setDraggedReelIdx(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverReelIdx(index);
                  }}
                  onDragLeave={() => {
                    if (dragOverReelIdx === index) setDragOverReelIdx(null);
                  }}
                  onDrop={() => {
                    if (draggedReelIdx !== null) {
                      moveReel(draggedReelIdx, index);
                    }
                    setDraggedReelIdx(null);
                    setDragOverReelIdx(null);
                  }}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between transition-all ${
                    isDragging
                      ? "opacity-50 border-dashed border-[#C86A28]"
                      : isOver
                      ? "border-[#C86A28] ring-2 ring-[#C86A28]/20 bg-[#FFFBF7]"
                      : "border-[#E8DCCF] hover:border-[#C86A28]/50"
                  }`}
                >
                  {/* Top: Card Header & Preview */}
                  <div>
                    {/* Header Bar */}
                    <div className="p-3 bg-[#FAF7F2] border-b border-[#E8DCCF] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="text-stone-400 hover:text-stone-700 cursor-grab active:cursor-grabbing"
                          title="Drag to reorder reel"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                        <span className="w-5 h-5 rounded-full bg-[#C86A28] text-white text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-[#2A1E17] truncate max-w-[130px]">
                          {reel.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveReel(index, index - 1)}
                          disabled={index === 0}
                          title="Move reel earlier"
                          className="p-1 hover:bg-white text-stone-600 disabled:opacity-20 rounded cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveReel(index, index + 1)}
                          disabled={index === reels.length - 1}
                          title="Move reel later"
                          className="p-1 hover:bg-white text-stone-600 disabled:opacity-20 rounded cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Vertical 9:16 Video / Poster Container */}
                    <div className="relative aspect-[9/16] bg-black overflow-hidden group">
                      <video
                        src={reel.videoUrl}
                        poster={reel.image}
                        muted
                        playsInline
                        loop
                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                        onMouseLeave={(e) => {
                          const v = e.target as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                        className="w-full h-full object-cover"
                      />

                      {/* Top Overlay Badge */}
                      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{reel.badgeStyle || "clean"}</span>
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-3 pt-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                        <h4 className="font-bold text-xs uppercase tracking-wide">
                          {reel.title}
                        </h4>
                        {reel.subtitle && (
                          <p className="text-[10px] text-stone-300 line-clamp-1">
                            {reel.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Destination Link / Action Preview */}
                    <div className="p-3 bg-[#FAF7F2] border-t border-[#E8DCCF] space-y-1.5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">
                        Destination Page / CTA
                      </span>
                      <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-[#E8DCCF]">
                        <div className="min-w-0 flex-1 flex items-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5 text-[#C86A28] shrink-0" />
                          <span className="text-[11px] font-mono text-[#2A1E17] truncate">
                            {reel.linkUrl || "/shop"}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86A28] bg-[#FAF3EB] px-2 py-0.5 rounded shrink-0">
                          {reel.linkLabel || "Shop Look"}
                        </span>
                      </div>

                      {reel.instagramUrl && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-600 bg-white px-2 py-1 rounded-lg border border-[#E8DCCF]">
                          <div className="w-4 h-4 rounded bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shrink-0">
                            <Instagram className="w-2.5 h-2.5" />
                          </div>
                          <span className="truncate font-mono text-[10px] text-stone-600">{reel.instagramUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-2.5 border-t border-[#E8DCCF] flex items-center justify-between bg-white">
                    <button
                      onClick={() => handleToggleReelActive(reel.id)}
                      title={reel.active ? "Reel is active" : "Reel is hidden"}
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1 cursor-pointer ${
                        reel.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-stone-100 text-stone-400"
                      }`}
                    >
                      {reel.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{reel.active ? "Active" : "Hidden"}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditReel(reel)}
                        title="Edit reel"
                        className="p-1 rounded text-stone-600 hover:text-[#C86A28] hover:bg-[#FAF3EB] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => requestDeleteReel(reel)}
                        title="Delete reel"
                        className="p-1 rounded text-stone-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EDITORIAL & MARQUEE ANNOUNCEMENT */}
      {/* ========================================================================= */}
      {activeTab === "editorial" && (
        <div className="space-y-5 max-w-3xl bg-white border border-[#E8DCCF] p-5 sm:p-6 rounded-2xl shadow-2xs">
          <div>
            <h2 className="text-sm font-bold text-[#2A1E17] mb-1">
              Top Announcement Marquee Bar
            </h2>
            <p className="text-xs text-stone-500 mb-2">
              Continuous scrolling banner displayed at the very top of the website.
            </p>
            <textarea
              rows={3}
              value={marqueeText}
              onChange={(e) => setMarqueeText(e.target.value)}
              className="w-full p-3 bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#C86A28]"
            />
          </div>

          <div className="border-t border-[#E8DCCF] pt-4 space-y-4">
            <h2 className="text-sm font-bold text-[#2A1E17]">
              Editorial Header Typography
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Main Hero Editorial Heading
              </label>
              <input
                type="text"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C86A28]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Subheading / Brand Narrative
              </label>
              <textarea
                rows={2}
                value={heroSubheading}
                onChange={(e) => setHeroSubheading(e.target.value)}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C86A28]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE ADD / EDIT MODAL */}
      {/* ========================================================================= */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E8DCCF] shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#E8DCCF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#C86A28]" />
                <h3 className="font-serif font-bold text-sm text-[#2A1E17]">
                  {isNewSlide ? "Add New Hero Banner" : "Edit Hero Banner"}
                </h3>
              </div>
              <button
                onClick={() => setIsSlideModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Image Upload to R2 / URL */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Banner Image (Exact Fit: 1480×540 px or 1920×700 px)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 bg-[#FAF3EB] hover:bg-[#F3E6D8] border border-[#E8DCCF] text-stone-700 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                      {isUploadingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C86A28]" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5 text-[#C86A28]" />
                      )}
                      <span>{isUploadingImage ? "Uploading to R2..." : "Upload New Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUploadFile(
                              file,
                              "banners",
                              (url) => setEditingSlide({ ...editingSlide, imageUrl: url }),
                              setIsUploadingImage
                            );
                          }
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-stone-400">
                      Uploads directly to Cloudflare R2
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Public image URL (e.g. /images/... or https://pub-...)"
                    value={editingSlide.imageUrl}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, imageUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs font-mono"
                  />
                </div>

                {editingSlide.imageUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-[#E8DCCF] h-32 bg-[#0E0C0A] flex items-center justify-center p-1 relative">
                    <img
                      src={editingSlide.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* CTA Button Text */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. SHOP NOW, EXPLORE COLLECTION"
                  value={editingSlide.buttonText}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, buttonText: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs font-bold uppercase"
                />
              </div>

              {/* Tag / Destination Link */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Tag Link (Product URL or Listing Page)
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. /shop?category=sunglasses, /shop?brand=ray-ban, or https://..."
                      value={editingSlide.linkUrl || ""}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, linkUrl: e.target.value })
                      }
                      className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    When visitors click this banner on the homepage, they will be directed to this link.
                  </p>

                  {/* Preset Shortcut Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-stone-500 font-bold">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, linkUrl: "/shop?category=sunglasses" })}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF3EB] hover:bg-[#F3E6D8] text-[#C86A28] border border-[#E8DCCF] cursor-pointer"
                    >
                      Sunglasses
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, linkUrl: "/shop?category=eyeglasses" })}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF3EB] hover:bg-[#F3E6D8] text-[#C86A28] border border-[#E8DCCF] cursor-pointer"
                    >
                      Eyeglasses
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, linkUrl: "/shop" })}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF3EB] hover:bg-[#F3E6D8] text-[#C86A28] border border-[#E8DCCF] cursor-pointer"
                    >
                      All Shop
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, linkUrl: "/shop?brand=cartier" })}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF3EB] hover:bg-[#F3E6D8] text-[#C86A28] border border-[#E8DCCF] cursor-pointer"
                    >
                      Cartier
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, linkUrl: "/shop?brand=ray-ban" })}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF3EB] hover:bg-[#F3E6D8] text-[#C86A28] border border-[#E8DCCF] cursor-pointer"
                    >
                      Ray-Ban
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DCCF] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSlideModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveSlideModal}
                className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                <span>Apply Changes</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REEL ADD / EDIT MODAL */}
      {/* ========================================================================= */}
      {isReelModalOpen && editingReel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E8DCCF] shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#E8DCCF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#C86A28]" />
                <h3 className="font-serif font-bold text-sm text-[#2A1E17]">
                  {isNewReel ? "Add New Video Reel" : "Edit Video Reel"}
                </h3>
              </div>
              <button
                onClick={() => setIsReelModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Video File Upload to R2 */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Reel Video File (.mp4 / .webm) - Uploads to Cloudflare R2
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 bg-[#FAF3EB] hover:bg-[#F3E6D8] border border-[#E8DCCF] text-stone-700 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                      {isUploadingVideo ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C86A28]" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5 text-[#C86A28]" />
                      )}
                      <span>{isUploadingVideo ? "Uploading to R2..." : "Upload Video to R2"}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // 1. Immediately extract thumbnail from local file blob (0 CORS, instant frame capture)
                            const localBlobUrl = URL.createObjectURL(file);
                            captureVideoFrame(localBlobUrl).then(async (thumbBlob) => {
                              URL.revokeObjectURL(localBlobUrl);
                              if (thumbBlob) {
                                const thumbFile = new File([thumbBlob], `thumb_${Date.now()}.jpg`, { type: "image/jpeg" });
                                await handleUploadFile(
                                  thumbFile,
                                  "reels",
                                  (thumbUrl) => {
                                    setEditingReel((prev) => (prev ? { ...prev, image: thumbUrl } : null));
                                    toast.success("Thumbnail auto-extracted from video!");
                                  },
                                  setIsUploadingPoster
                                );
                              }
                            }).catch(() => {
                              URL.revokeObjectURL(localBlobUrl);
                            });

                            // 2. Upload video file to Cloudflare R2
                            await handleUploadFile(
                              file,
                              "reels",
                              (url) => {
                                setEditingReel((prev) => (prev ? { ...prev, videoUrl: url } : null));
                              },
                              setIsUploadingVideo
                            );
                          }
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-stone-400">
                      Recommended: 9:16 vertical MP4
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Public video URL (e.g. /videos/reels/urban_icons.mp4 or https://pub-...)"
                    value={editingReel.videoUrl}
                    onChange={(e) =>
                      setEditingReel({ ...editingReel, videoUrl: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs font-mono"
                  />
                </div>
              </div>

              {/* Poster Cover Image / Thumbnail with Auto-Fetch */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-700 font-bold">
                    Poster Thumbnail (9:16)
                  </label>
                  <span className="text-[10px] text-stone-400">
                    Auto-captures if left empty
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-20 bg-[#FAF3EB] rounded-lg border border-[#E8DCCF] overflow-hidden shrink-0 flex items-center justify-center">
                    {editingReel.image ? (
                      <img
                        src={editingReel.image}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-5 h-5 text-stone-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Auto-Fetch Thumbnail Button */}
                      <button
                        type="button"
                        onClick={() => handleAutoFetchThumbnail()}
                        disabled={isExtractingThumbnail || !editingReel.videoUrl}
                        className="inline-flex items-center gap-1.5 bg-[#C86A28] hover:bg-[#b0581e] disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        {isExtractingThumbnail ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                        <span>Auto-Fetch from Video</span>
                      </button>

                      {/* Manual Upload Poster Button */}
                      <label className="inline-flex items-center gap-1.5 bg-[#FAF3EB] hover:bg-[#F3E6D8] border border-[#E8DCCF] text-stone-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                        {isUploadingPoster ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C86A28]" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5 text-[#C86A28]" />
                        )}
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadFile(
                                file,
                                "reels",
                                (url) => setEditingReel({ ...editingReel, image: url }),
                                setIsUploadingPoster
                              );
                            }
                          }}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      placeholder="Thumbnail image URL"
                      value={editingReel.image}
                      onChange={(e) =>
                        setEditingReel({ ...editingReel, image: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Reel Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Reel Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. URBAN ICONS, TITANIUM SERIES"
                    value={editingReel.title}
                    onChange={(e) =>
                      setEditingReel({ ...editingReel, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Subtitle / Narrative
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Built for the ones ahead"
                    value={editingReel.subtitle || ""}
                    onChange={(e) =>
                      setEditingReel({ ...editingReel, subtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs"
                  />
                </div>
              </div>

              {/* Destination URL & Preset Chips */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Destination Page / Product Link
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. /shop?category=sunglasses or /cart or https://..."
                      value={editingReel.linkUrl || ""}
                      onChange={(e) =>
                        setEditingReel({ ...editingReel, linkUrl: e.target.value })
                      }
                      className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs font-mono"
                    />
                  </div>

                  {/* Preset Shortcut Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-stone-500 font-bold">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => setEditingReel({ ...editingReel, linkUrl: "/shop?category=sunglasses", linkLabel: "Shop Sunglasses" })}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF3EB] hover:bg-[#F3E6D8] text-[#C86A28] border border-[#E8DCCF] cursor-pointer"
                    >
                      Sunglasses
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingReel({ ...editingReel, linkUrl: "/shop?category=eyeglasses", linkLabel: "Shop Eyeglasses" })}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF3EB] hover:bg-[#F3E6D8] text-[#C86A28] border border-[#E8DCCF] cursor-pointer"
                    >
                      Eyeglasses
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingReel({ ...editingReel, linkUrl: "/shop", linkLabel: "Shop Collection" })}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF3EB] hover:bg-[#F3E6D8] text-[#C86A28] border border-[#E8DCCF] cursor-pointer"
                    >
                      All Shop
                    </button>
                  </div>
                </div>
              </div>

              {/* Instagram Reel Link */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Instagram Reel Link (Optional)
                </label>
                <div className="relative">
                  <Instagram className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. https://www.instagram.com/reel/..."
                    value={editingReel.instagramUrl || ""}
                    onChange={(e) =>
                      setEditingReel({ ...editingReel, instagramUrl: e.target.value })
                    }
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs font-mono"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  If provided, a realistic Instagram icon button will appear beside the CTA on the reel card. Leave blank to hide.
                </p>
              </div>

              {/* Button CTA Text & Badge Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Look, View Frames, Explore"
                    value={editingReel.linkLabel || ""}
                    onChange={(e) =>
                      setEditingReel({ ...editingReel, linkLabel: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Badge Typography Style
                  </label>
                  <select
                    value={editingReel.badgeStyle || "clean"}
                    onChange={(e) =>
                      setEditingReel({
                        ...editingReel,
                        badgeStyle: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs"
                  >
                    <option value="clean">Clean Minimal</option>
                    <option value="stencil">Stencil Bold</option>
                    <option value="graffiti">Graffiti Street</option>
                    <option value="bold">Bold Premium</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DCCF] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReelModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveReelModal}
                disabled={isExtractingThumbnail}
                className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white cursor-pointer"
              >
                {isExtractingThumbnail ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 mr-1" />
                )}
                <span>Apply Reel Changes</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION POPUP MODAL */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8DCCF] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-rose-950">
                  Confirm Item Deletion
                </h3>
                <p className="text-[11px] text-rose-700">
                  {deleteTarget.type === "slide" ? "Hero Banner Slide" : "Video Lookbook Reel"}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3 text-xs text-stone-600">
              <p>
                Are you sure you want to delete <strong className="text-[#2A1E17] font-bold">"{deleteTarget.title}"</strong>?
              </p>

              {deleteTarget.imageUrl && (
                <div className="flex items-center gap-3 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8DCCF]">
                  <img
                    src={deleteTarget.imageUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg bg-black shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#2A1E17] truncate">{deleteTarget.title}</p>
                    <p className="text-[10px] text-stone-400 truncate font-mono">{deleteTarget.imageUrl}</p>
                  </div>
                </div>
              )}

              {/* R2 Storage Deletion Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF3EB] border border-[#E8DCCF] cursor-pointer mt-3 select-none">
                <input
                  type="checkbox"
                  checked={deleteFromStorage}
                  onChange={(e) => setDeleteFromStorage(e.target.checked)}
                  className="mt-0.5 rounded text-[#C86A28] focus:ring-[#C86A28] cursor-pointer"
                />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-[#2A1E17] block">
                    Delete media from Cloudflare R2 bucket
                  </span>
                  <span className="text-stone-500">
                    Permanently deletes video and images from storage to free up bucket space.
                  </span>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DCCF] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTarget(null);
                }}
                disabled={isDeleting}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                )}
                <span>Confirm Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
