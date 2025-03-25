// src/features/daily-walk/DailyWalkStats.jsx
import React, { useState, useEffect } from "react";
import { getInspections, getStores } from "@/services/dailyWalk";

// Import UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart4,
} from "lucide-react";

const DailyWalkStats = () => {

  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState([]);
  const [stores, setStores] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    draft: 0,
    failedItems: 0,
    passedItems: 0,
    fixedItems: 0,
    storeStats: [],
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const storesList = await getStores();
        setStores(storesList);

        const inspectionsList = await getInspections();
        setInspections(inspectionsList);

        // Calculate stats
        const total = inspectionsList.length;
        const completed = inspectionsList.filter(
          (i) => i.status === "completed"
        ).length;
        const draft = inspectionsList.filter(
          (i) => i.status === "draft"
        ).length;

        let passedItems = 0;
        let failedItems = 0;
        let fixedItems = 0;

        // Store-specific stats
        const storeMap = {};

        inspectionsList.forEach((inspection) => {
          // Initialize store stats if not exists
          if (!storeMap[inspection.storeId]) {
            storeMap[inspection.storeId] = {
              storeId: inspection.storeId,
              name:
                storesList.find((s) => s.id === inspection.storeId)?.name ||
                `Store #${inspection.storeId}`,
              inspections: 0,
              passed: 0,
              failed: 0,
              fixed: 0,
            };
          }

          storeMap[inspection.storeId].inspections++;

          // Count item stats
          inspection.items?.forEach((item) => {
            if (item.passed === true) {
              passedItems++;
              storeMap[inspection.storeId].passed++;
            }
            if (item.passed === false) {
              failedItems++;
              storeMap[inspection.storeId].failed++;

              if (item.fixed) {
                fixedItems++;
                storeMap[inspection.storeId].fixed++;
              }
            }
          });
        });

        const storeStats = Object.values(storeMap);

        setStats({
          total,
          completed,
          draft,
          passedItems,
          failedItems,
          fixedItems,
          storeStats,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
        toast.error("Error", {
          description: "Failed to load analytics data.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getComplianceRate = (passed, total) => {
    if (total === 0) return 0;
    return Math.round((passed / total) * 100);
  };

  const getFixRate = (fixed, failed) => {
    if (failed === 0) return 0;
    return Math.round((fixed / failed) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl">
            Daily Walk Analytics
          </CardTitle>
          <CardDescription className="text-sm">
            Statistics and performance metrics for store inspections
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <p className="text-sm text-muted-foreground">
                  Total Inspections
                </p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                <div className="flex mt-1 gap-1 text-xs">
                  <Badge variant="outline" className="bg-green-100">
                    {stats.completed} Completed
                  </Badge>
                  <Badge variant="outline">{stats.draft} Draft</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <p className="text-3xl font-bold mt-1">
                  {getComplianceRate(
                    stats.passedItems,
                    stats.passedItems + stats.failedItems
                  )}
                  %
                </p>
                <div className="w-full mt-2">
                  <Progress
                    value={getComplianceRate(
                      stats.passedItems,
                      stats.passedItems + stats.failedItems
                    )}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <p className="text-sm text-muted-foreground">Items Checked</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.passedItems + stats.failedItems}
                </p>
                <div className="flex mt-1 gap-1 text-xs">
                  <div className="flex items-center">
                    <CheckCircle2 className="text-green-500 h-3 w-3 mr-1" />
                    <span>{stats.passedItems} Passed</span>
                  </div>
                  <div className="flex items-center ml-2">
                    <XCircle className="text-red-500 h-3 w-3 mr-1" />
                    <span>{stats.failedItems} Failed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <p className="text-sm text-muted-foreground">Fix Rate</p>
                <p className="text-3xl font-bold mt-1">
                  {getFixRate(stats.fixedItems, stats.failedItems)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.fixedItems} of {stats.failedItems} issues fixed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Store Performance */}
          {stats.storeStats.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Store Performance</h3>
              <div className="space-y-4">
                {stats.storeStats.map((store) => (
                  <Card key={store.storeId}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between mb-2">
                        <h4 className="font-medium">{store.name}</h4>
                        <span className="text-sm text-muted-foreground">
                          {store.inspections} Inspections
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Compliance Rate
                          </p>
                          <div className="flex items-center mt-1">
                            <p className="font-medium">
                              {getComplianceRate(
                                store.passed,
                                store.passed + store.failed
                              )}
                              %
                            </p>
                            <Progress
                              value={getComplianceRate(
                                store.passed,
                                store.passed + store.failed
                              )}
                              className="h-2 ml-2 flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Items Checked
                          </p>
                          <p className="font-medium mt-1">
                            {store.passed + store.failed}
                          </p>
                          <div className="flex text-xs gap-2 mt-1">
                            <span className="text-green-600">
                              {store.passed} Pass
                            </span>
                            <span className="text-red-600">
                              {store.failed} Fail
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Fix Rate
                          </p>
                          <p className="font-medium mt-1">
                            {getFixRate(store.fixed, store.failed)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {store.fixed} of {store.failed} fixed
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border rounded-md text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
              <h3 className="font-medium">No Statistics Available</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Complete more inspections to view analytics
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyWalkStats;
