"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, Upload, CheckCircle2, AlertCircle, X, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface VerificationDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  existingPhotos?: string[]
}

export function VerificationDialog({ isOpen, onClose, userId, existingPhotos = [] }: VerificationDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(existingPhotos[0] || null)
  const [livePhoto, setLivePhoto] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Start/Stop Camera
  useEffect(() => {
    let stream: MediaStream | null = null

    async function startCamera() {
      if (isCameraActive && step === 2) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        } catch (err) {
          console.error("Error accessing camera:", err)
          toast.error("Could not access camera. Please check permissions.")
          setIsCameraActive(false)
        }
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isCameraActive, step])

  // Sync selected photo with existing photos (important when signed URLs arrive late)
  useEffect(() => {
    if (existingPhotos.length > 0) {
        // If nothing selected yet, pick the first one
        if (!selectedPhoto) {
            setSelectedPhoto(existingPhotos[0])
        } else {
            // If something was selected, try to find it's updated version (signed URL)
            // or just stay with the first one if it's the most common case
            const wasInitial = !selectedPhoto || !existingPhotos.includes(selectedPhoto)
            if (wasInitial) {
                // This helps refresh broken URLs with signed ones
                setSelectedPhoto(existingPhotos[0])
            }
        }
    }
  }, [existingPhotos])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        const dataUrl = canvasRef.current.toDataURL("image/jpeg")
        setLivePhoto(dataUrl)
        setIsCameraActive(false)
        setStep(3)
      }
    }
  }

  const handleUpload = async () => {
    if (!livePhoto) return

    setIsUploading(true)
    try {
      // 1. Upload live photo to storage
      const blob = await (await fetch(livePhoto)).blob()
      const fileName = `${userId}/verification_live_selfie_${Date.now()}.jpg`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user-photos")
        .upload(fileName, blob, { contentType: "image/jpeg", upsert: true })

      if (uploadError) throw uploadError

      // 2. Get a signed URL (consistent with how other photos are handled in this app)
      const { data: urlData, error: urlError } = await supabase.storage
        .from("user-photos")
        .createSignedUrl(fileName, 31536000) // 1 year

      if (urlError) throw urlError
      const signedUrl = urlData.signedUrl

      // 3. Update or Insert the verification status in the database
      const { error: upsertError } = await supabase
        .from("photos")
        .upsert({ 
          user_id: userId,
          verification_status: "pending",
          live_photo_url: signedUrl,
          comparison_photo_url: selectedPhoto,
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (upsertError) {
          console.error("Upsert error:", upsertError)
          throw new Error("Database update failed: " + upsertError.message)
      }

      toast.success("Verification submitted successfully! An admin will review it soon.")
      setStep(1)
      onClose()
    } catch (err: any) {
      console.error("Verification error:", err)
      toast.error("Failed to submit verification", {
          description: err.message || "Please check your internet connection and try again."
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl bg-white dark:bg-gray-900 border-none shadow-2xl overflow-hidden p-0">
        <AnimatePresence>
          {step !== 2 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#4B0082] py-2 px-6 text-white overflow-hidden border-b border-white/10"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shrink-0 shadow-lg">
                        <ShieldCheck className="h-5 w-5 text-pink-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <DialogTitle className="text-lg font-bold leading-tight truncate">Identity Verification</DialogTitle>
                        <DialogDescription className="text-white/60 text-[10px] line-clamp-1">
                          Secure your profile and build trust with others.
                        </DialogDescription>
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-0 overflow-y-auto max-h-[85vh]">
          <div className="p-6">
            <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="space-y-6"
              >
                <div className="text-center">
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Step 1: Choose Comparison Photo</div>
                    <div className="grid grid-cols-3 gap-3">
                        {existingPhotos.length > 0 ? (
                            existingPhotos.map((url, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedPhoto(url)}
                                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedPhoto === url ? 'border-primary ring-4 ring-primary/20 scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img 
                                        src={url} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Profile&size=200&background=random`
                                        }}
                                    />
                                    {selectedPhoto === url && (
                                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                            <CheckCircle2 className="h-6 w-6 text-primary shadow-sm" />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400">
                                <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                                <p className="text-xs">No photos uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
                <Button 
                    className="w-full h-12 bg-gradient-to-r from-[#4B0082] to-[#6A5ACD] hover:opacity-90 font-bold"
                    disabled={!selectedPhoto}
                    onClick={() => setStep(2)}
                >
                    Continue to Camera →
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
                  {/* Left Column: Branding and Info */}
                  <div className="md:col-span-2 space-y-6 p-4">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center border border-purple-200 dark:border-purple-800">
                        <ShieldCheck className="h-6 w-6 text-[#4B0082] dark:text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Identity Verification</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                          To protect our community, we require a real-time selfie. This helps us confirm you're the same person shown in your profile photos.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        </div>
                        Secure & Private
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        </div>
                        Instant verification
                      </div>
                    </div>

                    <div className="pt-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Step</div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-xs font-medium text-[#4B0082] dark:text-purple-400 border border-purple-100 dark:border-purple-800/50">
                            Step 2: Live Selfie Capture
                        </div>
                    </div>
                  </div>

                  {/* Right Column: Camera View */}
                  <div className="md:col-span-3">
                    <div className="relative aspect-square w-full max-w-[320px] mx-auto rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-gray-100 dark:border-gray-800 group">
                      {!isCameraActive ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 bg-gradient-to-b from-gray-900 to-black">
                          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                            <Camera className="h-10 w-10 text-gray-400" />
                          </div>
                          <p className="text-sm mb-8 text-center text-gray-400 px-4">Camera access is required for live verification</p>
                          <Button onClick={() => setIsCameraActive(true)} className="bg-white hover:bg-gray-100 text-[#4B0082] font-bold h-12 px-10 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
                            Enable Camera
                          </Button>
                        </div>
                      ) : (
                        <>
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                          {/* Face Overlay */}
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[70%] h-[75%] border-2 border-dashed border-white/30 rounded-full" />
                          </div>
                          <div className="absolute bottom-6 inset-x-0 flex justify-center">
                            <button 
                                onClick={capturePhoto}
                                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all bg-white/10 backdrop-blur-sm"
                            >
                                <div className="w-10 h-10 rounded-full bg-white shadow-inner" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex justify-between items-center pt-4 mt-6 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="ghost" onClick={() => { setIsCameraActive(false); setStep(1); }} className="font-medium text-gray-500 hover:text-red-500 transition-colors">
                      <X className="h-4 w-4 mr-2" /> Cancel Choice
                    </Button>
                    <div className="text-[10px] text-gray-400 font-medium">Position your face within the frame</div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="text-center">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Final Step: Review & Submit</div>
                    <div className="flex gap-4 justify-center items-stretch max-w-xl mx-auto">
                      <div className="space-y-1 flex-1 flex flex-col">
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Profile Photo</p>
                          <div className="aspect-square flex-1 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center max-h-[200px]">
                            {selectedPhoto ? (
                              <img 
                                src={selectedPhoto} 
                                alt="Selected" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Profile&size=400&background=random`
                                }}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-gray-300">
                                <User className="h-6 w-6 mb-1 opacity-30" />
                                <span className="text-[9px]">No Photo Selected</span>
                              </div>
                            )}
                          </div>
                      </div>
                      <div className="space-y-1 flex-1 flex flex-col">
                           <p className="text-[9px] font-bold text-amber-500 uppercase">Live Selfie</p>
                          <div className="aspect-square flex-1 rounded-xl overflow-hidden border border-amber-100 shadow-sm bg-gray-50 flex items-center justify-center max-h-[200px]">
                            <img src={livePhoto!} alt="Live Selfie" className="w-full h-full object-cover scale-x-[-1]" />
                          </div>
                      </div>
                    </div>
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl flex gap-3 items-start border border-blue-100/50 dark:border-blue-800/30">
                    <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                        By submitting, you agree to let our admins compare these photos for identity verification.
                    </p>
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-10 text-xs font-bold rounded-xl border-gray-200">
                        Retake Selfie
                    </Button>
                    <Button 
                        className="flex-[2] h-10 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold rounded-xl shadow-lg transition-all active:scale-95 text-white"
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? "Verifying..." : "Confirm & Submit"}
                    </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)
}
