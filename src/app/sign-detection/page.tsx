
"use client";

import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { CameraFeed, type CameraFeedRef } from "@/components/camera-feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { analyzeImageForSign } from "@/ai/flows/analyze-sign-flow";
import { HandSign, handSigns, handSignDetails } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Hand, Loader2, Video, Info } from "lucide-react";
import Image from "next/image";

export default function SignDetectionPage() {
  const cameraRef = useRef<CameraFeedRef>(null);
  const [detectedSign, setDetectedSign] = useState<HandSign | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startDetection = () => {
    if (!cameraRef.current?.isCameraOn) {
      toast({ variant: "destructive", title: "Camera is off", description: "Please turn on the camera to start detection." });
      return;
    }
    setIsDetecting(true);
    setDetectedSign(null);
    toast({ title: "Sign Detection Started", description: "Actively monitoring for hand signs." });

    detectionInterval.current = setInterval(async () => {
      if (isProcessing || !cameraRef.current) return;

      const imageDataUrl = cameraRef.current.capture();
      if (imageDataUrl) {
        setIsProcessing(true);
        try {
          const { sign } = await analyzeImageForSign({ imageDataUri: imageDataUrl });
          setDetectedSign(sign);
          if (sign) {
            toast({ title: "Sign Detected!", description: `The AI detected the "${sign}" sign.` });
          }
        } catch (error) {
          console.error("Error analyzing image:", error);
        } finally {
          setIsProcessing(false);
        }
      }
    }, 4000); // Check every 4 seconds
  };

  const stopDetection = () => {
    setIsDetecting(false);
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
    setDetectedSign(null);
    toast({ title: "Detection Stopped" });
  };

  useEffect(() => {
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto py-4">
      <PageHeader
        title="Emergency Sign Detection"
        description="Detects various hand signs from the camera feed and provides real-time feedback."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CameraFeed ref={cameraRef}>
            {detectedSign && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center p-4">
                <Alert className="max-w-md bg-background/90 border-primary">
                  <Hand className="h-5 w-5 text-primary" />
                  <AlertTitle className="text-xl font-bold text-primary">Sign Detected: {detectedSign}</AlertTitle>
                  <AlertDescription className="mt-2">
                    {handSignDetails[detectedSign]?.description}
                  </AlertDescription>
                </Alert>
              </div>
            )}
             {isProcessing && !detectedSign && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            )}
          </CameraFeed>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Control</CardTitle>
              <CardDescription>Start or stop automatic sign detection.</CardDescription>
            </CardHeader>
            <CardContent>
              {isDetecting ? (
                <Button onClick={stopDetection} variant="destructive" className="w-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Stop Detection
                </Button>
              ) : (
                <Button onClick={startDetection} className="w-full">
                  <Video className="mr-2 h-4 w-4" />
                  Start Detection
                </Button>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detection Status</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                 {isDetecting ? (
                    detectedSign ? (
                         <div className="flex flex-col items-center text-primary">
                            <Hand className="mr-2 h-8 w-8" />
                            <span className="text-2xl font-bold">{detectedSign}</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-muted-foreground justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Monitoring for signs...</span>
                        </div>
                    )
                ) : (
                    <p className="text-muted-foreground">System is idle.</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
       <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
             <Info className="text-primary"/>
             <CardTitle>Recognized Hand Signs Guide</CardTitle>
          </div>
          <CardDescription>Use this guide to perform the signs that the system can recognize.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {handSigns.map((sign) => (
                <div key={sign} className="flex flex-col items-center text-center gap-2 p-2 border rounded-lg">
                    <Image 
                        data-ai-hint={handSignDetails[sign]?.hint}
                        src={handSignDetails[sign]?.image || "https://placehold.co/150x150.png"}
                        alt={sign}
                        width={150}
                        height={150}
                        className="rounded-md object-cover aspect-square"
                    />
                    <p className="font-semibold">{sign}</p>
                    <p className="text-xs text-muted-foreground">{handSignDetails[sign]?.description}</p>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
