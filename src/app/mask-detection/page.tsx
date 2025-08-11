"use client";

import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { CameraFeed, type CameraFeedRef } from "@/components/camera-feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/lib/excel";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Loader2 } from "lucide-react";
import { analyzeImageForMask } from "@/ai/flows/analyze-mask-flow";

type MaskStatus = 'Worn' | 'Not Worn' | 'Unknown';
type LogEntry = {
  Date: string;
  Time: string;
  'Mask Status': MaskStatus;
};

export default function MaskDetectionPage() {
  const cameraRef = useRef<CameraFeedRef>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [maskStatus, setMaskStatus] = useState<MaskStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleToggleDetection = () => {
    if (isDetecting) {
      stopDetection();
    } else {
      startDetection();
    }
  };

  const startDetection = () => {
    if (!cameraRef.current?.isCameraOn) {
      toast({ variant: "destructive", title: "Camera is off", description: "Please turn on the camera to start detection." });
      return;
    }
    setIsDetecting(true);
    setMaskStatus(null);
    toast({ title: "Mask detection started" });
    detectionInterval.current = setInterval(async () => {
      const imageDataUrl = cameraRef.current?.capture();
      if (imageDataUrl) {
        try {
          const { maskStatus: status } = await analyzeImageForMask({ imageDataUri: imageDataUrl });
          setMaskStatus(status);
          if(status !== 'Unknown') {
             logEvent(status);
          }
        } catch (error) {
          console.error("Error analyzing image for mask:", error);
          setMaskStatus("Unknown");
          toast({ variant: "destructive", title: "AI Error", description: "Could not analyze image for mask." });
        }
      }
    }, 3000); // Check every 3 seconds
  };
  
  const stopDetection = () => {
      setIsDetecting(false);
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
      setMaskStatus(null);
      toast({ title: "Mask detection stopped" });
  };
  
  const logEvent = (status: 'Worn' | 'Not Worn' | 'Unknown') => {
    const now = new Date();
    const newLog: LogEntry = {
      Date: now.toLocaleDateString(),
      Time: now.toLocaleTimeString(),
      'Mask Status': status,
    };
    // Add to the top of the list, but avoid logging too frequently for the same status
    setLogs(prevLogs => {
        if(prevLogs[0]?.['Mask Status'] === status) return prevLogs;
        return [newLog, ...prevLogs]
    });
  };
  
  useEffect(() => {
      return () => {
          if (detectionInterval.current) {
              clearInterval(detectionInterval.current)
          }
      }
  }, [])

  const getStatusMessage = () => {
    if (!isDetecting) return "Detection is off.";
    if (maskStatus === 'Worn') return "Mask detected. Thank you for your cooperation!";
    if (maskStatus === 'Not Worn') return "No mask detected. Please wear a mask.";
    if (maskStatus === 'Unknown') return "Cannot determine mask status from the image.";
    return "Analyzing...";
  };

  return (
    <div className="container mx-auto py-4">
      <PageHeader
        title="Face Mask Detection System"
        description="Detects if a person is wearing a face mask and provides a safety message."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <CameraFeed ref={cameraRef}>
                {isDetecting && maskStatus && (
                    <div className={cn("absolute inset-0 flex items-center justify-center p-4", {
                        "bg-green-500/20": maskStatus === "Worn",
                        "bg-red-500/20": maskStatus === "Not Worn",
                        "bg-yellow-500/20": maskStatus === "Unknown",
                    })}>
                        <Badge variant={maskStatus === 'Worn' ? 'default' : (maskStatus === 'Not Worn' ? 'destructive' : 'secondary')} className={cn("text-lg p-3", {
                            "bg-green-600": maskStatus === "Worn",
                            "bg-red-600": maskStatus === "Not Worn",
                            "bg-yellow-500 text-black": maskStatus === "Unknown"
                        })}>
                            {getStatusMessage()}
                        </Badge>
                    </div>
                )}
            </CameraFeed>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleToggleDetection} className="w-full" variant={isDetecting ? "destructive" : "default"}>
                {isDetecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isDetecting ? 'Stop Detection' : 'Start Detection'}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center">
                    <p className={cn("text-2xl font-bold", {
                        "text-green-600": maskStatus === "Worn",
                        "text-red-600": maskStatus === "Not Worn",
                        "text-yellow-600": maskStatus === "Unknown",
                        "text-muted-foreground": !maskStatus
                    })}>
                       {isDetecting ? (maskStatus ? `Mask ${maskStatus}` : 'Analyzing...') : 'Idle'}
                    </p>
                    <p className="text-muted-foreground mt-1">{getStatusMessage()}</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className="mt-6">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Mask Detection Logs</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportToExcel(logs, "Mask Detection Logs", "mask_detection_logs")} disabled={logs.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Logs
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Mask Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.length > 0 ? (
                        logs.map((log, index) => (
                            <TableRow key={index}>
                                <TableCell>{log.Date}</TableCell>
                                <TableCell>{log.Time}</TableCell>
                                <TableCell>
                                    <Badge variant={log['Mask Status'] === 'Worn' ? 'default' : (log['Mask Status'] === 'Not Worn' ? 'destructive' : 'secondary')}>
                                        {log['Mask Status']}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">No logs yet.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
