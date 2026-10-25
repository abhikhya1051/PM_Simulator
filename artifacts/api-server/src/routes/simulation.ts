import { Router, type IRouter } from "express";
import {
  EvaluateSimulationDecisionBody,
  EvaluateSimulationDecisionResponse,
  GetSimulationScenarioResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const engineUrl =
  process.env.PM_SIM_ENGINE_URL ??
  "http://127.0.0.1:8000/pm-day-simulator-engine";

router.get("/simulation/scenario", async (req, res): Promise<void> => {
  try {
    const upstream = await fetch(`${engineUrl}/internal/scenario`, {
      signal: AbortSignal.timeout(5_000),
    });

    if (!upstream.ok) {
      req.log.error(
        { statusCode: upstream.status },
        "Simulation engine failed to return the scenario",
      );
      res.status(502).json({ error: "Could not load the simulation scenario." });
      return;
    }

    const scenario = GetSimulationScenarioResponse.parse(await upstream.json());
    res.json(scenario);
  } catch (error) {
    req.log.error({ err: error }, "Simulation engine is unavailable");
    res.status(503).json({ error: "The simulation is temporarily unavailable." });
  }
});

router.post("/simulation/evaluate", async (req, res): Promise<void> => {
  const parsed = EvaluateSimulationDecisionBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn(
      { errors: parsed.error.message },
      "Invalid simulation decision submitted",
    );
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const upstream = await fetch(`${engineUrl}/internal/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(5_000),
    });

    if (!upstream.ok) {
      req.log.error(
        { statusCode: upstream.status },
        "Simulation engine failed to evaluate the decision",
      );
      res.status(502).json({ error: "Could not evaluate this decision." });
      return;
    }

    const result = EvaluateSimulationDecisionResponse.parse(
      await upstream.json(),
    );
    res.json(result);
  } catch (error) {
    req.log.error({ err: error }, "Simulation engine is unavailable");
    res.status(503).json({ error: "The simulation is temporarily unavailable." });
  }
});

export default router;
