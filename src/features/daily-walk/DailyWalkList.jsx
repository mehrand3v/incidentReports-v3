// src/features/daily-walk/DailyWalkList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInspections, getStores } from "@/services/dailyWalk";

// Import UI components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  Eye,
  Edit,
  PlusCircle,
  AlertTriangle,
  Calendar,
  Store,
  User,
} from "lucide-react";

const DailyWalkList = () => {
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const storesList = await getStores();
        setStores(storesList);

        const inspectionsList = await getInspections();
        setInspections(inspectionsList);
      } catch (error) {
        console.error("Error loading inspections:", error);
        toast.error("Error", {
          description: "Failed to load inspections. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Removed toast from dependencies

  // Filter inspections based on selected store and search term
  const filteredInspections = inspections
    .filter(
      (inspection) =>
        !selectedStore === "all" || inspection.storeId === selectedStore
    )
    .filter((inspection) => {
      if (!searchTerm) return true;

      // Search in store name or date
      const searchLower = searchTerm.toLowerCase();
      const storeMatch = stores
        .find((s) => s.id === inspection.storeId)
        ?.name?.toLowerCase()
        .includes(searchLower);
      const dateMatch = inspection.date
        ? new Date(inspection.date).toLocaleDateString().includes(searchTerm)
        : false;
      const inspectorMatch = inspection.inspectedBy?.name
        ?.toLowerCase()
        .includes(searchLower);

      return storeMatch || dateMatch || inspectorMatch;
    });

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    // Handle Firestore timestamps
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "reviewed":
        return <Badge className="bg-blue-500">Reviewed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get store name from store ID
  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name || `Store #${storeId}` : `Store #${storeId}`;
  };

  // Handle store filter change
  const handleStoreChange = (value) => {
    setSelectedStore(value === "all" ? "" : value);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading inspections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between p-4 space-y-3 sm:space-y-0 sm:pb-2">
          <div>
            <CardTitle className="text-xl sm:text-2xl">
              Daily Walk Inspections
            </CardTitle>
            <CardDescription className="text-sm">
              View and manage all store inspections
            </CardDescription>
          </div>
          <Button asChild className="sm:ml-auto">
            <Link to="/daily-walk/new" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Inspection
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="p-4">
          {/* Filters and Search */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="w-full">
              <Label htmlFor="storeFilter" className="text-sm font-medium">
                Filter by Store
              </Label>
              <Select value={selectedStore} onValueChange={handleStoreChange}>
                <SelectTrigger id="storeFilter" className="mt-1 h-10">
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name || `Store #${store.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Label htmlFor="search" className="text-sm font-medium">
                Search
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by store, date, or inspector..."
                  className="pl-8 h-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden space-y-3">
            {filteredInspections.length > 0 ? (
              filteredInspections.map((inspection) => (
                <Card key={inspection.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-sm font-semibold truncate">
                          {getStoreName(inspection.storeId)}
                        </h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDate(
                                inspection.createdAt || inspection.date
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>
                              {inspection.inspectedBy?.name || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(inspection.status)}
                    </div>

                    <div className="flex justify-end gap-2 mt-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/daily-walk/${inspection.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                      </Button>

                      {inspection.status === "draft" && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/daily-walk/${inspection.id}/edit`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border rounded-md bg-muted/20">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No inspections found</h3>
                <p className="text-center text-muted-foreground mt-1 text-sm">
                  {searchTerm || selectedStore
                    ? "Try changing your search or filter criteria"
                    : "Create your first inspection to get started"}
                </p>
                <Button asChild className="mt-4">
                  <Link to="/daily-walk/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Inspection
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            {filteredInspections.length > 0 ? (
              <Table>
                <TableCaption>List of daily walk inspections</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInspections.map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell>
                        {formatDate(inspection.createdAt || inspection.date)}
                      </TableCell>
                      <TableCell>{getStoreName(inspection.storeId)}</TableCell>
                      <TableCell>
                        {inspection.inspectedBy?.name || "Unknown"}
                      </TableCell>
                      <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/daily-walk/${inspection.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>

                          {inspection.status === "draft" && (
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/daily-walk/${inspection.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-muted/20">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No inspections found</h3>
                <p className="text-center text-muted-foreground mt-1">
                  {searchTerm || selectedStore
                    ? "Try changing your search or filter criteria"
                    : "Create your first inspection to get started"}
                </p>
                <Button asChild className="mt-4">
                  <Link to="/daily-walk/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Inspection
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyWalkList;
