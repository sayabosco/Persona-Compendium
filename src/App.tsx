/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  GameId,
  GameInfo,
  PersonaData,
  FusionChart,
  SpecialFusions,
  BossGuide,
  EnemyData,
  ItemData,
  MonthGuide
} from './types/persona';
import {
  SUPPORTED_GAMES,
  loadPersonas,
  loadFusionChart,
  loadSpecialFusions,
  loadClassroomAnswers,
  loadSocialLinks,
  loadRequests,
  loadBossGuides,
  loadNegotiationData,
  loadSkills,
  loadEnemies,
  loadItems,
  loadDayGuides
} from './utils/dataLoader';
import { IosStatusBar } from './components/ios/IosStatusBar';
import { IosNavBar } from './components/ios/IosNavBar';
import { IosTabBar, MainTab } from './components/ios/IosTabBar';
import { DesktopHeader } from './components/desktop/DesktopHeader';
import { IosInstallPrompt } from './components/ios/IosInstallPrompt';
import { IosConnectionModal } from './components/ios/IosConnectionModal';
import { DeployGuideModal } from './components/ios/DeployGuideModal';
import { GameHeroBanner } from './components/common/GameHeroBanner';
import { ElementSpriteSheet } from './components/common/ElementSpriteSheet';

// Main views
import { BrowseHubView } from './components/browse/BrowseHubView';
import { CompendiumView } from './components/compendium/CompendiumView';
import { FusionLabView } from './components/fusion/FusionLabView';
import { EnemiesView } from './components/enemies/EnemiesView';
import { ConfidantsView } from './components/social/ConfidantsView';
import { ClassroomQuestsView } from './components/classroom/ClassroomQuestsView';
import { SkillsView } from './components/skills/SkillsView';
import { ItemsView } from './components/items/ItemsView';
import { RequestsView } from './components/requests/RequestsView';
import { GuidesView } from './components/guides/GuidesView';
import { NegotiationView } from './components/negotiation/NegotiationView';
import { Loader2, ChevronLeft, Monitor, Smartphone } from 'lucide-react';

const TAB_TITLES: Record<MainTab, string> = {
  browse: 'Browse Hub',
  personas: 'Compendium',
  fusion: 'Fusion Lab',
  enemies: 'Shadows & Bosses',
  social: 'Confidants',
  classroom: 'School Exams',
  skills: 'Skills Codex',
  items: 'Items & Gear',
  requests: 'Mementos Requests',
  guides: 'Calendar & Guides',
  negotiation: 'Shadow Negotiation'
};

export default function App() {
  const [selectedGameId, setSelectedGameId] = useState<GameId>('p5r');
  const [activeTab, setActiveTab] = useState<MainTab>('browse');
  const [isIPhoneFrameMode, setIsIPhoneFrameMode] = useState<boolean>(false);
  const [fusionTargetPersona, setFusionTargetPersona] = useState<string>('');
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);

  // Data states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [personas, setPersonas] = useState<PersonaData[]>([]);
  const [fusionChart, setFusionChart] = useState<FusionChart | null>(null);
  const [specialFusions, setSpecialFusions] = useState<SpecialFusions>({});
  const [classroomData, setClassroomData] = useState<Record<string, any>>({});
  const [socialLinksData, setSocialLinksData] = useState<Record<string, any>>({});
  const [requestsData, setRequestsData] = useState<any[]>([]);
  const [bossGuides, setBossGuides] = useState<BossGuide[]>([]);
  const [negotiationData, setNegotiationData] = useState<any>(null);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [enemiesData, setEnemiesData] = useState<EnemyData[]>([]);
  const [itemsData, setItemsData] = useState<ItemData[]>([]);
  const [dayGuidesData, setDayGuidesData] = useState<MonthGuide[]>([]);

  // User favorites
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('persona_favs');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleFavorite = (name: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      try {
        localStorage.setItem('persona_favs', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const currentGame: GameInfo =
    SUPPORTED_GAMES.find((g) => g.id === selectedGameId) || SUPPORTED_GAMES[0];

  // Load comprehensive data whenever active game changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function fetchData() {
      try {
        const [
          loadedPersonas,
          loadedChart,
          loadedSpecial,
          loadedClassroom,
          loadedSL,
          loadedReqs,
          loadedBosses,
          loadedNego,
          loadedSkills,
          loadedEnemies,
          loadedItems,
          loadedDayGuides
        ] = await Promise.all([
          loadPersonas(selectedGameId).catch(() => []),
          loadFusionChart(selectedGameId).catch(() => null),
          loadSpecialFusions(selectedGameId).catch(() => ({})),
          loadClassroomAnswers(selectedGameId).catch(() => ({})),
          loadSocialLinks(selectedGameId).catch(() => ({})),
          loadRequests(selectedGameId).catch(() => []),
          loadBossGuides(selectedGameId).catch(() => []),
          loadNegotiationData().catch(() => null),
          loadSkills(selectedGameId).catch(() => []),
          loadEnemies(selectedGameId).catch(() => []),
          loadItems(selectedGameId).catch(() => []),
          loadDayGuides(selectedGameId).catch(() => [])
        ]);

        if (!isMounted) return;

        setPersonas(loadedPersonas);
        setFusionChart(loadedChart);
        setSpecialFusions(loadedSpecial);
        setClassroomData(loadedClassroom);
        setSocialLinksData(loadedSL);
        setRequestsData(loadedReqs);
        setBossGuides(loadedBosses);
        setNegotiationData(loadedNego);
        setSkillsData(loadedSkills);
        setEnemiesData(loadedEnemies);
        setItemsData(loadedItems);
        setDayGuidesData(loadedDayGuides);
      } catch (err) {
        console.error('Failed to load Persona data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedGameId]);

  // Handler to jump to fusion calculator for a given persona
  const handleSelectForFusion = (personaName: string) => {
    setFusionTargetPersona(personaName);
    setActiveTab('fusion');
  };

  const isTriangularMatrix =
    selectedGameId === 'p5r' || selectedGameId === 'p5' || selectedGameId === 'p3r';

  const seriesThemeClass =
    currentGame.series === 'p5'
      ? 'p5-halftone'
      : currentGame.series === 'p4'
      ? 'p4-scanline'
      : 'p3-grid';

  const confidantsCount = Object.keys(socialLinksData).length;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-start md:py-4 md:px-4 font-sans antialiased select-none">
      <ElementSpriteSheet />

      {/* When in iPhone Frame Mockup Mode on desktop, show a floating control to return to PC View */}
      {isIPhoneFrameMode && (
        <div className="hidden md:flex items-center justify-between w-full max-w-[430px] mb-3 px-2">
          <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>iPhone Frame Mockup</span>
          </div>
          <button
            type="button"
            onClick={() => setIsIPhoneFrameMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all border border-white/10 active:scale-95 shadow-md"
          >
            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            <span>Switch to PC View</span>
          </button>
        </div>
      )}

      {/* Container: on mobile it fills screen, on desktop toggle between iPhone frame and optimized PC view */}
      <main
        id="ios-app-container"
        className={`w-full flex flex-col relative transition-all duration-300 overflow-hidden ${
          isIPhoneFrameMode
            ? 'md:max-w-[430px] md:h-[900px] md:rounded-[50px] md:border-[10px] md:border-zinc-800 md:shadow-[0_0_60px_rgba(0,0,0,0.8)] md:ring-1 md:ring-white/10'
            : 'max-w-7xl min-h-screen md:rounded-3xl md:border md:border-white/10 md:shadow-2xl'
        } bg-zinc-950 ${seriesThemeClass}`}
      >
        {/* CASE A: If iPhone Frame Mockup Mode is active on desktop */}
        {isIPhoneFrameMode ? (
          <>
            <IosStatusBar
              accentColor={currentGame.color}
              gameTitle={currentGame.shortTitle}
            />
            <IosNavBar
              currentGame={currentGame}
              onSelectGame={(newId) => setSelectedGameId(newId)}
              isIPhoneFrameMode={isIPhoneFrameMode}
              onToggleFrameMode={() => setIsIPhoneFrameMode((prev) => !prev)}
              onOpenConnectModal={() => setIsConnectModalOpen(true)}
              onOpenDeployModal={() => setIsDeployModalOpen(true)}
              canBackToHub={activeTab !== 'browse'}
              onBackToHub={() => setActiveTab('browse')}
            />
          </>
        ) : (
          /* CASE B: Standard / PC / Mobile Mode */
          <>
            {/* Desktop Header: Rendered only on desktop screens */}
            <div className="hidden md:block">
              <DesktopHeader
                currentGame={currentGame}
                onSelectGame={(newId) => setSelectedGameId(newId)}
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab)}
                onToggleFrameMode={() => setIsIPhoneFrameMode(true)}
                onOpenConnectModal={() => setIsConnectModalOpen(true)}
                onOpenDeployModal={() => setIsDeployModalOpen(true)}
              />
            </div>

            {/* Mobile Subview Header: Rendered on iPhone/mobile ONLY when inside a subview (zero top bar on Browse Hub) */}
            {activeTab !== 'browse' && (
              <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-zinc-950/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
                <button
                  id="mobile-back-to-hub-btn"
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="flex items-center gap-1 text-xs font-bold text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-white/5 active:scale-95 transition-all border border-white/10"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-400" />
                  <span>Browse Hub</span>
                </button>
                <span className="text-xs font-black uppercase tracking-wider text-zinc-200 truncate max-w-[180px]">
                  {TAB_TITLES[activeTab] || activeTab}
                </span>
                <div className="w-16" />
              </div>
            )}
          </>
        )}

        {/* Scrollable Content Viewport */}
        <div
          id="ios-scroll-viewport"
          className={`flex-1 overflow-y-auto ${
            isIPhoneFrameMode
              ? 'px-3.5 pt-2.5 pb-28'
              : 'px-3.5 md:px-8 pt-3 md:pt-6 pb-28 md:pb-12'
          } no-scrollbar -webkit-overflow-scrolling-touch space-y-4`}
        >
          {/* Authentic Atlus Game Hero Banner with Logo & Quick Switcher */}
          <GameHeroBanner
            currentGame={currentGame}
            onSelectGame={(newId) => setSelectedGameId(newId)}
            totalPersonas={personas.length}
            activeTabName={activeTab}
          />

          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: currentGame.color }} />
              <p className="text-xs font-semibold tracking-wide">
                Loading {currentGame.title} Tactical Codex...
              </p>
            </div>
          ) : (
            <>
              {/* 1. Browse Hub (Matching user screenshot with 10 modules) */}
              {activeTab === 'browse' && (
                <BrowseHubView
                  currentGame={currentGame}
                  onSelectFeature={(featId) => setActiveTab(featId as MainTab)}
                  personasCount={personas.length}
                  enemiesCount={enemiesData.length}
                  itemsCount={itemsData.length}
                  skillsCount={skillsData.length}
                  confidantsCount={confidantsCount}
                  requestsCount={requestsData.length}
                />
              )}

              {/* 2. Personas Compendium */}
              {activeTab === 'personas' && (
                <CompendiumView
                  personas={personas}
                  gameId={selectedGameId}
                  series={currentGame.series}
                  accentColor={currentGame.color}
                  onSelectForFusion={handleSelectForFusion}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  skillsData={skillsData}
                />
              )}

              {/* 3. Fusion Calculator */}
              {activeTab === 'fusion' && (
                <FusionLabView
                  personas={personas}
                  fusionChart={fusionChart}
                  specialFusions={specialFusions}
                  accentColor={currentGame.color}
                  initialTarget={fusionTargetPersona}
                  isTriangular={isTriangularMatrix}
                />
              )}

              {/* 4. Enemies & Shadows */}
              {activeTab === 'enemies' && (
                <EnemiesView
                  enemies={enemiesData}
                  gameId={selectedGameId}
                  series={currentGame.series}
                  accentColor={currentGame.color}
                  skillsData={skillsData}
                />
              )}

              {/* 5. Confidants & Social Links */}
              {activeTab === 'social' && (
                <ConfidantsView
                  socialLinksData={socialLinksData}
                  accentColor={currentGame.color}
                  gameTitle={currentGame.title}
                />
              )}

              {/* 6. Classroom Answers */}
              {activeTab === 'classroom' && (
                <ClassroomQuestsView
                  classroomData={classroomData}
                  requestsData={requestsData}
                  accentColor={currentGame.color}
                  gameTitle={currentGame.title}
                />
              )}

              {/* 7. Skills Codex */}
              {activeTab === 'skills' && (
                <SkillsView
                  skills={skillsData}
                  gameId={selectedGameId}
                  series={currentGame.series}
                  accentColor={currentGame.color}
                />
              )}

              {/* 8. Items & Equipment */}
              {activeTab === 'items' && (
                <ItemsView
                  items={itemsData}
                  gameId={selectedGameId}
                  series={currentGame.series}
                  accentColor={currentGame.color}
                />
              )}

              {/* 9. Requests & Side-Quests */}
              {activeTab === 'requests' && (
                <RequestsView
                  requests={requestsData}
                  gameId={selectedGameId}
                  series={currentGame.series}
                  accentColor={currentGame.color}
                />
              )}

              {/* 10. Guides & Walkthroughs */}
              {activeTab === 'guides' && (
                <GuidesView
                  dayGuides={dayGuidesData}
                  bossGuides={bossGuides}
                  gameId={selectedGameId}
                  series={currentGame.series}
                  accentColor={currentGame.color}
                />
              )}

              {/* 11. Shadow Negotiation Guide */}
              {activeTab === 'negotiation' && (
                <NegotiationView
                  negotiationData={negotiationData}
                  gameId={selectedGameId}
                  series={currentGame.series}
                  accentColor={currentGame.color}
                />
              )}
            </>
          )}
        </div>

        {/* iOS Native Tab Bar: shown on mobile, and shown in iPhone frame mockup */}
        {!isIPhoneFrameMode ? (
          <div className="md:hidden">
            <IosTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              accentColor={currentGame.color}
              badgeCount={{ requests: requestsData.length }}
            />
          </div>
        ) : (
          <IosTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            accentColor={currentGame.color}
            badgeCount={{ requests: requestsData.length }}
          />
        )}

        {/* iOS Home Screen Installation Guide Prompt */}
        <IosInstallPrompt
          accentColor={currentGame.color}
          onDismiss={() => setShowInstallGuide(false)}
        />

        {/* iPhone QR Connect & Live Modal */}
        <IosConnectionModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          accentColor={currentGame.color}
        />

        {/* Host & Deploy Live Guide Modal */}
        <DeployGuideModal
          isOpen={isDeployModalOpen}
          onClose={() => setIsDeployModalOpen(false)}
          accentColor={currentGame.color}
        />
      </main>
    </div>
  );
}
