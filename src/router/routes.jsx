// src/router/appRoutes.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import RootLayout from "@/components/layout/RootLayout";

// Import Daily Walk components
import DailyWalkLayout from "@/features/daily-walk/DailyWalkLayout";
import DailyWalkList from "@/features/daily-walk/DailyWalkList";
import NewDailyWalk from "@/features/daily-walk/NewDailyWalk";
import ViewDailyWalk from "@/features/daily-walk/ViewDailyWalk";
import EditDailyWalk from "@/features/daily-walk/EditDailyWalk";
import DailyWalkStats from "@/features/daily-walk/DailyWalkStats";

const routes = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Root path redirects to daily-walk
      { index: true, element: <Navigate to="/daily-walk" /> },

      // Daily Walk Routes
      {
        path: "daily-walk",
        element: <DailyWalkLayout />,
        children: [
          { index: true, element: <DailyWalkList /> },
          { path: "new", element: <NewDailyWalk /> },
          { path: "stats", element: <DailyWalkStats /> },
          { path: ":inspectionId", element: <ViewDailyWalk /> },
          { path: ":inspectionId/edit", element: <EditDailyWalk /> },
        ],
      },

      // If someone manually navigates to a non-existent route
      { path: "*", element: <Navigate to="/daily-walk" /> },
    ],
  },
];

export default routes;
