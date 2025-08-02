import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Upload, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  ticketId: string;
  onSuccess: () => void;
}

export function PhotoUpload({ ticketId, onSuccess }: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get GPS location when component mounts
  useState(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setGpsCoordinates(coords);
          setGpsEnabled(true);
        },
        (error) => {
          console.error("GPS Error:", error);
          toast({
            title: "GPS Access Denied",
            description: "Photos will be uploaded without location data.",
            variant: "destructive"
          });
        }
      );
    }
  });

  const uploadPhotosMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFiles.length) {
        throw new Error("No files selected");
      }

      if (!gpsCoordinates) {
        throw new Error("GPS coordinates required");
      }

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });
      formData.append('gpsCoordinates', JSON.stringify(gpsCoordinates));

      const response = await fetch(`/api/tickets/${ticketId}/photos`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Photos Uploaded",
        description: "Proof photos uploaded successfully with GPS coordinates.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    uploadPhotosMutation.mutate();
  };

  return (
    <div className="space-y-4">
      {/* GPS Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className={`h-5 w-5 ${gpsEnabled ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm font-medium">GPS Location</span>
            </div>
            <Badge className={gpsEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {gpsEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          {gpsCoordinates && (
            <p className="text-xs text-gray-500 mt-2">
              Coordinates: {gpsCoordinates.lat.toFixed(6)}, {gpsCoordinates.lng.toFixed(6)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardContent className="p-6">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Click to upload photos or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              GPS location will be automatically captured
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Selected Files:</h4>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Button */}
      <Button 
        onClick={handleUpload}
        disabled={!selectedFiles.length || !gpsEnabled || uploadPhotosMutation.isPending}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploadPhotosMutation.isPending ? 'Uploading...' : 'Upload Photos & Complete Task'}
      </Button>
    </div>
  );
}
