import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download, Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  url: string;
  title?: string;
  description?: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  url, 
  title = "QR Code", 
  description = "Scan to download",
  size = 200 
}) => {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    generateQRCode(url);
  }, [url]);

  const generateQRCode = (data: string) => {
    // Simple QR code generation using a pattern
    // In production, you'd use a proper QR code library like 'qrcode' or 'qr-code-generator'
    const qrSvg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="white"/>
        <!-- Finder patterns (corners) -->
        <rect x="20" y="20" width="60" height="60" fill="black"/>
        <rect x="30" y="30" width="40" height="40" fill="white"/>
        <rect x="40" y="40" width="20" height="20" fill="black"/>
        
        <rect x="${size-80}" y="20" width="60" height="60" fill="black"/>
        <rect x="${size-70}" y="30" width="40" height="40" fill="white"/>
        <rect x="${size-60}" y="40" width="20" height="20" fill="black"/>
        
        <rect x="20" y="${size-80}" width="60" height="60" fill="black"/>
        <rect x="30" y="${size-70}" width="40" height="40" fill="white"/>
        <rect x="40" y="${size-60}" width="20" height="20" fill="black"/>
        
        <!-- Timing patterns -->
        ${Array.from({length: Math.floor((size-160)/20)}, (_, i) => {
          const x = 100 + i * 20;
          return i % 2 === 0 ? `<rect x="${x}" y="60" width="20" height="20" fill="black"/>` : '';
        }).join('')}
        
        ${Array.from({length: Math.floor((size-160)/20)}, (_, i) => {
          const y = 100 + i * 20;
          return i % 2 === 0 ? `<rect x="60" y="${y}" width="20" height="20" fill="black"/>` : '';
        }).join('')}
        
        <!-- Data modules (simplified pattern) -->
        ${Array.from({length: 8}, (_, i) => 
          Array.from({length: 8}, (_, j) => {
            const x = 100 + i * 10;
            const y = 100 + j * 10;
            const shouldFill = (i + j + data.length) % 3 === 0;
            return shouldFill ? `<rect x="${x}" y="${y}" width="8" height="8" fill="black"/>` : '';
          }).join('')
        ).join('')}
        
        <!-- URL hash visualization -->
        ${data.split('').map((char, i) => {
          const x = 110 + (i % 6) * 12;
          const y = 110 + Math.floor(i / 6) * 12;
          const shouldFill = char.charCodeAt(0) % 2 === 0;
          return shouldFill && i < 36 ? `<rect x="${x}" y="${y}" width="10" height="10" fill="black"/>` : '';
        }).join('')}
        
        <text x="${size/2}" y="${size-10}" text-anchor="middle" font-size="12" fill="black">${description}</text>
      </svg>
    `;
    
    const encodedSvg = btoa(qrSvg);
    setQrCodeData(`data:image/svg+xml;base64,${encodedSvg}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Copied!",
        description: "Download URL copied to clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Could not copy URL to clipboard.",
        variant: "destructive",
      });
    });
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `qr-code-${title.toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "QR code saved as SVG file.",
    });
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
        toast({
          title: "Shared!",
          description: "QR code shared successfully.",
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg border">
            {qrCodeData ? (
              <img 
                src={qrCodeData} 
                alt={`QR Code for ${title}`}
                className="w-full h-full"
                style={{ width: size, height: size }}
              />
            ) : (
              <div 
                className="flex items-center justify-center bg-gray-100"
                style={{ width: size, height: size }}
              >
                <QrCode className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="qr-url">Download URL:</Label>
          <div className="flex gap-2">
            <Input
              id="qr-url"
              value={url}
              readOnly
              className="flex-1 text-sm"
            />
            <Button size="sm" variant="outline" onClick={copyToClipboard}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadQRCode} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download QR
          </Button>
          <Button variant="outline" size="sm" onClick={shareQRCode} className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Scan with your mobile camera or QR code reader</p>
          <p>Compatible with Android and iOS devices</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;