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
import { ThemeProvider } from "@/hooks/use-theme";

// Initialize Sentry for frontend error tracking
if (import.meta.env.VITE_SENTRY_DSN) {
  const Sentry = await import('@sentry/react');
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE || 'development',
    integrations: [
      new Sentry.BrowserTracing(),
    ],
    tracesSampleRate: 1.0,
  });
}

// Pages
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import BookmarksPage from "@/pages/BookmarksPage";
import ContactPage from "@/pages/ContactPage";
import BeliefsPage from "@/pages/BeliefsPage";
import SermonsPage from "@/pages/SermonsPage";
import SermonDetailPage from "@/pages/SermonDetailPage";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import PrayerPage from "@/pages/PrayerPage";
import GivePage from "@/pages/GivePage";
import GivingStatementPage from "@/pages/GivingStatementPage";
import AuthPage from "@/pages/login"; // This is our combined auth page
import LogoutPage from "@/pages/logout";
import RegisterChurchPage from "@/pages/RegisterChurchPage";
import AuthCallbackPage from "@/pages/auth/callback";
import PrayerRequestsPage from "@/pages/PrayerRequestsPage";
import DonationHistoryPage from "@/pages/DonationHistoryPage";
import BibleStudyPage from "@/pages/BibleStudyPage";
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
import YouthDashboardPage from "@/pages/YouthDashboardPage";
import ChildrenCheckinPage from "@/pages/ChildrenCheckinPage";
import DiscipleshipPage from "@/pages/DiscipleshipPage";
import SermonClipGeneratorPage from "@/pages/SermonClipGeneratorPage";
import SocialFeedPage from "@/pages/SocialFeedPage";
import MemberStoriesPage from "@/pages/MemberStoriesPage";
import SessionManagementPage from "@/pages/SessionManagementPage";
import CelebrationsPage from "@/pages/CelebrationsPage";
import { useWebSocket } from "@/hooks/use-websocket";
import LanguageSettingsPage from "@/pages/LanguageSettingsPage";
import StaffDirectoryPage from "@/pages/StaffDirectoryPage";
import ResourcesPage from "@/pages/ResourcesPage";
import BillingPage from "@/pages/BillingPage";
import TasksPage from "@/pages/TasksPage";
import NotificationsPage from "@/pages/NotificationsPage";
import BackupsPage from "@/pages/BackupsPage";
import CounselingPage from "@/pages/CounselingPage";
import WebhooksPage from "@/pages/WebhooksPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import CampusesPage from "@/pages/CampusesPage";
import MemberActivityPage from "@/pages/MemberActivityPage";
import SpiritualHealthPage from "@/pages/SpiritualHealthPage";
import CustomPagesPage from "@/pages/CustomPagesPage";
import EmailTemplatesPage from "@/pages/EmailTemplatesPage";
import SermonManagerPage from "@/pages/SermonManagerPage";
import EventManagerPage from "@/pages/EventManagerPage";
import ChurchMapPage from "@/pages/ChurchMapPage";
import AuditLogsPage from "@/pages/AuditLogsPage";
import FinancialReportsPage from "@/pages/FinancialReportsPage";
import UserManagementPage from "@/pages/UserManagementPage";
import SystemSettingsPage from "@/pages/SystemSettingsPage";
import DonationReceiptsPage from "@/pages/DonationReceiptsPage";
import SermonNotesPage from "@/pages/SermonNotesPage";
import ZoomIntegrationPage from "@/pages/ZoomIntegrationPage";
import PaymentGatewayPage from "@/pages/PaymentGatewayPage";
import ContentModerationPage from "@/pages/ContentModerationPage";
import EventRemindersPage from "@/pages/EventRemindersPage";
import { LanguageProvider } from "@/hooks/use-language";

import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LuLoader2 } from 'react-icons/lu';

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
          {/* Always-accessible routes (no auth restriction) */}
          <Route path="/login" component={AuthPage} />
          <Route path="/logout" component={LogoutPage} />
          <Route path="/register-church" component={RegisterChurchPage} />
          <Route path="/auth/callback" component={AuthCallbackPage} />
          <Route path="/privacy" component={PrivacyPage} />

          {/* Regular app routes */}
          <>
            <Route path="/" component={HomePage} />
              <Route path="/about" component={AboutPage} />
              <Route path="/contact" component={ContactPage} />
              <Route path="/beliefs" component={BeliefsPage} />
              <Route path="/sermons" component={SermonsPage} />
              <Route path="/bookmarks" component={BookmarksPage} />
              <Route path="/sermons/:id" component={SermonDetailPage} />
              <Route path="/events" component={EventsPage} />
              <Route path="/events/:id" component={EventDetailPage} />
              <Route path="/prayer" component={PrayerPage} />
              <Route path="/give" component={GivePage} />
              <Route path="/giving-statement" component={GivingStatementPage} />
              <Route path="/dashboard" component={DashboardPage} />
              <Route path="/admin" component={AdminDashboardPage} />
              <Route path="/attendance" component={AttendanceHistoryPage} />
              <Route path="/attendance/analytics" component={AttendanceAnalyticsPage} />
              <Route path="/analytics" component={AnalyticsPage} />
              <Route path="/attendance/checkin" component={CheckinPage} />
              <Route path="/attendance/scan" component={QRScannerPage} />
              <Route path="/attendance/absent" component={AbsentMembersPage} />
              <Route path="/prayer-requests" component={PrayerRequestsPage} />
              <Route path="/donations" component={DonationHistoryPage} />
              <Route path="/bible-studies" component={BibleStudyPage} />
              <Route path="/members" component={MembersPage} />
              <Route path="/staff" component={StaffDirectoryPage} />
              <Route path="/devotionals" component={DevotionalsPage} />
              <Route path="/live" component={LiveStreamPage} />
              <Route path="/admin/live-stream/new" component={AdminLiveStreamPage} />
              <Route path="/volunteer" component={VolunteerPage} />
              <Route path="/music" component={MusicPage} />
              <Route path="/house-cells" component={HouseCellsPage} />
              <Route path="/groups" component={GroupsPage} />
              <Route path="/youth" component={YouthDashboardPage} />
              <Route path="/bible" component={BiblePage} />
              <Route path="/discipleship" component={DiscipleshipPage} />
              <Route path="/admin/sermon-clips" component={SermonClipGeneratorPage} />
              <Route path="/feed" component={SocialFeedPage} />
              <Route path="/member-stories" component={MemberStoriesPage} />
              <Route path="/celebrations" component={CelebrationsPage} />
              <Route path="/youth" component={YouthDashboardPage} />
              <Route path="/children-checkin" component={ChildrenCheckinPage} />
              <Route path="/messages" component={MessagesPage} />
              <Route path="/settings/language" component={LanguageSettingsPage} />
              <Route path="/settings/sessions" component={SessionManagementPage} />
              <Route path="/resources" component={ResourcesPage} />
              <Route path="/billing" component={BillingPage} />
              <Route path="/tasks" component={TasksPage} />
              <Route path="/notifications" component={NotificationsPage} />
              <Route path="/admin/backups" component={BackupsPage} />
              <Route path="/counseling" component={CounselingPage} />
              <Route path="/admin/webhooks" component={WebhooksPage} />
              <Route path="/admin/integrations" component={IntegrationsPage} />
              <Route path="/admin/campuses" component={CampusesPage} />
              <Route path="/activity" component={MemberActivityPage} />
              <Route path="/spiritual-health" component={SpiritualHealthPage} />
              <Route path="/admin/custom-pages" component={CustomPagesPage} />
              <Route path="/admin/email-templates" component={EmailTemplatesPage} />
              <Route path="/admin/sermons" component={SermonManagerPage} />
              <Route path="/admin/events" component={EventManagerPage} />
              <Route path="/church-map" component={ChurchMapPage} />
              <Route path="/admin/audit-logs" component={AuditLogsPage} />
              <Route path="/admin/financial-reports" component={FinancialReportsPage} />
              <Route path="/admin/users" component={UserManagementPage} />
              <Route path="/admin/settings" component={SystemSettingsPage} />
              <Route path="/donation-receipts" component={DonationReceiptsPage} />
              <Route path="/sermon-notes" component={SermonNotesPage} />
              <Route path="/admin/zoom" component={ZoomIntegrationPage} />
              <Route path="/admin/payment-gateway" component={PaymentGatewayPage} />
              <Route path="/admin/content-moderation" component={ContentModerationPage} />
              <Route path="/event-reminders" component={EventRemindersPage} />
              <Route component={NotFound} />
            </>
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function AppContent() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
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
