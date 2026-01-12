import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Plus, Trash2, Navigation } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function SavedLocations() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    category: "favorite",
    notes: "",
  });

  const { data: savedLocations, refetch } = trpc.savedLocations.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const addLocation = trpc.savedLocations.add.useMutation({
    onSuccess: () => {
      toast.success("Location saved successfully");
      setIsAddDialogOpen(false);
      setNewLocation({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        category: "favorite",
        notes: "",
      });
      refetch();
    },
    onError: () => {
      toast.error("Failed to save location");
    },
  });

  const deleteLocation = trpc.savedLocations.delete.useMutation({
    onSuccess: () => {
      toast.success("Location deleted");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete location");
    },
  });

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude) {
      toast.error("Please fill in all required fields");
      return;
    }

    addLocation.mutate(newLocation);
  };

  const handleNavigateToLocation = (lat: string, lng: string, name: string) => {
    setLocation(`/?destination=${lat},${lng}&name=${encodeURIComponent(name)}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-2 max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Sign In Required</CardTitle>
            <CardDescription className="text-base">
              Please sign in to manage your saved locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="w-full min-h-[3rem] text-lg"
              size="lg"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setLocation("/")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-8 h-8" />
            </Button>
            <h1 className="text-2xl font-bold">Saved Locations</h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="lg"
                className="min-h-[3rem]"
              >
                <Plus className="w-6 h-6 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Location</DialogTitle>
                <DialogDescription className="text-base">
                  Save a location for quick access later
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">
                    Location Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Home, Office, Hospital"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    className="text-base min-h-[3rem]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base">
                    Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="Full address"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                    className="text-base min-h-[3rem]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-base">
                      Latitude *
                    </Label>
                    <Input
                      id="latitude"
                      placeholder="22.3193"
                      value={newLocation.latitude}
                      onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })}
                      className="text-base min-h-[3rem]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-base">
                      Longitude *
                    </Label>
                    <Input
                      id="longitude"
                      placeholder="114.1694"
                      value={newLocation.longitude}
                      onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })}
                      className="text-base min-h-[3rem]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-base">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    placeholder="Additional information"
                    value={newLocation.notes}
                    onChange={(e) => setNewLocation({ ...newLocation, notes: e.target.value })}
                    className="text-base min-h-[3rem]"
                  />
                </div>
                <Button
                  onClick={handleAddLocation}
                  disabled={addLocation.isPending}
                  className="w-full min-h-[3rem] text-lg"
                  size="lg"
                >
                  Save Location
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8">
        {!savedLocations || savedLocations.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No Saved Locations</h2>
              <p className="text-base text-muted-foreground mb-6">
                Add your frequently visited places for quick access
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                size="lg"
                className="min-h-[3rem] text-lg"
              >
                <Plus className="w-6 h-6 mr-2" />
                Add Your First Location
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedLocations.map((location) => (
              <Card key={location.id} className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-start justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-primary" />
                      {location.name}
                    </span>
                  </CardTitle>
                  {location.address && (
                    <CardDescription className="text-base">
                      {location.address}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {location.notes && (
                    <p className="text-sm text-muted-foreground">{location.notes}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleNavigateToLocation(
                        location.latitude,
                        location.longitude,
                        location.name
                      )}
                      variant="default"
                      size="lg"
                      className="flex-1 min-h-[3rem]"
                    >
                      <Navigation className="w-5 h-5 mr-2" />
                      Navigate
                    </Button>
                    <Button
                      onClick={() => deleteLocation.mutate({ locationId: location.id })}
                      variant="destructive"
                      size="lg"
                      className="min-h-[3rem]"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
