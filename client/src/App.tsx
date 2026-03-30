import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";
import { AppInstallBanner } from "@/components/AppInstallBanner";

// Pages
import HomePage from "@/pages/HomePage";
import SermonsPage from "@/pages/SermonsPage";
import SermonDetailPage from "@/pages/SermonDetailPage";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import PrayerPage from "@/pages/PrayerPage";
import GivePage from "@/pages/GivePage";
import AuthPage from "@/pages/login"; // This is our combined auth page
import LogoutPage from "@/pages/logout";
import RegisterChurchPage from "@/pages/RegisterChurchPage";
import AuthCallbackPage from "@/pages/auth/callback";
import DashboardPage from "@/pages/DashboardPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AttendanceHistoryPage from "@/pages/AttendanceHistoryPage";
import AttendanceAnalyticsPage from "@/pages/AttendanceAnalyticsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import CheckinPage from "@/pages/CheckinPage";
import QRScannerPage from "@/pages/QRScannerPage";
import AbsentMembersPage from "@/pages/AbsentMembersPage";
import MembersPage from "@/pages/MembersPage";
import PrivacyPage from "@/pages/PrivacyPage";
import MessagesPage from "@/pages/MessagesPage";
import DevotionalsPage from "@/pages/DevotionalsPage";
import LiveStreamPage from "@/pages/LiveStreamPage";
import AdminLiveStreamPage from "@/pages/AdminLiveStreamPage";
import VolunteerPage from "@/pages/VolunteerPage";
import HouseCellsPage from "@/pages/HouseCellsPage";
import MusicPage from "@/pages/MusicPage";
import GroupsPage from "@/pages/GroupsPage";
import BiblePage from "@/pages/BiblePage";
import DiscipleshipPage from "@/pages/DiscipleshipPage";
import SuperAdminPage from "@/pages/SuperAdminPage";
import SermonClipGeneratorPage from "@/pages/SermonClipGeneratorPage";
import SocialFeedPage from "@/pages/SocialFeedPage";
import CelebrationsPage from "@/pages/CelebrationsPage";
import { useWebSocket } from "@/hooks/use-websocket";
import LanguageSettingsPage from "@/pages/LanguageSettingsPage";
import StaffDirectoryPage from "@/pages/StaffDirectoryPage";
import { LanguageProvider } from "@/hooks/use-language";

import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function Router() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  console.log('[Router] Rendering, isLoading:', isLoading, 'user:', user);

  if (isLoading) {
    console.log('[Router] Showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // SuperAdmin Exclusivity logic
  if (user?.isSuperAdmin) {
    if (location !== "/super-admin" && location !== "/logout") {
      return <Redirect to="/super-admin" />;
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Switch>
          <Route path="/super-admin" component={SuperAdminPage} />
          <Route path="/logout" component={LogoutPage} />
          {user?.isSuperAdmin ? (
            <Route component={() => <Redirect to="/super-admin" />} />
          ) : (
            <>
              <Route path="/" component={HomePage} />
              <Route path="/sermons" component={SermonsPage} />
              <Route path="/sermons/:id" component={SermonDetailPage} />
              <Route path="/events" component={EventsPage} />
              <Route path="/events/:id" component={EventDetailPage} />
              <Route path="/prayer" component={PrayerPage} />
              <Route path="/give" component={GivePage} />
              <Route path="/login" component={AuthPage} />
              <Route path="/register-church" component={RegisterChurchPage} />
              <Route path="/auth/callback" component={AuthCallbackPage} />
              <Route path="/dashboard" component={DashboardPage} />
              <Route path="/admin" component={AdminDashboardPage} />
              <Route path="/attendance" component={AttendanceHistoryPage} />
              <Route path="/attendance/analytics" component={AttendanceAnalyticsPage} />
              <Route path="/analytics" component={AnalyticsPage} />
              <Route path="/attendance/checkin" component={CheckinPage} />
              <Route path="/attendance/scan" component={QRScannerPage} />
              <Route path="/attendance/absent" component={AbsentMembersPage} />
              <Route path="/members" component={MembersPage} />
              <Route path="/staff" component={StaffDirectoryPage} />
              <Route path="/devotionals" component={DevotionalsPage} />
              <Route path="/live" component={LiveStreamPage} />
              <Route path="/admin/live-stream/new" component={AdminLiveStreamPage} />
              <Route path="/volunteer" component={VolunteerPage} />
              <Route path="/music" component={MusicPage} />
              <Route path="/house-cells" component={HouseCellsPage} />
              <Route path="/groups" component={GroupsPage} />
              <Route path="/bible" component={BiblePage} />
              <Route path="/discipleship" component={DiscipleshipPage} />
              <Route path="/admin/sermon-clips" component={SermonClipGeneratorPage} />
              <Route path="/feed" component={SocialFeedPage} />
              <Route path="/celebrations" component={CelebrationsPage} />
              <Route path="/privacy" component={PrivacyPage} />
              <Route path="/messages" component={MessagesPage} />
              <Route path="/settings/language" component={LanguageSettingsPage} />
              <Route component={NotFound} />
            </>
          )}
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function AppContent() {
  // WebSocket disabled for now - can be enabled when backend WebSocket is properly configured
  // useWebSocket();

  return (
    <LanguageProvider>
      <TooltipProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </TooltipProvider>
    </LanguageProvider>
  );
}

function App() {
  return (
    <HelmetProvider>
      <div className="w-full min-h-screen">
        <QueryClientProvider client={queryClient}>
          <AppContent />
          <AppInstallBanner />
        </QueryClientProvider>
      </div>
    </HelmetProvider>
  );
}

export default App;
