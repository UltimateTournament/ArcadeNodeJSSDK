import type { ActivateSlipResponse, GetServerStatusResponse, ScoreReport } from "./types"
import Mock from "./mock"
import { ArcadeServerSDK, arcadeServerSDK } from "./server";

const UASDK: ArcadeServerSDK = process.env.UA_MOCK_MODE === "MOCK" ? new Mock() : new arcadeServerSDK();
const getSDK = () => UASDK;

export { getSDK, ArcadeServerSDK, ActivateSlipResponse, GetServerStatusResponse, ScoreReport }
