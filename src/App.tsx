import React, { useState, useEffect } from 'react';
import { UserRole, UserSession, AwsRecord } from './types';
import { DEMO_STATS } from './data/mockData';
import { getStoredSession, clearDemoSession } from './utils/auth';
import { canAccessView, VIEW_TITLES } from './utils/permissions';
import { DataService } from './services/dataService';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RegistryPage } from './pages/RegistryPage';
import { AuditorDashboardPage } from './pages/AuditorDashboardPage';
import { LifecycleOperationsPage } from './pages/LifecycleOperationsPage';
import { SystemArchitecturePage } from './pages/SystemArchitecturePage';
import { PoliciesPage } from './pages/PoliciesPage';
import { ViolationsPage } from './pages/ViolationsPage';
import { LifecycleAnalyticsPage } from './pages/LifecycleAnalyticsPage';
import { AccessRestrictedPage } from './pages/AccessRestrictedPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AwsDetailModal } from './components/AwsDetailModal';

const LIFECYCLE_STAGE_VIEWS = [
  'manufacturing-certification',
  'ownership-transfer',
  'deployment-authorization',
  'usage-tracking',
  'audit-compliance',
  'incident-reporting',
  'disposal',
];

export default function App() {
  // Session State (retrieved from localStorage if present for seamless refresh)
  const [session, setSession] = useState<UserSession>(() => {
    const stored = getStoredSession();
    if (stored && stored.isAuthenticated) {
      return stored;
    }
    return {
      username: '',
      role: 'Auditor / Inspector',
      organization: 'Auditor / Inspector',
      isAuthenticated: false,
    };
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<string>(() => {
    const initialHash = window.location.hash.replace(/^#\/?/, '');
    return initialHash || 'dashboard';
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Persistent Application Data Layer State
  const [awsRecords, setAwsRecords] = useState<AwsRecord[]>(() => DataService.getAwsRecords());
  const [violations, setViolations] = useState(() => DataService.getViolations());
  const [selectedAws, setSelectedAws] = useState<AwsRecord | null>(null);

  // Synchronize hash routing with currentView state for direct URL support & RBAC protection
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash && hash !== currentView) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  const handleNavigate = (viewId: string) => {
    window.location.hash = viewId;
    setCurrentView(viewId);
    setIsMobileNavOpen(false);
  };

  // Sync state whenever view changes or on mount
  const refreshData = () => {
    const latest = DataService.getAwsRecords();
    setAwsRecords(latest);
    setViolations(DataService.getViolations());
    if (selectedAws) {
      const refreshedSelected = latest.find((r) => r.id === selectedAws.id);
      if (refreshedSelected) {
        setSelectedAws(refreshedSelected);
      }
    }
  };

  // Handle Login
  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    handleNavigate('dashboard');
    refreshData();
  };

  // Handle Logout
  const handleLogout = () => {
    clearDemoSession();
    setSession({
      username: '',
      role: 'Auditor / Inspector',
      organization: 'Auditor / Inspector',
      isAuthenticated: false,
    });
    handleNavigate('dashboard');
    setSelectedAws(null);
  };

  // Callback when a lifecycle operation or new AWS registration updates data
  const handleRecordUpdated = (updatedRecord: AwsRecord) => {
    refreshData();
    if (selectedAws && selectedAws.id === updatedRecord.id) {
      setSelectedAws(updatedRecord);
    }
  };

  // View title helper
  const getViewTitle = () => {
    return VIEW_TITLES[currentView] || 'Autonomous Weapon Lifecycle Management';
  };

  // If not authenticated, render the demonstration credential verification login page
  if (!session.isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Check if current view is permitted for the active role (Role Guard: applies to direct URL access too)
  const isPermitted = canAccessView(session.role, currentView);

  const transactions = DataService.getTransactions();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        userRole={session.role}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          currentViewTitle={getViewTitle()}
          activeRole={session.role}
          username={session.username}
          organization={session.organization}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
        />

        {/* Page Body with Role Protection Enforcement */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {!isPermitted ? (
            /* Access Restricted Page rendered whenever user attempts to visit unauthorized view */
            <AccessRestrictedPage
              currentRole={session.role}
              attemptedView={getViewTitle()}
              onReturnToDashboard={() => handleNavigate('dashboard')}
            />
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardPage
                  stats={DEMO_STATS}
                  awsRecords={awsRecords}
                  transactions={transactions}
                  userRole={session.role}
                  onSelectAws={(record) => setSelectedAws(record)}
                  onNavigateToView={handleNavigate}
                />
              )}

              {(currentView === 'aws-registry' || currentView === 'registry') && (
                <RegistryPage
                  records={awsRecords}
                  userRole={session.role}
                  onSelectAws={(record) => setSelectedAws(record)}
                  onRecordUpdated={handleRecordUpdated}
                />
              )}

              {(currentView === 'system-architecture' || currentView === 'architecture') && (
                <SystemArchitecturePage />
              )}

              {currentView === 'auditor-dashboard' && (
                <AuditorDashboardPage
                  awsRecords={awsRecords}
                  transactions={transactions}
                  userRole={session.role}
                  onSelectAws={(record) => setSelectedAws(record)}
                />
              )}

              {currentView === 'policies' && (
                <PoliciesPage
                  awsRecords={awsRecords}
                  userRole={session.role}
                  onSelectAws={(record) => setSelectedAws(record)}
                  onNavigateToViolations={() => handleNavigate('violations')}
                />
              )}

              {currentView === 'violations' && (
                <ViolationsPage
                  violations={violations}
                  awsRecords={awsRecords}
                  userRole={session.role}
                  onSelectAws={(record) => setSelectedAws(record)}
                  onViolationUpdated={refreshData}
                  onNavigateToIncidents={() => handleNavigate('incident-reporting')}
                />
              )}

              {currentView === 'lifecycle-analytics' && (
                <LifecycleAnalyticsPage
                  awsRecords={awsRecords}
                  violations={violations}
                  userRole={session.role}
                  onSelectAws={(record) => setSelectedAws(record)}
                  onNavigateToViolations={() => handleNavigate('violations')}
                  onNavigateToPolicies={() => handleNavigate('policies')}
                />
              )}

              {LIFECYCLE_STAGE_VIEWS.includes(currentView) && (
                <LifecycleOperationsPage
                  viewId={currentView}
                  userRole={session.role}
                  awsRecords={awsRecords}
                  onSelectAws={(record) => setSelectedAws(record)}
                  onRecordUpdated={handleRecordUpdated}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView !== 'dashboard' &&
                currentView !== 'aws-registry' &&
                currentView !== 'registry' &&
                currentView !== 'system-architecture' &&
                currentView !== 'architecture' &&
                currentView !== 'auditor-dashboard' &&
                currentView !== 'policies' &&
                currentView !== 'violations' &&
                currentView !== 'lifecycle-analytics' &&
                !LIFECYCLE_STAGE_VIEWS.includes(currentView) && (
                  <PlaceholderPage
                    viewId={currentView}
                    userRole={session.role}
                    onNavigateBack={() => handleNavigate('dashboard')}
                  />
                )}
            </>
          )}
        </main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-200 py-3 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>SecureChain-AWLM</strong> — B.Tech Major Project • Department of Computer Science & Engineering
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>IEEE Autonomous Systems Governance Model</span>
            <span>•</span>
            <span>Local Persistent Data Layer</span>
          </div>
        </footer>
      </div>

      {/* Reusable AWS Detail Modal (with Lifecycle Timeline) */}
      <AwsDetailModal
        record={selectedAws}
        onClose={() => setSelectedAws(null)}
      />
    </div>
  );
}
