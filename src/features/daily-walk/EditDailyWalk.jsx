// src/features/daily-walk/EditDailyWalk.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getInspectionById, updateInspection } from "@/services/dailyWalk";

// Import UI components from shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  ClipboardCheck,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

const EditDailyWalk = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  // Load the inspection data
  useEffect(() => {
    const loadInspection = async () => {
      setLoading(true);
      try {
        const inspectionData = await getInspectionById(inspectionId);

        // If not a draft, redirect to view page
        if (inspectionData.status !== "draft") {
          toast.error("Cannot Edit", {
            description: "Only draft inspections can be edited.",
          });
          navigate(`/daily-walk/${inspectionId}`);
          return;
        }

        setFormData(inspectionData);
      } catch (error) {
        console.error("Error loading inspection:", error);
        toast.error("Error", {
          description: "Failed to load inspection data.",
        });
        navigate("/daily-walk");
      } finally {
        setLoading(false);
      }
    };

    loadInspection();
  }, [inspectionId, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox item changes
  const handleItemChange = (itemId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Check if the form is valid for submission
  const isFormValid = () => {
    if (!formData) return false;

    // Check if all items have been answered (passed = true or false)
    const allItemsAnswered = formData.items.every(
      (item) => item.passed !== null
    );

    return allItemsAnswered;
  };

  // Check if there are any failed items that need fixing
  const hasFailedItems = formData?.items.some((item) => item.passed === false);

  // Save inspection as draft
  const saveAsDraft = async () => {
    try {
      setSaving(true);
      await updateInspection(inspectionId, {
        ...formData,
        status: "draft",
      });

      toast({
        title: "Draft Saved",
        description: "Your inspection has been updated.",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Submit the complete inspection
  const submitInspection = async () => {
    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await updateInspection(inspectionId, {
        ...formData,
        status: "completed",
      });

      toast({
        title: "Inspection Submitted",
        description: "Your inspection has been successfully submitted.",
      });

      navigate(`/daily-walk/${inspectionId}`);
    } catch (error) {
      console.error("Error submitting inspection:", error);
      toast({
        title: "Error",
        description: "Failed to submit inspection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading inspection...</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Inspection Not Found</h2>
        <p className="text-center text-muted-foreground mb-6">
          The requested inspection could not be found or you don't have
          permission to view it.
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

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <Button
        variant="outline"
        onClick={() => navigate(`/daily-walk/${inspectionId}`)}
        className="mb-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Cancel Editing
      </Button>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl">Edit Inspection</CardTitle>
          <CardDescription className="text-sm">
            Update your draft inspection before submitting
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Date */}
            <div>
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="mt-1 h-10"
              />
            </div>

            {/* Time */}
            <div>
              <Label htmlFor="time" className="text-sm font-medium">
                Time
              </Label>
              <Input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="mt-1 h-10"
              />
            </div>

            {/* Store - Disabled in edit mode */}
            <div>
              <Label htmlFor="store" className="text-sm font-medium">
                Store
              </Label>
              <Input
                type="text"
                id="store"
                value={formData.storeName || `Store #${formData.storeId}`}
                disabled
                className="mt-1 h-10"
              />
            </div>

            {/* Inspector - Disabled in edit mode */}
            <div>
              <Label htmlFor="inspector" className="text-sm font-medium">
                Inspected By
              </Label>
              <Input
                type="text"
                id="inspector"
                value={formData.inspectedBy?.name || ""}
                disabled
                className="mt-1 h-10"
              />
            </div>
          </div>

          {/* Mobile-optimized Checklist */}
          <div className="block md:hidden space-y-6">
            {formData.items.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border ${
                  item.passed === false && !item.fixed
                    ? "bg-red-50 border-red-200"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">
                    {item.id}. {item.description}
                  </h4>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <RadioGroup
                        value={
                          item.passed === true
                            ? "yes"
                            : item.passed === false
                            ? "no"
                            : ""
                        }
                        onValueChange={(value) =>
                          handleItemChange(item.id, "passed", value === "yes")
                        }
                        className="flex"
                      >
                        <div className="flex items-center gap-1">
                          <RadioGroupItem value="yes" id={`yes-${item.id}`} />
                          <label htmlFor={`yes-${item.id}`} className="text-sm">
                            Yes
                          </label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroup
                        value={
                          item.passed === true
                            ? "yes"
                            : item.passed === false
                            ? "no"
                            : ""
                        }
                        onValueChange={(value) =>
                          handleItemChange(
                            item.id,
                            "passed",
                            value === "yes" ? true : false
                          )
                        }
                        className="flex"
                      >
                        <div className="flex items-center gap-1">
                          <RadioGroupItem value="no" id={`no-${item.id}`} />
                          <label htmlFor={`no-${item.id}`} className="text-sm">
                            No
                          </label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {item.passed === false && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`fixed-${item.id}`}
                        checked={item.fixed}
                        onCheckedChange={(checked) =>
                          handleItemChange(item.id, "fixed", checked)
                        }
                        disabled={item.passed !== false}
                      />
                      <label htmlFor={`fixed-${item.id}`} className="text-sm">
                        Fixed
                      </label>
                    </div>
                  )}
                </div>
                <Textarea
                  placeholder="Add comments..."
                  value={item.comments}
                  onChange={(e) =>
                    handleItemChange(item.id, "comments", e.target.value)
                  }
                  className="h-10 min-h-0 text-sm"
                />
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableCaption>
                Complete all items to submit the inspection.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24 text-center">Yes</TableHead>
                  <TableHead className="w-24 text-center">No</TableHead>
                  <TableHead className="w-24 text-center">Fixed?</TableHead>
                  <TableHead className="w-48">Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={
                      item.passed === false && !item.fixed ? "bg-red-50" : ""
                    }
                  >
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">
                      <RadioGroup
                        value={
                          item.passed === true
                            ? "yes"
                            : item.passed === false
                            ? "no"
                            : ""
                        }
                        onValueChange={(value) =>
                          handleItemChange(item.id, "passed", value === "yes")
                        }
                        className="flex justify-center"
                      >
                        <RadioGroupItem value="yes" id={`yes-${item.id}`} />
                      </RadioGroup>
                    </TableCell>
                    <TableCell className="text-center">
                      <RadioGroup
                        value={
                          item.passed === true
                            ? "yes"
                            : item.passed === false
                            ? "no"
                            : ""
                        }
                        onValueChange={(value) =>
                          handleItemChange(
                            item.id,
                            "passed",
                            value === "yes" ? true : false
                          )
                        }
                        className="flex justify-center"
                      >
                        <RadioGroupItem value="no" id={`no-${item.id}`} />
                      </RadioGroup>
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={item.fixed}
                        onCheckedChange={(checked) =>
                          handleItemChange(item.id, "fixed", checked)
                        }
                        disabled={item.passed !== false}
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        placeholder="Add comments..."
                        value={item.comments}
                        onChange={(e) =>
                          handleItemChange(item.id, "comments", e.target.value)
                        }
                        className="h-10 min-h-0"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Corrected By Field */}
          {hasFailedItems && (
            <div className="mt-6">
              <Label htmlFor="correctedBy">Corrected By</Label>
              <Input
                type="text"
                id="correctedBy"
                name="correctedBy"
                value={formData.correctedBy || ""}
                onChange={handleInputChange}
                placeholder="Name of person who fixed the issues"
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-3">
          {/* Save Button */}
          <Button
            variant="outline"
            onClick={saveAsDraft}
            disabled={saving}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>

          {/* Submit Button */}
          <Button
            onClick={submitInspection}
            disabled={saving || !isFormValid()}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Complete Inspection
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditDailyWalk;
