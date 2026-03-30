"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Heart, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MarriedConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading: boolean
}

export function MarriedConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: MarriedConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-gray-900 border-2 border-green-500/20 shadow-2xl overflow-hidden p-0 max-w-md">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-6 text-center border-b border-green-100 dark:border-green-900/50">
            <div className="mx-auto w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 shadow-xl ring-4 ring-green-100 dark:ring-green-900/30">
                <Heart className="h-8 w-8 text-green-500 fill-green-500 animate-pulse" />
            </div>
            <AlertDialogTitle className="text-xl font-black text-gray-900 dark:text-white mb-1">
                Congratulations! 🎉
            </AlertDialogTitle>
            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed max-w-[280px] mx-auto">
                Found your life partner? We're so happy for you! Connect forever and start your journey together.
            </p>
        </div>

        <div className="p-6 space-y-4">
            <AlertDialogDescription asChild>
                <div className="text-gray-600 dark:text-gray-400">
                    <p className="text-xs mb-3 text-center">Your profile will be permanently marked as <strong className="text-gray-900 dark:text-white">Married</strong>.</p>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <ul className="grid grid-cols-1 gap-2">
                            {[
                                "Removed from matching pools.",
                                "Stop new match suggestions.",
                                "Hide from searches globally.",
                                "Mute prospect notifications."
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-2 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="text-[10px] text-rose-500 font-bold mt-3 text-center italic">This action cannot be undone.</p>
                </div>
            </AlertDialogDescription>

            <AlertDialogFooter className="sm:justify-center gap-2">
                <AlertDialogCancel className="w-full sm:w-auto mt-0 border-2 border-gray-200 font-bold h-10 rounded-xl text-xs">
                    Cancel
                </AlertDialogCancel>
                <Button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="w-full sm:w-auto h-10 rounded-xl font-black bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 border-0 text-xs px-6"
                >
                    {isLoading ? (
                         <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Processing...
                         </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-5 w-5" />
                            Yes, Mark as Married
                        </>
                    )}
                </Button>
            </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
