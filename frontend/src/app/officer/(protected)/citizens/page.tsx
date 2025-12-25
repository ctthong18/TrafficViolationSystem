"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminApi,
  Configuration,
  UserResponse,
  Role,
} from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Filter,
  Users,
  Eye,
  CreditCard,
  Mail,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import CitizenDetailDialog from "./CitizenDetailDialog";

export default function CitizensPage() {
  const { token } = useAuth();
  const [citizens, setCitizens] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);

  // Dialog state
  const [selectedCitizen, setSelectedCitizen] = useState<UserResponse | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchCitizens();
  }, [token, page]);

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const adminApi = new AdminApi(config);

      const { data } = await adminApi.getAllUsersApiV1AdminUsersGet(
        page * limit,
        limit,
        Role.Citizen,
        true // active only for officer search maybe? or all
      );

      setCitizens(data.users || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch citizens:", error);
      toast.error("Failed to load citizens directory");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    // Since the API doesn't support search by name directly in list users, 
    // we might need to filter client-side or if the API allows it (the docs didn't show it).
    // Let's assume for now we list all and user can find in current page or we could try to implement search if API supports it.
    fetchCitizens();
  };

  const handleViewDetails = (citizen: UserResponse) => {
    setSelectedCitizen(citizen);
    setIsDetailDialogOpen(true);
  };

  // Filter citizens based on search term (client-side for now)
  const filteredCitizens = citizens.filter(c =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.identification_number?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Citizen Directory</h1>
          <p className="text-muted-foreground">
            Search and view citizen profiles, license details, and violation history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            Total: {total}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Find Citizen</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, ID number, or email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Citizens Table */}
      <Card className="border-none shadow-xl bg-card/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Register of Citizens</CardTitle>
          <CardDescription>
            {loading ? "Accessing records..." : `Showing ${filteredCitizens.length} citizens`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Citizen Name</TableHead>
                  <TableHead>Identification</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Loading records...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCitizens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      No citizens found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCitizens.map((citizen) => (
                    <TableRow key={citizen.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserRound className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{citizen.full_name}</p>
                            <p className="text-xs text-muted-foreground">@{citizen.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{citizen.identification_number}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {citizen.email}
                          </div>
                          {citizen.phone_number && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground leading-none">📞</span>
                              {citizen.phone_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={citizen.is_active ? "default" : "secondary"} className="rounded-full px-3">
                          {citizen.is_active ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(citizen)}
                          className="hover:bg-primary/10 hover:text-primary rounded-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page + 1} of {Math.ceil(total / limit)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * limit >= total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CitizenDetailDialog
        citizen={selectedCitizen}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </div>
  );
}
