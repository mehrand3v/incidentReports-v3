// src/features/daily-walk/NewDailyWalk.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/services/auth";
import {
  createInspection,
  initializeChecklistItems,
  getStores,
} from "@/services/dailyWalk";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  ClipboardCheck,
  Camera,
  AlertCircle,
} from "lucide-react";

const NewDailyWalk = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [stores, setStores] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    storeId: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
    items: initializeChecklistItems(),
    correctedBy: "",
  });

  // Load the current user and available stores
  useEffect(() => {
    const loadUserAndStores = async () => {
      setLoading(true);
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          navigate("/login");
          return;
        }
        setUser(currentUser);

        // Load stores for dropdown
        const storesList = await getStores();
        setStores(storesList);

        // If user has a default store, set it
        const userProfile = currentUser?.storeId;
        if (
          userProfile &&
          storesList.some((store) => store.id === userProfile)
        ) {
          setFormData((prev) => ({ ...prev, storeId: userProfile }));
        }
      } catch (error) {
        console.error("Error loading data:", error);
        // toast({
        //   title: "Error",
        //   description: "Failed to load initial data. Please try again.",
        //   variant: "destructive",
          // });
          toast.error("Title: Description");
      } finally {
        setLoading(false);
      }
    };

    loadUserAndStores();
  }, [navigate, toast]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle store selection
  const handleStoreChange = (value) => {
    setFormData((prev) => ({ ...prev, storeId: value }));
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
    // Check if store is selected
    if (!formData.storeId) return false;

    // Check if all items have been answered (passed = true or false)
    const allItemsAnswered = formData.items.every(
      (item) => item.passed !== null
    );

    return allItemsAnswered;
  };

  // Check if there are any failed items that need fixing
  const hasFailedItems = formData.items.some((item) => item.passed === false);

  // Save inspection as draft
  const saveAsDraft = async () => {
    try {
      setSaving(true);
      const result = await createInspection({
        ...formData,
        status: "draft",
      });

      toast({
        title: "Draft Saved",
        description: "Your inspection has been saved as a draft.",
      });

      navigate(`/daily-walk/${result.id}/edit`);
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
      const result = await createInspection({
        ...formData,
        status: "completed",
      });

      toast({
        title: "Inspection Submitted",
        description: "Your inspection has been successfully submitted.",
      });

      navigate(`/daily-walk/${result.id}`);
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
        <p className="mt-4 text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl">
            New Daily Walk Inspection
          </CardTitle>
          <CardDescription className="text-sm">
            Complete the form below to conduct a new store inspection
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Store Selection */}
            <div>
              <Label htmlFor="store" className="text-sm font-medium">
                Store Number
              </Label>
              <Select
                value={formData.storeId}
                onValueChange={handleStoreChange}
              >
                <SelectTrigger className="mt-1 h-10">
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name || `Store #${store.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            {/* Inspector */}
            <div>
              <Label htmlFor="inspector" className="text-sm font-medium">
                Inspected By
              </Label>
              <Input
                type="text"
                id="inspector"
                value={user?.displayName || user?.email || ""}
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
                value={formData.correctedBy}
                onChange={handleInputChange}
                placeholder="Name of person who fixed the issues"
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-3">
          {/* Draft Button */}
          <Button
            variant="outline"
            onClick={saveAsDraft}
            disabled={saving || !formData.storeId}
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
                Save as Draft
              </>
            )}
          </Button>

          {/* Submit Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-full sm:w-auto order-1 sm:order-2">
                  <Button
                    onClick={submitInspection}
                    disabled={saving || !isFormValid()}
                    className="w-full sm:w-auto"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Submit Inspection
                      </>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {!isFormValid() && (
                <TooltipContent>
                  <p>Please complete all required fields</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewDailyWalk;
