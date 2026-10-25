from __future__ import annotations

from enum import Enum
from typing import Literal

from fastapi import APIRouter, FastAPI
from pydantic import BaseModel, Field, field_validator


class Feedback(BaseModel):
    quote: str
    theme: str
    source: str


class ScenarioMetric(BaseModel):
    label: str
    value: str
    change: str
    context: str


class BacklogItem(BaseModel):
    title: str
    owner: str
    estimate: str
    status: str
    description: str


class Stakeholder(BaseModel):
    name: str
    role: str
    message: str
    tone: str


class TimelineMoment(BaseModel):
    id: str
    time: str
    title: str
    description: str


class EvidenceCard(BaseModel):
    id: Literal[
        "member-demand",
        "member-voice",
        "member-support",
        "response-quality",
        "moderator-capacity",
        "delivery-readiness",
    ]
    category: Literal[
        "memberNeed",
        "experienceHealth",
        "operationalReadiness",
        "deliveryReadiness",
    ]
    title: str
    signal: str
    interpretation: str
    source: str


class Scenario(BaseModel):
    id: str
    title: str
    dayLabel: str
    openingNarrative: str
    demandCount: int
    demandWindow: str
    demandSummary: str
    feedback: list[Feedback]
    metrics: list[ScenarioMetric]
    capacitySummary: str
    capacitySignals: list[str]
    backlog: list[BacklogItem]
    stakeholders: list[Stakeholder]
    timeline: list[TimelineMoment]
    evidenceCards: list[EvidenceCard]


class DecisionInput(BaseModel):
    level: Literal["early", "tenured"]
    decision: Literal["launch", "pilot", "defer"]
    safeguard: Literal["moderatorCoverage", "communityGuidelines", "stagedAccess"]
    successMetric: Literal["feltSupported", "responseQuality", "memberDemand"]
    communication: Literal["clearPlan", "briefUpdate"]
    evidenceIds: list[
        Literal[
            "member-demand",
            "member-voice",
            "member-support",
            "response-quality",
            "moderator-capacity",
            "delivery-readiness",
        ]
    ] = Field(min_length=1, max_length=3)

    @field_validator("evidenceIds")
    @classmethod
    def evidence_ids_must_be_unique(cls, evidence_ids: list[str]) -> list[str]:
        if len(set(evidence_ids)) != len(evidence_ids):
            raise ValueError("Choose each evidence card only once.")
        return evidence_ids


class MetricDirection(str, Enum):
    positive = "positive"
    mixed = "mixed"
    watch = "watch"


class OutcomeMetric(BaseModel):
    key: str
    label: str
    value: int
    direction: MetricDirection
    explanation: str


class EvaluationLayerStatus(str, Enum):
    strong = "strong"
    mixed = "mixed"
    watch = "watch"


class DecisionEvaluationLayer(BaseModel):
    key: Literal["problemFraming", "evidenceBalance", "readiness", "execution"]
    label: str
    status: EvaluationLayerStatus
    assessment: str
    evidenceUsed: list[str]
    whyItMatters: str


class DecisionResult(BaseModel):
    heading: str
    summary: str
    metrics: list[OutcomeMetric]
    evaluationLayers: list[DecisionEvaluationLayer]
    strength: str
    recommendation: str
    levelCoaching: str
    nextStep: str


app = FastAPI(
    title="PM Day Simulator Engine",
    description="Stateless scenario and decision evaluation for the PM day simulation.",
    version="1.0.0",
)
engine = APIRouter(prefix="/pm-day-simulator-engine")


SCENARIO = Scenario(
    id="friendship-space-launch",
    title="Should we open a Friendship space?",
    dayLabel="Tuesday · 9:05 AM",
    openingNarrative=(
        "You are the PM for Fieldnotes, a fictional fast-growing consumer-tech "
        "scale-up building peer-support communities. Its spaces are Belonging, "
        "Self-confidence, and Study Stress. Members are asking for a new space about "
        "making friends and feeling more socially connected. By the end of today, "
        "your team needs a clear recommendation."
    ),
    demandCount=68,
    demandWindow="the last 14 days",
    demandSummary=(
        "Requests cluster around meeting people, joining conversations, and building "
        "friendships. Demand is real, but the team has not yet tested how members will "
        "use a dedicated space."
    ),
    feedback=[
        Feedback(
            quote=(
                "I like that people listen here. I wish there were a place to talk "
                "about making friends without feeling like I need to have it all figured out."
            ),
            theme="Making friends",
            source="Anonymous member feedback",
        ),
        Feedback(
            quote=(
                "When I join a group conversation, I overthink what to say. "
                "It would help to hear how other people handle that."
            ),
            theme="Social confidence",
            source="Anonymous member feedback",
        ),
        Feedback(
            quote=(
                "Please keep the listening-first feeling. I do not always want a list "
                "of fixes when I share something personal."
            ),
            theme="Support preferences",
            source="Anonymous member feedback",
        ),
    ],
    metrics=[
        ScenarioMetric(
            label="Requests for a friendship space",
            value="68",
            change="+31% in 14 days",
            context="Across feedback and community suggestions",
        ),
        ScenarioMetric(
            label="Members who felt heard",
            value="74%",
            change="+4 pts this month",
            context="Post-conversation pulse across current spaces",
        ),
        ScenarioMetric(
            label="Supportive reply within 24h",
            value="81%",
            change="−6 pts this week",
            context="Current spaces are seeing a modest response slowdown",
        ),
    ],
    capacitySummary=(
        "The community team can support a carefully scoped pilot. A broad launch would "
        "stretch current moderator coverage."
    ),
    capacitySignals=[
        "2 moderators have time for a limited pilot this week.",
        "The existing spaces already have slower response times than last week.",
        "A new topic needs clear posting guidance and a named moderation owner.",
    ],
    backlog=[
        BacklogItem(
            title="Add friendship topic to the community template",
            owner="Design + engineering",
            estimate="3 points",
            status="Ready",
            description="Reuse the existing topic-space setup and onboarding pattern.",
        ),
        BacklogItem(
            title="Write listening-first community guidance",
            owner="Community",
            estimate="1 day",
            status="Needs review",
            description="Set expectations for respectful peer support and advice by consent.",
        ),
        BacklogItem(
            title="Improve response-preference prompt",
            owner="Product + design",
            estimate="2 points",
            status="Planned",
            description="Let members say whether they want listening, shared experience, or ideas.",
        ),
    ],
    stakeholders=[
        Stakeholder(
            name="Maya Chen",
            role="Growth lead",
            message=(
                "The requests are climbing. Could we announce this before next week's "
                "campus outreach?"
            ),
            tone="Urgent",
        ),
        Stakeholder(
            name="Jordan Ellis",
            role="Community lead",
            message=(
                "I support the idea, but we need a realistic coverage plan. The current "
                "spaces are already taking longer to respond."
            ),
            tone="Cautious",
        ),
        Stakeholder(
            name="Sam Rivera",
            role="Research partner",
            message=(
                "The strongest theme is wanting connection without pressure to perform. "
                "A small pilot could help us learn what members actually need."
            ),
            tone="Thoughtful",
        ),
    ],
    timeline=[
        TimelineMoment(
            id="signals",
            time="9:05 AM",
            title="Morning signal check",
            description="Review member requests, current experience, and the work already in flight.",
        ),
        TimelineMoment(
            id="sync",
            time="10:30 AM",
            title="Cross-functional sync",
            description="Balance growth ambition with research and community readiness.",
        ),
        TimelineMoment(
            id="decision",
            time="1:45 PM",
            title="Decision brief",
            description="Choose a rollout, a safeguard, a success signal, and a team update.",
        ),
        TimelineMoment(
            id="review",
            time="4:30 PM",
            title="End-of-day review",
            description="Separate decision quality from the outcome and identify what to learn next.",
        ),
    ],
    evidenceCards=[
        EvidenceCard(
            id="member-demand",
            category="memberNeed",
            title="Requests are climbing",
            signal="68 requests · up 31% in 14 days",
            interpretation=(
                "A growing signal of demand, but request volume alone does not prove "
                "that a separate space will create a supportive experience."
            ),
            source="Member feedback and community suggestions",
        ),
        EvidenceCard(
            id="member-voice",
            category="memberNeed",
            title="Members want low-pressure connection",
            signal="Themes: making friends, joining conversations, social confidence",
            interpretation=(
                "The underlying need is connection without pressure to perform or "
                "receive advice they did not ask for."
            ),
            source="Qualitative feedback themes",
        ),
        EvidenceCard(
            id="member-support",
            category="experienceHealth",
            title="Current support feels meaningful",
            signal="74% felt heard · up 4 points this month",
            interpretation=(
                "The current community experience is improving, but that result may "
                "not automatically carry over to a new space."
            ),
            source="Post-conversation member pulse",
        ),
        EvidenceCard(
            id="response-quality",
            category="experienceHealth",
            title="Timely supportive replies are slipping",
            signal="81% receive a supportive reply within 24 hours · down 6 points",
            interpretation=(
                "Support quality is under pressure in existing spaces, so adding a "
                "new community may affect more than its own members."
            ),
            source="Current community service metric",
        ),
        EvidenceCard(
            id="moderator-capacity",
            category="operationalReadiness",
            title="Coverage supports a small pilot",
            signal="2 moderators have capacity this week",
            interpretation=(
                "The team can cover a limited pilot, but not a broad launch without "
                "a change to the support plan."
            ),
            source="Community team capacity check",
        ),
        EvidenceCard(
            id="delivery-readiness",
            category="deliveryReadiness",
            title="The topic template is nearly ready",
            signal="Space setup is estimated at 3 points; guidance still needs review",
            interpretation=(
                "The interface work is manageable, but community expectations and "
                "ownership need to be ready before launch."
            ),
            source="Product backlog",
        ),
    ],
)


def clamp(value: int) -> int:
    return max(0, min(100, value))


def build_evaluation_layers(
    decision: DecisionInput,
) -> list[DecisionEvaluationLayer]:
    cards_by_id = {card.id: card for card in SCENARIO.evidenceCards}
    selected_cards = [cards_by_id[card_id] for card_id in decision.evidenceIds]
    selected_ids = {card.id for card in selected_cards}
    selected_categories = {card.category for card in selected_cards}
    member_cards = [
        card for card in selected_cards if card.category == "memberNeed"
    ]
    readiness_cards = [
        card
        for card in selected_cards
        if card.id
        in {"response-quality", "moderator-capacity", "delivery-readiness"}
    ]
    evidence_titles = [card.title for card in selected_cards]

    if {"member-demand", "member-voice"}.issubset(selected_ids):
        problem_status = EvaluationLayerStatus.strong
        problem_assessment = (
            "You paired the size of the request with what members say they need."
        )
    elif member_cards:
        problem_status = EvaluationLayerStatus.mixed
        problem_assessment = (
            "You used a member-need signal. Pairing demand with member language "
            "would make the problem framing more specific."
        )
    else:
        problem_status = EvaluationLayerStatus.watch
        problem_assessment = (
            "Your selected evidence does not yet show what members are asking for."
        )

    has_member_need = "memberNeed" in selected_categories
    has_operating_context = bool(
        selected_categories
        & {"experienceHealth", "operationalReadiness", "deliveryReadiness"}
    )
    if has_member_need and has_operating_context:
        balance_status = EvaluationLayerStatus.strong
        balance_assessment = (
            "You weighed member demand alongside a signal about current experience, "
            "team capacity, or delivery readiness."
        )
    elif has_member_need or has_operating_context:
        balance_status = EvaluationLayerStatus.mixed
        balance_assessment = (
            "You surfaced one side of the tradeoff. Add a signal from the other side "
            "before treating the recommendation as settled."
        )
    else:
        balance_status = EvaluationLayerStatus.watch
        balance_assessment = (
            "The selected evidence does not yet balance member need with operating context."
        )

    has_capacity_signal = "moderator-capacity" in selected_ids
    has_readiness_signal = bool(readiness_cards)
    capacity_guardrail = decision.safeguard in {
        "moderatorCoverage",
        "stagedAccess",
    }
    if not has_readiness_signal:
        readiness_status = EvaluationLayerStatus.watch
        readiness_assessment = (
            "You have not selected evidence about service quality, moderator capacity, "
            "or launch readiness."
        )
    elif (
        decision.decision == "pilot"
        and has_capacity_signal
        and capacity_guardrail
    ):
        readiness_status = EvaluationLayerStatus.strong
        readiness_assessment = (
            "Your rollout scope and guardrail respond directly to the team’s limited "
            "capacity."
        )
    elif (
        decision.decision == "defer"
        and capacity_guardrail
        and decision.communication == "clearPlan"
    ):
        readiness_status = EvaluationLayerStatus.strong
        readiness_assessment = (
            "You protected readiness and made the delay accountable with a clear plan."
        )
    elif (
        decision.decision == "launch"
        and has_capacity_signal
        and capacity_guardrail
    ):
        readiness_status = EvaluationLayerStatus.mixed
        readiness_assessment = (
            "You noticed the capacity constraint and added a guardrail, but a broad "
            "launch still carries more operating risk than a pilot."
        )
    else:
        readiness_status = EvaluationLayerStatus.mixed
        readiness_assessment = (
            "You used a readiness signal. Make sure the safeguard directly addresses "
            "the risk it reveals."
        )

    clear_communication = decision.communication == "clearPlan"
    member_centered_metric = decision.successMetric in {
        "feltSupported",
        "responseQuality",
    }
    if clear_communication and member_centered_metric:
        execution_status = EvaluationLayerStatus.strong
        execution_assessment = (
            "You paired a member-centered success signal with a clear owner and check-in."
        )
    elif clear_communication or member_centered_metric:
        execution_status = EvaluationLayerStatus.mixed
        execution_assessment = (
            "You have a useful execution element. Pair clear ownership and timing with "
            "a measure of member experience."
        )
    else:
        execution_status = EvaluationLayerStatus.watch
        execution_assessment = (
            "Request volume alone is not a support outcome, and the team needs a clear "
            "owner and follow-up point."
        )

    readiness_evidence = [card.title for card in readiness_cards]
    execution_evidence = [
        card.title
        for card in selected_cards
        if (
            decision.successMetric == "feltSupported"
            and card.id == "member-support"
        )
        or (
            decision.successMetric == "responseQuality"
            and card.id == "response-quality"
        )
    ]
    if not execution_evidence:
        execution_evidence = evidence_titles

    return [
        DecisionEvaluationLayer(
            key="problemFraming",
            label="Member insight",
            status=problem_status,
            assessment=problem_assessment,
            evidenceUsed=[card.title for card in member_cards],
            whyItMatters=(
                "A PM should understand the member need beneath a feature request, "
                "not treat request volume as the whole problem."
            ),
        ),
        DecisionEvaluationLayer(
            key="evidenceBalance",
            label="Evidence balance",
            status=balance_status,
            assessment=balance_assessment,
            evidenceUsed=evidence_titles,
            whyItMatters=(
                "A recommendation is stronger when it considers both member value "
                "and the health of the system supporting it."
            ),
        ),
        DecisionEvaluationLayer(
            key="readiness",
            label="Safety and readiness",
            status=readiness_status,
            assessment=readiness_assessment,
            evidenceUsed=readiness_evidence,
            whyItMatters=(
                "Peer-support spaces need clear boundaries and enough moderator "
                "capacity to sustain the experience."
            ),
        ),
        DecisionEvaluationLayer(
            key="execution",
            label="Execution and learning",
            status=execution_status,
            assessment=execution_assessment,
            evidenceUsed=execution_evidence,
            whyItMatters=(
                "A good plan names how the team will learn, who owns the follow-up, "
                "and what member-centered signal matters."
            ),
        ),
    ]


@engine.get("/healthz")
def health() -> dict[str, str]:
    return {"status": "ok"}


@engine.get("/internal/scenario", response_model=Scenario)
def get_scenario() -> Scenario:
    return SCENARIO


@engine.post("/internal/evaluate", response_model=DecisionResult)
def evaluate_decision(decision: DecisionInput) -> DecisionResult:
    evaluation_layers = build_evaluation_layers(decision)
    baselines = {
        "launch": {
            "memberTrust": 76,
            "safetyReadiness": 48,
            "moderatorSustainability": 38,
            "deliveryProgress": 92,
        },
        "pilot": {
            "memberTrust": 72,
            "safetyReadiness": 77,
            "moderatorSustainability": 72,
            "deliveryProgress": 68,
        },
        "defer": {
            "memberTrust": 45,
            "safetyReadiness": 88,
            "moderatorSustainability": 86,
            "deliveryProgress": 40,
        },
    }
    scores = dict(baselines[decision.decision])

    if decision.safeguard == "moderatorCoverage":
        scores["safetyReadiness"] += 10
        scores["moderatorSustainability"] += 12
    elif decision.safeguard == "communityGuidelines":
        scores["safetyReadiness"] += 15
        scores["moderatorSustainability"] += 5
    else:
        scores["safetyReadiness"] += 8
        scores["moderatorSustainability"] += 10
        if decision.decision == "launch":
            scores["deliveryProgress"] -= 8

    if decision.communication == "clearPlan":
        scores["memberTrust"] += 8
    else:
        scores["memberTrust"] -= 7

    if decision.successMetric == "feltSupported":
        scores["memberTrust"] += 3
    elif decision.successMetric == "responseQuality":
        scores["safetyReadiness"] += 3
    else:
        scores["deliveryProgress"] += 3

    scores = {key: clamp(value) for key, value in scores.items()}

    labels = {
        "memberTrust": "Member trust",
        "safetyReadiness": "Safety readiness",
        "moderatorSustainability": "Moderator sustainability",
        "deliveryProgress": "Delivery progress",
    }
    explanations = {
        "memberTrust": {
            "launch": "Members see a quick response to demand.",
            "pilot": "Members see the request taken seriously while the team learns.",
            "defer": "A delay can weaken trust unless members understand what happens next.",
        },
        "safetyReadiness": {
            "launch": "A broad launch leaves less room to learn before demand scales.",
            "pilot": "A small rollout gives the team room to observe and adjust.",
            "defer": "The team has time to prepare guidance and coverage before opening.",
        },
        "moderatorSustainability": {
            "launch": "Broad access adds load while current response times are slipping.",
            "pilot": "A contained group keeps the initial workload more manageable.",
            "defer": "The team protects current coverage, but demand remains unmet.",
        },
        "deliveryProgress": {
            "launch": "The team can ship the space quickly using the existing template.",
            "pilot": "The team delivers a smaller version and gathers evidence.",
            "defer": "The launch is delayed while the team prepares.",
        },
    }

    metric_keys = [
        "memberTrust",
        "safetyReadiness",
        "moderatorSustainability",
        "deliveryProgress",
    ]
    metrics = []
    for key in metric_keys:
        value = scores[key]
        direction = (
            MetricDirection.positive
            if value >= 70
            else MetricDirection.mixed
            if value >= 50
            else MetricDirection.watch
        )
        metrics.append(
            OutcomeMetric(
                key=key,
                label=labels[key],
                value=value,
                direction=direction,
                explanation=explanations[key][decision.decision],
            )
        )

    if decision.decision == "launch":
        heading = "You moved quickly. Now protect the experience."
        summary = (
            "The team responds to visible demand and ships quickly. The tradeoff is "
            "that community coverage and reply quality need close attention as more "
            "members arrive."
        )
        recommendation = (
            "Set a short review point after launch. Watch supportive-reply quality and "
            "moderator load, and be ready to narrow access if either moves in the wrong direction."
        )
        next_step = "Share a launch check-in time and confirm who owns moderation coverage."
    elif decision.decision == "pilot":
        heading = "You chose to learn at a manageable scale."
        summary = (
            "A pilot gives members a first version while giving the team a chance to "
            "learn about support needs before expanding."
        )
        recommendation = (
            "Write down what would earn expansion: member-reported support, reply quality, "
            "and sustainable moderator coverage."
        )
        next_step = "Tell members how the pilot works and when the team will review it."
    else:
        heading = "You protected readiness, but the request still needs an answer."
        summary = (
            "Waiting gives the team time to prepare. Without a clear update, members may "
            "assume their request has disappeared."
        )
        recommendation = (
            "Make the delay visible and time-bound. Keep collecting demand and name the "
            "conditions that would make a launch ready."
        )
        next_step = "Send a dated update and assign an owner to the readiness checklist."

    safeguard_names = {
        "moderatorCoverage": "moderator coverage",
        "communityGuidelines": "clear community guidance",
        "stagedAccess": "staged access",
    }
    safeguard_note = f" You also prioritized {safeguard_names[decision.safeguard]}."
    if decision.communication == "briefUpdate":
        recommendation += (
            " Replace the brief update with a specific plan and a date for the next update."
        )
    if decision.successMetric == "memberDemand":
        recommendation += (
            " Pair request volume with a member-reported measure so demand is not mistaken "
            "for a good support experience."
        )

    layer_recommendations = {
        "problemFraming": (
            "Pair request volume with member language so the team is solving the need "
            "behind the request."
        ),
        "evidenceBalance": (
            "Put one member-need signal beside a current-experience or capacity signal "
            "before confirming the rollout."
        ),
        "readiness": (
            "Confirm the moderator owner and support window before the team commits."
        ),
        "execution": (
            "Name a member-centered success signal, an owner, and a review time."
        ),
    }
    improvement_layer = next(
        (
            layer
            for status in (
                EvaluationLayerStatus.watch,
                EvaluationLayerStatus.mixed,
            )
            for layer in evaluation_layers
            if layer.status == status
        ),
        None,
    )
    if improvement_layer:
        recommendation += " Next, " + layer_recommendations[improvement_layer.key]

    strength_by_layer = {
        "problemFraming": (
            "You connected the feature request to a specific member need."
        ),
        "evidenceBalance": (
            "You considered member value alongside the health of the system."
        ),
        "readiness": (
            "You treated moderator capacity and community boundaries as product constraints."
        ),
        "execution": (
            "You made the decision actionable with a measure and a team follow-up."
        ),
    }
    strongest_layer = next(
        (
            layer
            for layer in evaluation_layers
            if layer.status == EvaluationLayerStatus.strong
        ),
        None,
    )
    strength = (
        strength_by_layer[strongest_layer.key]
        if strongest_layer
        else "You made a clear call and have a specific opportunity to strengthen its evidence."
    )

    level_coaching = (
        "As an early-career PM, bring this recommendation to your manager with the "
        "evidence you chose, the tradeoff, and the question you need help resolving."
        if decision.level == "early"
        else "As a tenured PM, align the growth and community leads on the guardrails, "
        "then own the review point and expansion criteria."
    )

    return DecisionResult(
        heading=heading,
        summary=summary + safeguard_note,
        metrics=metrics,
        evaluationLayers=evaluation_layers,
        strength=strength,
        recommendation=recommendation,
        levelCoaching=level_coaching,
        nextStep=next_step,
    )


app.include_router(engine)
