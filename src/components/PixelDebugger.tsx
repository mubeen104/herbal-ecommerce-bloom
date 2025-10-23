import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Bug, CheckCircle, XCircle } from 'lucide-react';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixels';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PixelStatus {
  platform: string;
  loaded: boolean;
  error?: string;
  events: Array<{
    name: string;
    timestamp: Date;
    data: any;
  }>;
}

export const PixelDebugger = () => {
  const { data: pixels = [] } = useEnabledPixels();
  const { isAdmin } = useAuth();
  const [pixelStatuses, setPixelStatuses] = useState<PixelStatus[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkPixelStatus = () => {
      const statuses: PixelStatus[] = pixels.map(pixel => {
        let loaded = false;
        let error = '';

        switch (pixel.platform) {
          case 'google_ads':
            loaded = !!(window as any).gtag;
            break;
          case 'meta_pixel':
            loaded = !!(window as any).fbq;
            break;
          case 'tiktok_pixel':
            loaded = !!(window as any).ttq;
            break;
          case 'linkedin_insight':
            loaded = !!(window as any).lintrk;
            break;
          case 'twitter_pixel':
            loaded = !!(window as any).twq;
            break;
          case 'pinterest_tag':
            loaded = !!(window as any).pintrk;
            break;
          case 'snapchat_pixel':
            loaded = !!(window as any).snaptr;
            break;
          case 'microsoft_advertising':
            loaded = !!(window as any).uetq;
            break;
          case 'reddit_pixel':
            loaded = !!(window as any).rdt;
            break;
          case 'quora_pixel':
            loaded = !!(window as any).qp;
            break;
          default:
            error = 'Unknown platform';
        }

        return {
          platform: pixel.platform,
          loaded,
          error,
          events: []
        };
      });

      setPixelStatuses(statuses);
    };

    checkPixelStatus();
    const interval = setInterval(checkPixelStatus, 5000);

    return () => clearInterval(interval);
  }, [pixels]);

  const testEvent = (platform: string) => {
    const testData = {
      value: 99.99,
      currency: 'PKR',
      content_ids: ['test-product'],
      content_name: 'Test Product'
    };

    console.log(`🧪 Testing ${platform} pixel with data:`, testData);
    
    try {
      switch (platform) {
        case 'google_ads':
          if ((window as any).gtag) {
            (window as any).gtag('event', 'test_event', testData);
            console.log('✅ Google Ads test event sent');
          } else {
            console.error('❌ Google Ads gtag not loaded');
          }
          break;
        case 'meta_pixel':
          if ((window as any).fbq) {
            (window as any).fbq('track', 'ViewContent', testData);
            console.log('✅ Meta Pixel test event sent');
          } else {
            console.error('❌ Meta Pixel fbq not loaded');
          }
          break;
        case 'tiktok_pixel':
          if ((window as any).ttq) {
            (window as any).ttq.track('ViewContent', testData);
            console.log('✅ TikTok Pixel test event sent');
          } else {
            console.error('❌ TikTok Pixel ttq not loaded');
          }
          break;
        case 'linkedin_insight':
          if ((window as any).lintrk) {
            (window as any).lintrk('track', { conversion_id: 'test' });
            console.log('✅ LinkedIn Insight test event sent');
          } else {
            console.error('❌ LinkedIn Insight lintrk not loaded');
          }
          break;
        case 'twitter_pixel':
          if ((window as any).twq) {
            (window as any).twq('event', 'tw-test-event', testData);
            console.log('✅ Twitter Pixel test event sent');
          } else {
            console.error('❌ Twitter Pixel twq not loaded');
          }
          break;
        case 'pinterest_tag':
          if ((window as any).pintrk) {
            (window as any).pintrk('track', 'pagevisit', testData);
            console.log('✅ Pinterest Tag test event sent');
          } else {
            console.error('❌ Pinterest Tag pintrk not loaded');
          }
          break;
        case 'snapchat_pixel':
          if ((window as any).snaptr) {
            (window as any).snaptr('track', 'PAGE_VIEW', testData);
            console.log('✅ Snapchat Pixel test event sent');
          } else {
            console.error('❌ Snapchat Pixel snaptr not loaded');
          }
          break;
        case 'microsoft_advertising':
          if ((window as any).uetq) {
            (window as any).uetq.push('event', 'test_event', testData);
            console.log('✅ Microsoft Advertising test event sent');
          } else {
            console.error('❌ Microsoft Advertising uetq not loaded');
          }
          break;
        case 'reddit_pixel':
          if ((window as any).rdt) {
            (window as any).rdt('track', 'PageVisit');
            console.log('✅ Reddit Pixel test event sent');
          } else {
            console.error('❌ Reddit Pixel rdt not loaded');
          }
          break;
        case 'quora_pixel':
          if ((window as any).qp) {
            (window as any).qp('track', 'Generic');
            console.log('✅ Quora Pixel test event sent');
          } else {
            console.error('❌ Quora Pixel qp not loaded');
          }
          break;
        default:
          console.warn(`⚠️ Unknown platform: ${platform}`);
      }
      
      toast({
        title: "Test Event Sent",
        description: `Sent test event to ${platform.replace('_', ' ')}. Check console for details.`,
      });
    } catch (error) {
      console.error(`❌ Error testing ${platform}:`, error);
      toast({
        title: "Test Failed",
        description: `Failed to send test event to ${platform.replace('_', ' ')}.`,
        variant: "destructive",
      });
    }
  };

  if (!isAdmin || pixels.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="bg-background/95 backdrop-blur">
            <Bug className="h-4 w-4 mr-2" />
            Pixel Debug
            {isOpen ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <Card className="w-80 bg-background/95 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Pixel Status</CardTitle>
              <CardDescription className="text-xs">
                Debug advertising pixels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {pixelStatuses.map((status) => (
                <div key={status.platform} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {status.loaded ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium capitalize">
                      {status.platform.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={status.loaded ? "default" : "destructive"} className="text-xs">
                      {status.loaded ? 'Loaded' : 'Error'}
                    </Badge>
                    {status.loaded && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => testEvent(status.platform)}
                        className="h-6 px-2 text-xs"
                      >
                        Test
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Check browser console for detailed tracking logs
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};