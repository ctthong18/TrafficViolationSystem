"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { VehiclesApi, CitizenApi, Configuration, VehicleCreate, VehicleResponse } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { Car, Plus, Eye, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function MyVehiclesPage() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<VehicleCreate>({
    license_plate: "",
    vehicle_type: "CAR",
    vehicle_brand: "",
    vehicle_color: "",
    owner_name: "",
    owner_identification: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, [token]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const citizenApi = new CitizenApi(config);
      const { data } = await citizenApi.getMyVehiclesApiV1CitizenMyVehiclesGet();
      setVehicles(data || []);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async () => {
    try {
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const citizenApi = new CitizenApi(config);
      await citizenApi.registerVehicleApiV1CitizenVehiclesPost(newVehicle);
      toast.success("Vehicle registered successfully");
      setIsCreateDialogOpen(false);
      setNewVehicle({
        license_plate: "",
        vehicle_type: "CAR",
        vehicle_brand: "",
        vehicle_color: "",
        owner_name: "",
        owner_identification: "",
      });
      fetchVehicles();
    } catch (error: any) {
      console.error("Failed to register vehicle:", error);
      toast.error(error.response?.data?.detail || "Failed to register vehicle");
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    try {
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const vehiclesApi = new VehiclesApi(config);
      await vehiclesApi.deleteVehicleApiV1VehiclesVehicleIdDelete(vehicleId);
      toast.success("Vehicle deleted successfully");
      fetchVehicles();
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
      toast.error("Failed to delete vehicle");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Vehicles</h1>
          <p className="text-muted-foreground">Manage your registered vehicles</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Register Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Register New Vehicle</DialogTitle>
              <DialogDescription>
                Add a new vehicle to your account. All fields are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="license_plate">License Plate *</Label>
                <Input
                  id="license_plate"
                  placeholder="e.g., 30A-12345"
                  value={newVehicle.license_plate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, license_plate: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vehicle_type">Vehicle Type *</Label>
                <Select
                  value={newVehicle.vehicle_type}
                  onValueChange={(value) => setNewVehicle({ ...newVehicle, vehicle_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">Car</SelectItem>
                    <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                    <SelectItem value="TRUCK">Truck</SelectItem>
                    <SelectItem value="BUS">Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Honda, Toyota"
                  value={newVehicle.vehicle_brand}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_brand: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Color *</Label>
                <Input
                  id="color"
                  placeholder="e.g., White, Black"
                  value={newVehicle.vehicle_color}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_color: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="owner_name">Owner Full Name *</Label>
                <Input
                  id="owner_name"
                  placeholder="John Doe"
                  value={newVehicle.owner_name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, owner_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="owner_identification">Owner ID Number *</Label>
                <Input
                  id="owner_identification"
                  placeholder="ID12345678"
                  value={newVehicle.owner_identification}
                  onChange={(e) => setNewVehicle({ ...newVehicle, owner_identification: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateVehicle}>Register Vehicle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{vehicles.length}</div>
          <p className="text-xs text-muted-foreground">
            Registered vehicles in your account
          </p>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles List</CardTitle>
          <CardDescription>
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vehicles registered</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Register your first vehicle to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Register Vehicle
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Registered Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono font-bold text-lg">
                      {vehicle.license_plate}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {vehicle.vehicle_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {vehicle.vehicle_brand}
                    </TableCell>
                    <TableCell>{vehicle.vehicle_color}</TableCell>
                    <TableCell>
                      {vehicle.registration_date
                        ? new Date(vehicle.registration_date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/citizen/vehicles/${vehicle.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
