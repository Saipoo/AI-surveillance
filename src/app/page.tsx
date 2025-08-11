"use client";

import { useRef, useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { CameraFeed, type CameraFeedRef } from "@/components/camera-feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/lib/excel";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload, Loader2 } from "lucide-react";
import { analyzeImageForUniform } from "@/ai/flows/analyze-uniform-flow";
import { Input } from "@/components/ui/input";

type LogEntry = {
  Date: string;
  Time: string;
  'Uniform Status': 'Granted' | 'Denied';
};

export default function UniformDetectionPage() {
  const cameraRef = useRef<CameraFeedRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<'Granted' | 'Denied' | null>(null);
  const [registeredUniform, setRegisteredUniform] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load registered uniform from localStorage on mount
    const storedUniform = localStorage.getItem("registeredUniform");
    if (storedUniform) {
      setRegisteredUniform(storedUniform);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setRegisteredUniform(imageDataUrl);
        localStorage.setItem("registeredUniform", imageDataUrl); // Save to localStorage
        toast({
          title: "Uniform Registered",
          description: "The uniform image has been successfully uploaded and saved.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterClick = () => {
    fileInputRef.current?.click();
  };

  const handleToggleDetection = () => {
    if (isDetecting) {
      setIsDetecting(false);
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
      setDetectionStatus(null);
      toast({ title: "Detection Stopped" });
    } else {
      if (!registeredUniform) {
        toast({
          variant: "destructive",
          title: "No Uniform Registered",
          description: "Please upload a uniform image before starting detection.",
        });
        return;
      }
       if (!cameraRef.current?.isCameraOn) {
        toast({ variant: "destructive", title: "Camera is off", description: "Please turn on the camera to start detection." });
        return;
       }
      setIsDetecting(true);
      toast({ title: "Detection Started" });
      detectionInterval.current = setInterval(async () => {
        if (isProcessing || !cameraRef.current) return;
        
        const cameraImageUri = cameraRef.current.capture();
        if (cameraImageUri && registeredUniform) {
            setIsProcessing(true);
            try {
                const { isMatch } = await analyzeImageForUniform({ cameraImageUri, registeredUniformUri: registeredUniform });
                const status = isMatch ? 'Granted' : 'Denied';
                setDetectionStatus(status);
                logEvent(status);
            } catch (error) {
                console.error("Error analyzing uniform:", error);
                toast({ variant: "destructive", title: "AI Error", description: "Could not analyze the uniform." });
                setDetectionStatus(null);
            } finally {
                setIsProcessing(false);
            }
        }
      }, 4000); // Check every 4 seconds
    }
  };
  
  const logEvent = (status: 'Granted' | 'Denied') => {
    const now = new Date();
    const newLog: LogEntry = {
      Date: now.toLocaleDateString(),
      Time: now.toLocaleTimeString(),
      'Uniform Status': status,
    };
    setLogs(prevLogs => {
      if (prevLogs[0]?.['Uniform Status'] === status) return prevLogs;
      return [newLog, ...prevLogs];
    });
  };

  useEffect(() => {
    return () => {
        if(detectionInterval.current) {
            clearInterval(detectionInterval.current)
        }
    }
  }, [])

  return (
    <div className="container mx-auto py-4">
      <PageHeader
        title="Uniform Detection System"
        description="Upload a uniform image, then detect if a student is wearing it to grant or deny permission."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CameraFeed ref={cameraRef}>
            {detectionStatus && (
               <div className="absolute top-4 left-4">
                <Badge variant={detectionStatus === 'Granted' ? 'default' : 'destructive'} className={`text-lg p-2 ${detectionStatus === 'Granted' ? 'bg-green-500' : 'bg-red-500'}`}>
                  Permission {detectionStatus}
                </Badge>
               </div>
            )}
             {isProcessing && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            )}
          </CameraFeed>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <Button onClick={handleRegisterClick} className="w-full" disabled={isDetecting}>
                <Upload className="mr-2" /> Upload Uniform Image
              </Button>
              <Button onClick={handleToggleDetection} className="w-full" variant={isDetecting ? "destructive" : "default"}>
                {isDetecting ? (
                    <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                     Stop Detection
                    </>
                ) : 'Start Detection'}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Registered Uniform</CardTitle>
              <CardDescription>This is the reference image for detection.</CardDescription>
            </CardHeader>
            <CardContent>
              {registeredUniform ? (
                <Image src={registeredUniform} alt="Registered Uniform" width={200} height={200} className="rounded-md mx-auto aspect-square object-cover" />
              ) : (
                <div className="text-muted-foreground text-center border-2 border-dashed rounded-lg p-8">
                    <p>No uniform image uploaded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detection Logs</CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportToExcel(logs, "Uniform Logs", "uniform_detection_logs")} disabled={logs.length === 0}>
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
                        <TableHead>Uniform Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.length > 0 ? (
                        logs.map((log, index) => (
                            <TableRow key={index}>
                                <TableCell>{log.Date}</TableCell>
                                <TableCell>{log.Time}</TableCell>
                                <TableCell>
                                    <Badge variant={log['Uniform Status'] === 'Granted' ? 'default' : 'destructive'}>
                                        {log['Uniform Status']}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">No logs yet. Start detection to see results.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
