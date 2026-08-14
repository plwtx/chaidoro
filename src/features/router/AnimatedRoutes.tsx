import { lazy, Suspense } from "react";
import { useLocation } from "react-router";
import { ROUTE_INDEX, ROUTE_FEATURE } from "@/router/routes";
import ProtectedRoute from "@/router/ProtectedRoute";
import FocusTimer from "@/features/focus-timer";
import Loading from "@/components/ui/loading";

const Statistics = lazy(() => import("@/features/statistics"));
const Settings = lazy(() => import("@/features/settings"));
const TaskManager = lazy(() => import("@/features/task-manager"));

const PAGES = [FocusTimer, Statistics, Settings, TaskManager];

function RouteFallback() {
  return (
    <div className="bg-brown-50 dark:bg-dark-600 flex h-screen w-full items-center justify-center">
      <Loading />
    </div>
  );
}

export default function AnimatedRoutes() {
  const { pathname } = useLocation();
  const Page = PAGES[ROUTE_INDEX[pathname] ?? 0];
  const feature = ROUTE_FEATURE[pathname];
  return (
    <Suspense fallback={<RouteFallback />}>
      {feature ? (
        <ProtectedRoute feature={feature}>
          <Page />
        </ProtectedRoute>
      ) : (
        <Page />
      )}
    </Suspense>
  );
}
