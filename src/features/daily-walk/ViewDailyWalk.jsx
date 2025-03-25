// src/features/daily-walk/ViewDailyWalk.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getInspectionById, getStores } from "@/services/dailyWalk";

// Import UI components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  Edit,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  CalendarIcon,
  Building2,
  User,
  CheckCheck,
  ClipboardCheck,
  Store,
} from "lucide-react";

const ViewDailyWalk = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState(null);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInspection = async () => {
      setLoading(true);
      try {
        // Load stores for reference
        const storesList = await getStores();
        setStores(storesList);

        // Load the specific inspection
        const inspectionData = await getInspectionById(inspectionId);
        setInspection(inspectionData);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError(
          "Failed to load inspection. It may have been deleted or you do not have permission to view it."
        );
        toast.error("Error", {
          description: "Failed to load inspection details.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInspection();
  }, [inspectionId]); // Removed toast from dependencies

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

  // Get store name from store ID
  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name || `Store #${storeId}` : `Store #${storeId}`;
  };

  // Calculate statistics
  const calculateStats = (items) => {
    if (!items || !Array.isArray(items))
      return { total: 0, passed: 0, failed: 0, fixed: 0 };

    const total = items.length;
    const passed = items.filter((item) => item.passed === true).length;
    const failed = items.filter((item) => item.passed === false).length;
    const fixed = items.filter((item) => item.fixed === true).length;

    return { total, passed, failed, fixed };
  };

  // Get status badge
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Loading inspection details...
        </p>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Inspection Not Found</h2>
        <p className="text-center text-muted-foreground mb-6">
          {error || "The requested inspection could not be found."}
        </p>
        <Button asChild>
          <Link to="/daily-walk">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inspections
          </Link>
        </Button>
      </div>
    );
  }

  const stats = calculateStats(inspection.items);

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/daily-walk")}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>

        {inspection.status === "draft" && (
          <Button size="sm" asChild className="w-full sm:w-auto">
            <Link to={`/daily-walk/${inspectionId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Inspection
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl sm:text-2xl">
                  Inspection Report
                </CardTitle>
                {getStatusBadge(inspection.status)}
              </div>
              <CardDescription className="text-sm mt-1">
                Completed on{" "}
                {formatDate(inspection.createdAt || inspection.date)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Inspection Details */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Store className="h-3 w-3" />
                <span>Store</span>
              </div>
              <p className="text-sm sm:text-base font-medium truncate">
                {getStoreName(inspection.storeId)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span>Date</span>
              </div>
              <p className="text-sm sm:text-base font-medium">
                {formatDate(inspection.createdAt || inspection.date)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Time</span>
              </div>
              <p className="text-sm sm:text-base font-medium">
                {inspection.time || "Not specified"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Inspector</span>
              </div>
              <p className="text-sm sm:text-base font-medium truncate">
                {inspection.inspectedBy?.name || "Unknown"}
              </p>
            </div>
          </div>

          <Separator className="my-3 sm:my-4" />

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="shadow-sm">
              <CardContent className="p-3 flex flex-col items-center justify-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Total Items
                </p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3 flex flex-col items-center justify-center bg-green-50">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <p className="text-xs sm:text-sm text-green-600">Passed</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {stats.passed}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3 flex flex-col items-center justify-center bg-red-50">
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-600" />
                  <p className="text-xs sm:text-sm text-red-600">Failed</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">
                  {stats.failed}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3 flex flex-col items-center justify-center bg-amber-50">
                <div className="flex items-center gap-1">
                  <CheckCheck className="h-3 w-3 text-amber-600" />
                  <p className="text-xs sm:text-sm text-amber-600">Fixed</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                  {stats.fixed}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-3 sm:my-4" />

          {/* Mobile Inspection Items List */}
          <div className="block md:hidden space-y-3">
            <h3 className="text-sm font-medium mb-2">
              Inspection Items ({stats.total})
            </h3>
            {inspection.items.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-md border ${
                  item.passed === false && !item.fixed
                    ? "bg-red-50 border-red-200"
                    : item.passed === true
                    ? "bg-green-50 border-green-200"
                    : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium">
                    {item.id}. {item.description}
                  </h4>
                  <div className="flex items-center gap-1">
                    {item.passed === true ? (
                      <div className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Pass</span>
                      </div>
                    ) : item.passed === false ? (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <XCircle className="h-4 w-4" />
                        <span>Fail</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">N/A</span>
                    )}
                  </div>
                </div>

                {item.passed === false && (
                  <div className="flex items-center gap-1 text-xs mb-1">
                    <span className="font-medium">Fixed:</span>
                    {item.fixed ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        <CheckCheck className="h-3 w-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> No
                      </span>
                    )}
                  </div>
                )}

                {item.comments && (
                  <div className="mt-1 text-xs border-t pt-1 border-gray-200">
                    <span className="font-medium">Comments:</span>{" "}
                    {item.comments}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Inspection Items Table */}
          <div className="hidden md:block">
            <Table>
              <TableCaption>
                Inspection completed by{" "}
                {inspection.inspectedBy?.name || "Unknown"}
                {inspection.correctedBy &&
                  ` | Items corrected by ${inspection.correctedBy}`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24 text-center">Status</TableHead>
                  <TableHead className="w-24 text-center">Fixed</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspection.items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={
                      item.passed === false && !item.fixed
                        ? "bg-red-50"
                        : item.passed === true
                        ? "bg-green-50/30"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">
                      {item.passed === true ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : item.passed === false ? (
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.passed === false && item.fixed ? (
                        <CheckCircle2 className="h-5 w-5 text-amber-500 mx-auto" />
                      ) : item.passed === false ? (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.comments ? (
                        item.comments
                      ) : (
                        <span className="text-muted-foreground">
                          No comments
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/daily-walk")}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>

          {inspection.status === "draft" && (
            <Button asChild className="w-full sm:w-auto order-1 sm:order-2">
              <Link to={`/daily-walk/${inspectionId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Inspection
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ViewDailyWalk;
