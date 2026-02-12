import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS, TooltipRenderProps } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { X, ChevronRight, ChevronLeft, Rocket } from 'lucide-react';

// ─── LCARS-styled Tooltip ───────────────────────────────────────────────────

const LCARSTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  size,
  isLastStep,
}: TooltipRenderProps) => (
  <div
    {...tooltipProps}
    className="max-w-md rounded-lg overflow-hidden shadow-2xl border-2 border-amber-500/60"
    style={{ background: 'linear-gradient(135deg, hsl(220 20% 12%), hsl(220 15% 8%))' }}
  >
    {/* LCARS top bar */}
    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500">
      <div className="w-3 h-3 rounded-full bg-amber-900/50" />
      <div className="flex-1 h-1 rounded bg-amber-900/30" />
      <span className="text-xs font-bold text-black tracking-wider uppercase">
        {index + 1} / {size}
      </span>
      <button {...closeProps} className="ml-2 text-black hover:text-amber-900 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>

    {/* Content */}
    <div className="p-5">
      {step.title && (
        <h3 className="text-lg font-bold text-amber-400 mb-2 font-display uppercase tracking-wide">
          {step.title}
        </h3>
      )}
      <div className="text-sm text-gray-300 leading-relaxed">
        {step.content}
      </div>
    </div>

    {/* Navigation */}
    <div className="flex items-center justify-between px-4 py-3 border-t border-amber-500/20">
      <div>
        {index > 0 && (
          <button
            {...backProps}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-400 border border-amber-500/40 rounded hover:bg-amber-500/10 transition-colors"
          >
            <ChevronLeft className="h-3 w-3" />
            Back
          </button>
        )}
      </div>
      <button
        {...primaryProps}
        className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-black rounded transition-colors"
        style={{ background: 'hsl(var(--axanar-teal))' }}
      >
        {isLastStep ? (
          <>
            Engage! <Rocket className="h-3 w-3" />
          </>
        ) : (
          <>
            Next <ChevronRight className="h-3 w-3" />
          </>
        )}
      </button>
    </div>

    {/* LCARS bottom bar */}
    <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
  </div>
);

// ─── Tour step definitions by route ─────────────────────────────────────────

export interface TourStepDef extends Step {
  route?: string; // which route this step belongs to
}

const TOUR_STEPS: TourStepDef[] = [
  // ── Home Page ──
  {
    target: 'nav',
    title: 'Navigation',
    content: 'Your main navigation bar. Access all areas of the platform from here — About, Forum, Campaigns, Videos, FAQ, and Support.',
    placement: 'bottom',
    route: '/',
    disableBeacon: true,
  },
  {
    target: '[data-tour="hero-portal"]',
    title: 'Access Portal',
    content: 'Click here to sign in or look up your existing donor account. All original Kickstarter and Indiegogo donors have accounts waiting for them.',
    placement: 'bottom',
    route: '/',
  },
  {
    target: '[data-tour="donor-benefits"]',
    title: 'Donor Benefits',
    content: 'See what exclusive benefits are available to you as an Axanar donor — from profile customization to special forum access.',
    placement: 'top',
    route: '/',
  },
  // ── Profile Page ──
  {
    target: '[data-tour="profile-header"]',
    title: 'Your Profile',
    content: 'This is your donor profile. You can customize your avatar, background, bio, and display name. Your contribution history is automatically linked.',
    placement: 'bottom',
    route: '/profile',
  },
  {
    target: '[data-tour="profile-rank"]',
    title: 'Rank & Achievements',
    content: 'Your rank is based on your total contributions across all campaigns. Unlock new ranks and achievements as your support grows!',
    placement: 'left',
    route: '/profile',
  },
  {
    target: '[data-tour="profile-contributions"]',
    title: 'Contribution History',
    content: 'View all your pledges, perks, and donation history across every Axanar campaign. Click any contribution for full details.',
    placement: 'top',
    route: '/profile',
  },
  // ── Forum Page ──
  {
    target: '[data-tour="forum-search"]',
    title: 'Forum Search & Filters',
    content: 'Search threads, filter by category, or sort by newest, hottest, or top-rated. The forum is your hub for community discussion.',
    placement: 'bottom',
    route: '/forum',
  },
  {
    target: '[data-tour="forum-compose"]',
    title: 'Start a Discussion',
    content: 'Create new threads to discuss Axanar news, share fan content, or connect with fellow donors. Supports Star Trek emojis! 🖖',
    placement: 'bottom',
    route: '/forum',
  },
  {
    target: '[data-tour="forum-sidebar"]',
    title: 'Community Stats',
    content: 'See who\'s online, recently active members, and overall community statistics. Your engagement here earns you rank points!',
    placement: 'left',
    route: '/forum',
  },
  // ── Campaigns Page ──
  {
    target: '[data-tour="campaign-stats"]',
    title: 'Campaign Overview',
    content: 'Real-time statistics across all Axanar campaigns. See active campaigns, total raised, and total backers at a glance.',
    placement: 'bottom',
    route: '/campaigns',
  },
  {
    target: '[data-tour="campaign-filters"]',
    title: 'Filter Campaigns',
    content: 'Filter by platform — Kickstarter, Indiegogo, PayPal, or view all. Each campaign card shows key details and your participation.',
    placement: 'top',
    route: '/campaigns',
  },
  // ── Leaderboard Page ──
  {
    target: '[data-tour="leaderboard-table"]',
    title: 'Donor Leaderboard',
    content: 'See the top contributors ranked by total donations. Find your position and track your progress through the ranks!',
    placement: 'top',
    route: '/leaderboard',
  },
  // ── Direct Messages ──
  {
    target: '[data-tour="dm-conversations"]',
    title: 'Direct Messages',
    content: 'Private messaging with other donors and the Axanar support team. Switch between personal messages and support tickets.',
    placement: 'right',
    route: '/direct-messages',
  },
];

// ─── Storage key for tour completion ────────────────────────────────────────

const TOUR_STORAGE_KEY = 'axanar-tour-completed';
const TOUR_DISMISSED_KEY = 'axanar-tour-dismissed';

// ─── Context ────────────────────────────────────────────────────────────────

interface TourContextType {
  isTourActive: boolean;
  startTour: () => void;
  stopTour: () => void;
  resetTour: () => void;
  hasCompletedTour: boolean;
  hasDismissedTour: boolean;
  currentStepIndex: number;
  totalSteps: number;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

// ─── Provider ───────────────────────────────────────────────────────────────

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  });
  const [hasDismissedTour, setHasDismissedTour] = useState(() => {
    return localStorage.getItem(TOUR_DISMISSED_KEY) === 'true';
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get steps for the current route
  const currentRouteSteps = TOUR_STEPS.filter(
    (step) => !step.route || step.route === location.pathname
  );

  // Get ALL steps (for cross-page tour)
  const allSteps = TOUR_STEPS;

  const startTour = useCallback(() => {
    setStepIndex(0);
    setIsTourActive(true);
    // Navigate to home to start the tour
    if (location.pathname !== '/') {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  const stopTour = useCallback(() => {
    setIsTourActive(false);
    setStepIndex(0);
    setHasDismissedTour(true);
    localStorage.setItem(TOUR_DISMISSED_KEY, 'true');
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(TOUR_DISMISSED_KEY);
    setHasCompletedTour(false);
    setHasDismissedTour(false);
    setStepIndex(0);
  }, []);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, action, index, type, step } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setIsTourActive(false);
      setStepIndex(0);
      setHasCompletedTour(true);
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);

      // Check if next step requires a different route
      if (nextIndex >= 0 && nextIndex < allSteps.length) {
        const nextStep = allSteps[nextIndex] as TourStepDef;
        if (nextStep.route && nextStep.route !== location.pathname) {
          // Navigate to the required route, then advance
          navigate(nextStep.route);
          // Small delay to let the page render before advancing
          setTimeout(() => {
            setStepIndex(nextIndex);
          }, 600);
          return;
        }
      }

      setStepIndex(nextIndex);
    }

    if (action === ACTIONS.CLOSE) {
      stopTour();
    }
  }, [allSteps, location.pathname, navigate, stopTour]);

  // Auto-prompt tour for first-time authenticated users
  useEffect(() => {
    if (user && !hasCompletedTour && !hasDismissedTour && !isTourActive) {
      // Show tour prompt after a brief delay
      const timer = setTimeout(() => {
        setIsTourActive(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, hasCompletedTour, hasDismissedTour, isTourActive]);

  const value: TourContextType = {
    isTourActive,
    startTour,
    stopTour,
    resetTour,
    hasCompletedTour,
    hasDismissedTour,
    currentStepIndex: stepIndex,
    totalSteps: allSteps.length,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      <Joyride
        steps={allSteps}
        stepIndex={stepIndex}
        run={isTourActive}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        disableOverlayClose
        spotlightClicks
        callback={handleJoyrideCallback}
        tooltipComponent={LCARSTooltip}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Engage!',
          next: 'Next',
          skip: 'Skip Tour',
        }}
        styles={{
          options: {
            zIndex: 10000,
            arrowColor: 'hsl(220 20% 12%)',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          spotlight: {
            borderRadius: 8,
          },
        }}
      />
    </TourContext.Provider>
  );
};
