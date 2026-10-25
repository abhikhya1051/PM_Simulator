import { useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvaluateSimulationDecision, useGetSimulationScenario, useHealthCheck } from '@workspace/api-client-react';
import type { SimulationDecisionInput, SimulationDecisionResult, ScenarioEvidenceCard } from '@workspace/api-client-react';
import { Activity, AlertCircle, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Clock3, HeartHandshake, MessageCircle, RotateCcw, ShieldCheck, Users, X } from 'lucide-react';
import { PLAYER_AVATARS, PlayerAvatar, type PlayerAvatarId } from './components/PlayerAvatar';
import './index.css';

const queryClient = new QueryClient();
type Choice = Omit<SimulationDecisionInput, 'level' | 'evidenceIds'>;
const initialChoice: Choice = { decision: 'pilot', safeguard: 'moderatorCoverage', successMetric: 'feltSupported', communication: 'clearPlan' };
const categoryLabel: Record<string, string> = {
  memberNeed: 'MEMBER NEED', experienceHealth: 'EXPERIENCE HEALTH',
  operationalReadiness: 'OPERATIONS', deliveryReadiness: 'DELIVERY',
};

function Simulator() {
  const scenarioQuery = useGetSimulationScenario();
  const healthQuery = useHealthCheck();
  const evaluate = useEvaluateSimulationDecision();
  const [level, setLevel] = useState<SimulationDecisionInput['level'] | null>(null);
  const [avatarId, setAvatarId] = useState<PlayerAvatarId | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [choice, setChoice] = useState<Choice>(initialChoice);
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [result, setResult] = useState<SimulationDecisionResult | null>(null);
  const [showSync, setShowSync] = useState(false);
  const debriefRef = useRef<HTMLElement | null>(null);
  const scenario = scenarioQuery.data;
  const selectedAvatar = avatarId
    ? PLAYER_AVATARS.find((avatar) => avatar.id === avatarId)
    : null;

  useEffect(() => {
    if (result) debriefRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  const update = <K extends keyof Choice>(key: K, value: Choice[K]) => setChoice(current => ({ ...current, [key]: value }));
  const toggleEvidence = (id: string) => setEvidenceIds(current => current.includes(id)
    ? current.filter(item => item !== id)
    : current.length < 3 ? [...current, id] : current);
  const submit = () => {
    if (!level || evidenceIds.length < 1 || evidenceIds.length > 3) return;
    evaluate.mutate({ data: { ...choice, level, evidenceIds: evidenceIds as SimulationDecisionInput['evidenceIds'] } }, { onSuccess: setResult });
  };
  const startOver = () => {
    setLevel(null);
    setAvatarId(null);
    setHasStarted(false);
    setChoice(initialChoice);
    setEvidenceIds([]);
    setResult(null);
    setShowSync(false);
    evaluate.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const changeLevel = () => {
    setLevel(null);
    setAvatarId(null);
    setHasStarted(false);
    setChoice(initialChoice);
    setEvidenceIds([]);
    setResult(null);
    setShowSync(false);
    evaluate.reset();
  };
  const continueToSync = () => {
    setShowSync(true);
    document.getElementById('sync')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (scenarioQuery.isLoading) return <div className="loading-screen" aria-label="Loading scenario"><div className="loading-brand">fieldnotes<span>.</span></div><div className="skeleton hero"></div><div className="skeleton row"></div><p>Setting up your day at Fieldnotes…</p></div>;
  if (scenarioQuery.isError || !scenario) return <main className="error-screen"><div className="error-mark"><AlertCircle size={22}/></div><span className="eyebrow">FIELDNOTES / SIMULATION</span><h1>We couldn't open the daybook.</h1><p>The scenario service didn't respond. Your work hasn't been lost.</p><button className="button primary" onClick={() => scenarioQuery.refetch()} data-testid="button-retry"><RotateCcw size={15}/> Try again</button></main>;

  return <div className="workspace">
    <aside className="rail">
      <a className="brand" href="/" aria-label="Fieldnotes home"><span className="brand-mark"><i/><i/><i/></span><span>fieldnotes<span className="brand-dot">.</span></span></a>
      <div className="rail-label">YOUR DESK</div>
      <div className="rail-current"><span className="current-indicator"/><div><strong>PM Day Simulator</strong><small>Friendship &amp; Socializing</small></div></div>
      <div className="rail-divider"/>
      <div className="rail-label">DAY AT A GLANCE</div>
      <nav className="day-nav" aria-label="Day timeline">
        <a href="#signals"><span>09:05</span><i/>Signals &amp; evidence</a>
        <a href="#sync"><span>10:30</span><i/>Cross-functional sync</a>
        <a href="#decision"><span>13:45</span><i/>Rollout decision</a>
        <a href="#review"><span>16:30</span><i/>Decision review</a>
      </nav>
      <div className="rail-note"><ShieldCheck size={16}/><p>Member support, not therapy. People are anonymous to peers; pseudonyms stay consistent in replies.</p></div>
      <div className="rail-bottom"><div className="rail-avatar">{avatarId ? <PlayerAvatar id={avatarId} size={31}/> : 'PM'}</div><div><strong>{selectedAvatar?.label ?? 'Product team'}</strong><small>{level === 'early' ? 'Early-career PM' : level === 'tenured' ? 'Tenured PM' : 'Practice environment'}</small></div><span className={`health-dot ${healthQuery.isError ? 'offline' : ''}`}/></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb">SIMULATION <span>/</span> DAY ONE</div><div className="top-status"><span className={`health-dot ${healthQuery.isError ? 'offline' : ''}`}/>{healthQuery.isError ? <><span>Service reconnecting</span><button className="health-retry" onClick={() => healthQuery.refetch()}>Retry</button></> : healthQuery.isLoading ? 'Connecting to your workspace…' : 'Workspace ready'}<span className="top-divider"/><Clock3 size={14}/><span className="topbar-tag">A DAY AT FIELDNOTES</span></div></header>
      <div className="content">
        <div className="hero-kicker"><span className="pulse"/> YOUR PRODUCT SHADOW DAY <span className="hero-divider"/> {scenario.dayLabel}</div>
        <div className="page-heading"><div><h1>A room for<br/><em>finding your people.</em></h1><p className="intro">{scenario.openingNarrative}</p></div><div className="day-stamp"><span>TUESDAY</span><strong>01</strong><span>ONE DAY · FOUR MOMENTS</span></div></div>
         <div className="company-line"><div className="company-mark">f</div><div><strong>Fieldnotes</strong><span>Consumer community · Series C · 640K members</span></div><div className="company-status"><Activity size={14}/> BUILDING MOMENTUM</div></div>

        {!level ? <section className="level-gate">
          <div className="gate-art" aria-hidden="true"><span className="orbit orbit-a"/><span className="orbit orbit-b"/><span className="art-core"><Users size={23}/></span><span className="art-dot dot-one"/><span className="art-dot dot-two"/><span className="art-dot dot-three"/></div>
          <div className="gate-copy"><div className="section-kicker">A REAL DAY. A REAL TRADEOFF.</div><h2>Step into the product seat.</h2><p>Demand is real. So is the responsibility to make a new support space feel safe, useful, and sustainable.</p><p className="gate-question">How long have you been practicing product?</p>
            <div className="level-options">
              <button className="level-option" onClick={() => setLevel('early')} data-testid="button-level-early"><span className="level-icon">01</span><span><strong>Early-career</strong><small>Building product judgment</small></span><ArrowRight size={17}/></button>
              <button className="level-option" onClick={() => setLevel('tenured')} data-testid="button-level-tenured"><span className="level-icon">02</span><span><strong>Tenured PM</strong><small>Making tradeoffs at scale</small></span><ArrowRight size={17}/></button>
            </div>
          </div>
        </section> : !hasStarted ? <section className="avatar-gate" aria-labelledby="avatar-gate-title">
          <button className="avatar-back" onClick={changeLevel} data-testid="button-change-level"><ArrowLeft size={14}/> Change PM level</button>
          <div className="avatar-gate-copy"><span className="section-kicker">YOUR PRODUCT SHADOW DAY / {level === 'early' ? 'EARLY-CAREER' : 'TENURED'}</span><h2 id="avatar-gate-title">Choose the PM you’ll step in as.</h2><p>Pick an illustrated avatar for this playthrough. It stays in the simulation; no account or photo is needed.</p></div>
          <div className="avatar-options" role="group" aria-label="Choose your PM avatar">{PLAYER_AVATARS.map((avatar, index) => <button className={`avatar-option ${avatarId === avatar.id ? 'selected' : ''}`} key={avatar.id} onClick={() => setAvatarId(avatar.id)} aria-pressed={avatarId === avatar.id} data-testid={`avatar-${avatar.id}`}><PlayerAvatar id={avatar.id} size={76}/><span><strong>{avatar.label}</strong><small>Profile 0{index + 1}</small></span>{avatarId === avatar.id && <Check size={15}/>}</button>)}</div>
          <div className="avatar-actions"><span>Playing as <strong>{level === 'early' ? 'Early-career PM' : 'Tenured PM'}</strong></span><button className="button primary" onClick={() => setHasStarted(true)} disabled={!avatarId} data-testid="button-start-day">Start the day <ArrowRight size={16}/></button></div>
        </section> : <>
          <div className="level-banner"><span className="level-badge">{level === 'early' ? 'EARLY-CAREER PM' : 'TENURED PM'}</span><span className="banner-avatar"><PlayerAvatar id={avatarId ?? 'sage'} size={30}/><strong>{selectedAvatar?.label ?? 'Your PM avatar'}</strong></span><span>Coaching will meet you where you are.</span><button onClick={changeLevel} data-testid="button-change-level">Change PM <X size={13}/></button></div>
          <section className="moment-section" id="signals">
            <div className="moment-heading"><div className="moment-time"><span className="time-dot coral"/>09:05</div><div><span className="section-kicker">MOMENT 01 / SIGNAL REVIEW</span><h2>What's happening with members?</h2></div><span className="moment-duration">25 MIN</span></div>
            <div className="signal-grid">
              <article className="demand-card">
                <div className="card-head"><div className="icon-tile warm"><MessageCircle size={17}/></div><span className="section-kicker">MEMBER DEMAND</span><span className="live-tag">INCOMING</span></div>
                <div className="demand-number">{scenario.demandCount.toLocaleString()}<span> requests</span></div><div className="demand-sub">for a Friendship &amp; Socializing space · {scenario.demandWindow}</div>
                <p className="demand-summary">{scenario.demandSummary}</p>
                <div className="feedback-list">{scenario.feedback.map((item, i) => <blockquote key={item.quote} data-testid={`feedback-quote-${i}`}><span className="quote-mark">“</span><div><p>{item.quote}</p><footer><span>{item.theme}</span><span>{item.source}</span></footer></div></blockquote>)}</div>
              </article>
              <article className="metrics-card"><div className="card-head"><div className="icon-tile green"><Activity size={17}/></div><span className="section-kicker">COMMUNITY HEALTH</span></div><div className="metric-list">{scenario.metrics.map((metric, i) => <div className="metric-row" key={metric.label} data-testid={`metric-${i}`}><div><strong>{metric.value}</strong><span>{metric.label}</span></div><span className={`metric-change ${metric.change.trim().startsWith('-') ? 'negative' : ''}`}>{metric.change}</span><small>{metric.context}</small></div>)}</div></article>
            </div>
            <div className="capacity-strip"><div className="capacity-title"><div className="icon-tile ink"><Users size={17}/></div><div><span className="section-kicker">MODERATION CAPACITY</span><p>{scenario.capacitySummary}</p></div></div><div className="capacity-signals">{scenario.capacitySignals.map(signal => <div key={signal}><span className="signal-dot"/>{signal}</div>)}</div></div>
            <div className="evidence-header"><div><span className="section-kicker">YOUR WORKING SET</span><h3>Choose the signals you'll take into the room.</h3><p>Pick 1–3. A strong call weighs demand alongside experience and operating capacity.</p></div><div className="evidence-count" aria-live="polite"><strong>{evidenceIds.length}</strong><span> / 3 selected</span></div></div>
            <div className="evidence-grid">{scenario.evidenceCards.map((card: ScenarioEvidenceCard, i) => {
              const selected = evidenceIds.includes(card.id);
              const disabled = !selected && evidenceIds.length === 3;
               return <button className={`evidence-card ${selected ? 'selected' : ''}`} key={card.id} onClick={() => toggleEvidence(card.id)} aria-pressed={selected} disabled={disabled} data-testid={`evidence-${card.id}`}>
                <span className="evidence-top"><span className="evidence-index">0{i + 1}</span><span className="evidence-category">{categoryLabel[card.category] ?? card.category}</span><span className={`select-indicator ${selected ? 'checked' : ''}`}>{selected && <Check size={12}/>}</span></span><strong>{card.title}</strong><span className="evidence-signal">{card.signal}</span><span className="evidence-interpretation">{card.interpretation}</span><span className="evidence-source">{card.source}</span>
              </button>;
            })}</div>
            <div className="moment-action"><p>{evidenceIds.length === 0 ? 'Select at least one signal to continue.' : evidenceIds.length === 3 ? 'A focused set. Three signals selected.' : `${evidenceIds.length} signal${evidenceIds.length === 1 ? '' : 's'} selected. You can choose up to ${3 - evidenceIds.length} more.`}</p><button className="button primary" onClick={continueToSync} disabled={evidenceIds.length < 1} data-testid="button-continue-sync">Take evidence to sync <ArrowRight size={16}/></button></div>
          </section>

          <section className={`moment-section sync-section ${showSync ? 'revealed' : ''}`} id="sync">
            <div className="moment-heading"><div className="moment-time"><span className="time-dot gold"/>10:30</div><div><span className="section-kicker">MOMENT 02 / CROSS-FUNCTIONAL SYNC</span><h2>Three people. Three kinds of risk.</h2></div><span className="moment-duration">30 MIN</span></div>
            {!showSync && <button className="sync-reveal" onClick={() => setShowSync(true)} data-testid="button-open-sync"><span className="reveal-icon"><ChevronDown size={17}/></span><span><strong>Open the room</strong><small>Hear what design, trust, and engineering are seeing.</small></span><ArrowRight size={16}/></button>}
            {showSync && <>
              <div className="sync-intro"><span className="sync-live"><i/>ROOM OPEN</span><p>“The need is clear. The shape of a safe first version is less clear.”</p></div>
              <div className="stakeholder-grid">{scenario.stakeholders.map((person, i) => <article className="stakeholder-card" key={person.name} data-testid={`stakeholder-${i}`}><div className={`stake-avatar avatar-${i}`}>{person.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</div><div><div className="stake-name"><strong>{person.name}</strong><span>{person.role}</span></div><p>{person.message}</p><span className={`stake-tone tone-${i}`}>{person.tone}</span></div></article>)}</div>
              <div className="sync-bottom"><div className="backlog-brief"><span className="section-kicker">ALREADY IN FLIGHT</span><strong>Team backlog</strong><div className="backlog-list">{scenario.backlog.map((item, i) => <div className="backlog-item" key={item.title} data-testid={`backlog-${i}`}><span className="backlog-status"/><div><strong>{item.title}</strong><p>{item.description}</p><small>{item.owner} <i>·</i> {item.estimate}</small></div><span className="status-chip">{item.status}</span></div>)}</div></div>
                <aside className="sync-prompt"><span className="prompt-icon"><HeartHandshake size={19}/></span><span className="section-kicker">THE TENSION IN THE ROOM</span><p>People are asking for connection. The team is accountable for the quality of what happens after they arrive.</p><span className="prompt-foot">Need × wellbeing × capacity</span></aside>
              </div>
              <div className="sync-action"><p>Your selected evidence is ready for the rollout decision.</p><a className="button primary" href="#decision" data-testid="link-to-decision">Go to the decision <ArrowRight size={16}/></a></div>
            </>}
          </section>

          <section className="moment-section decision-wrap" id="decision">
            <div className="moment-heading"><div className="moment-time"><span className="time-dot green"/>13:45</div><div><span className="section-kicker">MOMENT 03 / ROLLOUT DECISION</span><h2>Choose a first version you can stand behind.</h2></div><span className="moment-duration">THE CALL</span></div>
            <section className="decision-panel">
              <div className="decision-top"><div><span className="section-kicker">BALANCE GROWTH WITH CARE</span><h3>Make the call. Make it operable.</h3><p>There isn't a perfect answer. Show how you will learn without making members or moderators absorb the risk.</p></div><div className="decision-number">03<span> / 04</span></div></div>
              <div className="decision-section"><div className="question"><span>01</span><div><strong>What rollout posture?</strong><small>Set the pace of learning</small></div></div><div className="choice-grid three">{([['launch','Launch broadly','Open the space to everyone.'],['pilot','Pilot with a cohort','Learn with a smaller group first.'],['defer','Defer for now','Build more capacity before opening.']] as const).map(([value,title,desc]) => <button key={value} className={`choice ${choice.decision === value ? 'selected' : ''}`} onClick={() => update('decision', value)} aria-pressed={choice.decision === value} data-testid={`choice-decision-${value}`}><span className="radio"/><strong>{title}</strong><small>{desc}</small></button>)}</div></div>
              <div className="decision-section"><div className="question"><span>02</span><div><strong>What safeguard travels with it?</strong><small>Protect the experience as you learn</small></div></div><div className="choice-grid three">{([['moderatorCoverage','Staffed coverage','Set a clear, staffed window.'],['communityGuidelines','Community guidelines','Clarify expectations and boundaries.'],['stagedAccess','Staged access','Expand only when signals hold.']] as const).map(([value,title,desc]) => <button key={value} className={`choice ${choice.safeguard === value ? 'selected' : ''}`} onClick={() => update('safeguard', value)} aria-pressed={choice.safeguard === value} data-testid={`choice-safeguard-${value}`}><span className="radio"/><strong>{title}</strong><small>{desc}</small></button>)}</div></div>
              <div className="decision-duo">
                <div className="decision-section"><div className="question"><span>03</span><div><strong>What does success feel like?</strong><small>Choose the primary signal</small></div></div><div className="stack-choices">{([['feltSupported','Members feel supported'],['responseQuality','Helpful reply quality'],['memberDemand','Sustained member demand']] as const).map(([value,title]) => <button key={value} className={`stack-choice ${choice.successMetric === value ? 'selected' : ''}`} onClick={() => update('successMetric', value)} aria-pressed={choice.successMetric === value} data-testid={`choice-metric-${value}`}><span className="radio"/>{title}</button>)}</div></div>
                <div className="decision-section"><div className="question"><span>04</span><div><strong>How will the team move?</strong><small>Set expectations, not just direction</small></div></div><div className="stack-choices">{([['clearPlan','Share plan, owner & check-in'],['briefUpdate','Send a brief status update']] as const).map(([value,title]) => <button key={value} className={`stack-choice ${choice.communication === value ? 'selected' : ''}`} onClick={() => update('communication', value)} aria-pressed={choice.communication === value} data-testid={`choice-communication-${value}`}><span className="radio"/>{title}</button>)}</div></div>
              </div>
              <div className="decision-evidence"><span className="section-kicker">EVIDENCE YOU'RE CARRYING</span><div>{scenario.evidenceCards.filter(card => evidenceIds.includes(card.id)).map(card => <span className="selected-evidence" key={card.id}><Check size={11}/>{card.title}</span>)}</div><a href="#signals">Adjust evidence</a></div>
              {evaluate.isError && <div className="submit-error" role="alert"><AlertCircle size={15}/> Your decision couldn't be evaluated. Your choices are still here. <button onClick={submit} data-testid="button-retry-evaluation">Retry evaluation</button></div>}
              <div className="decision-submit"><span><ShieldCheck size={15}/>No pass or fail. We're looking at the tradeoffs you made.</span><button className="button primary" onClick={submit} disabled={evaluate.isPending || evidenceIds.length === 0} data-testid="button-submit-decision">{evaluate.isPending ? 'Reviewing your call…' : 'Make the call'} {evaluate.isPending ? <span className="button-loader"/> : <ArrowRight size={16}/>}</button></div>
            </section>
          </section>

          {result && <section className="moment-section review-section" id="review" aria-live="polite" ref={debriefRef}>
            <div className="moment-heading"><div className="moment-time"><span className="time-dot lilac"/>16:30</div><div><span className="section-kicker">MOMENT 04 / DECISION REVIEW</span><h2>Look at the call from every angle.</h2></div><button className="button subtle restart" onClick={startOver} data-testid="button-start-over"><RotateCcw size={14}/> Start over</button></div>
            <div className="review-hero"><div><span className="review-label">YOUR DAY, IN REVIEW</span><h3>{result.heading}</h3><p>{result.summary}</p></div><div className="review-player"><PlayerAvatar id={avatarId ?? 'sage'} size={58}/><span>{selectedAvatar?.label ?? 'Your PM avatar'}</span></div></div>
            <div className="layer-heading"><span className="section-kicker">THE DECISION, LAYER BY LAYER</span><p>One choice can be strong in one dimension and need work in another.</p></div>
            <div className="evaluation-layers">{result.evaluationLayers.map((layer, i) => <article className={`evaluation-layer status-${layer.status}`} key={layer.key} data-testid={`layer-${layer.key}`}><div className="layer-number">0{i + 1}</div><div className="layer-body"><div className="layer-title"><h4>{layer.label}</h4><span className={`layer-status ${layer.status}`}>{layer.status}</span></div><p>{layer.assessment}</p><div className="layer-evidence"><span>IN PLAY</span>{layer.evidenceUsed.length ? layer.evidenceUsed.map(item => <span className="evidence-pill" key={item}>{item}</span>) : <span className="evidence-pill no-evidence">No selected signal</span>}</div><div className="why-matters"><strong>Why it matters</strong><span>{layer.whyItMatters}</span></div></div></article>)}</div>
            <div className="impact-heading"><div><span className="section-kicker">SEPARATE OUTCOME VIEW</span><h3>What moves. What needs watching.</h3></div><span>Balanced impact, not an engagement score.</span></div>
            <div className="outcome-grid">{result.metrics.map(metric => <article className={`outcome-card ${metric.direction}`} key={metric.key} data-testid={`outcome-${metric.key}`}><div className="outcome-label">{metric.label}<span>{metric.direction === 'positive' ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}</span></div><strong>{metric.value}</strong><p>{metric.explanation}</p><div className={`outcome-status ${metric.direction}`}>{metric.direction === 'positive' ? 'MOVING WELL' : metric.direction === 'watch' ? 'KEEP CLOSE' : 'TRADEOFF'}</div></article>)}</div>
            <div className="coaching-grid"><article className="coach-card strength"><span className="section-kicker">A STRENGTH TO KEEP</span><p>{result.strength}</p></article><article className="coach-card"><span className="section-kicker">ANOTHER LENS TO TRY</span><p>{result.recommendation}</p></article></div>
            <div className="level-coaching"><div className="coach-label"><HeartHandshake size={17}/><span>FOR YOUR PM JOURNEY</span></div><p>{result.levelCoaching}</p></div>
            <div className="next-step"><div><span className="section-kicker">WHEN YOU'RE BACK AT YOUR DESK</span><p>{result.nextStep}</p></div><ArrowRight size={20}/></div>
          </section>}
        </>}
        <footer className="page-foot"><span>FIELDNOTES / PRODUCT PRACTICE</span><span>Build for people. Learn in the open.</span></footer>
      </div>
    </main>
  </div>;
}

function App() {
  return <QueryClientProvider client={queryClient}><Simulator/></QueryClientProvider>;
}

export default App;
