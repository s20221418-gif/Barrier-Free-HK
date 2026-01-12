import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useLocation } from "wouter";

export default function Settings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [fontSize, setFontSize] = useState<"normal" | "large" | "extra-large">(
    user?.fontSize || "large"
  );
  const [highContrast, setHighContrast] = useState(user?.highContrast ?? true);
  const [voiceNavigation, setVoiceNavigation] = useState(user?.voiceNavigation ?? true);

  const updatePreferences = trpc.auth.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully");
      // Apply font size immediately
      document.body.classList.remove("font-size-normal", "font-size-large", "font-size-extra-large");
      document.body.classList.add(`font-size-${fontSize}`);
      
      // Apply high contrast
      if (highContrast) {
        document.body.classList.add("high-contrast");
      } else {
        document.body.classList.remove("high-contrast");
      }
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  const handleSave = () => {
    updatePreferences.mutate({
      fontSize,
      highContrast,
      voiceNavigation,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setLocation("/")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-8 h-8" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 max-w-3xl">
        <div className="space-y-6">
          {/* Font Size */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Text Size</CardTitle>
              <CardDescription className="text-base">
                Choose a comfortable text size for reading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={fontSize} onValueChange={(value: any) => setFontSize(value)}>
                <div className="flex items-center space-x-4 p-4 border-2 border-border rounded-lg hover:bg-accent/10 transition-colors">
                  <RadioGroupItem value="normal" id="normal" className="w-6 h-6" />
                  <Label htmlFor="normal" className="text-base cursor-pointer flex-1">
                    Normal (16px)
                  </Label>
                </div>
                <div className="flex items-center space-x-4 p-4 border-2 border-border rounded-lg hover:bg-accent/10 transition-colors">
                  <RadioGroupItem value="large" id="large" className="w-6 h-6" />
                  <Label htmlFor="large" className="text-lg cursor-pointer flex-1">
                    Large (20px) - Recommended
                  </Label>
                </div>
                <div className="flex items-center space-x-4 p-4 border-2 border-border rounded-lg hover:bg-accent/10 transition-colors">
                  <RadioGroupItem value="extra-large" id="extra-large" className="w-6 h-6" />
                  <Label htmlFor="extra-large" className="text-xl cursor-pointer flex-1">
                    Extra Large (24px)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* High Contrast */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">High Contrast Mode</CardTitle>
              <CardDescription className="text-base">
                Increase contrast for better visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border-2 border-border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="high-contrast" className="text-base font-semibold">
                    Enable High Contrast
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Makes text and elements more visible
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                  className="scale-125"
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice Navigation */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Voice Navigation</CardTitle>
              <CardDescription className="text-base">
                Hear spoken directions and route information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border-2 border-border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="voice-nav" className="text-base font-semibold">
                    Enable Voice Navigation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Provides audio guidance during navigation
                  </p>
                </div>
                <Switch
                  id="voice-nav"
                  checked={voiceNavigation}
                  onCheckedChange={setVoiceNavigation}
                  className="scale-125"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={updatePreferences.isPending}
            className="w-full min-h-[3.5rem] text-lg font-semibold"
            size="lg"
          >
            <Save className="w-6 h-6 mr-2" />
            Save Settings
          </Button>
        </div>
      </main>
    </div>
  );
}
