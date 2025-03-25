// src/features/daily-walk/DailyWalkLayout.jsx
import { Outlet } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "react-router-dom";
import { ClipboardList, PlusCircle, BarChart4 } from "lucide-react";

const DailyWalkLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (currentPath.includes("/new")) return "new";
    if (currentPath.includes("/stats")) return "stats";
    return "list";
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          CSR Daily Walk
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Monitor and track store cleanliness and compliance
        </p>
      </div>

      <Tabs defaultValue={getActiveTab()} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" asChild>
            <Link
              to="/daily-walk"
              className="flex items-center justify-center gap-1 sm:gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Inspections</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="new" asChild>
            <Link
              to="/daily-walk/new"
              className="flex items-center justify-center gap-1 sm:gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="text-xs sm:text-sm">New</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="stats" asChild>
            <Link
              to="/daily-walk/stats"
              className="flex items-center justify-center gap-1 sm:gap-2"
            >
              <BarChart4 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Analytics</span>
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-white rounded-lg shadow">
        <Outlet />
      </div>
    </div>
  );
};

export default DailyWalkLayout;
