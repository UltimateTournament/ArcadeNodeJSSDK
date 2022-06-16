import type { ActivateSlipResponse, GetServerStatusResponse, ScoreReport } from "./types"
import Mock from "./mock"
import ArcadeServerSDK from "./server";

const UASDK: ArcadeServerSDK | Mock = process.env.UA_MOCK_MODE === "MOCK" ? new Mock() : new ArcadeServerSDK();
const getSDK = () => UASDK;

export { getSDK, ActivateSlipResponse, GetServerStatusResponse, ScoreReport }
