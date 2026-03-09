import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/authenticate";
import { sendSuccess } from "../../utils/response";
import { getAnalyticsSummary, getMonthlyTrend } from "./analytics.service";

export async function analyticsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  /**
   * GET /api/v1/analytics/summary
   * ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&prevStartDate=YYYY-MM-DD&prevEndDate=YYYY-MM-DD
   */
  app.get("/summary", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { startDate, endDate, prevStartDate, prevEndDate } =
      request.query as {
        startDate: string;
        endDate: string;
        prevStartDate: string;
        prevEndDate: string;
      };

    if (!startDate || !endDate || !prevStartDate || !prevEndDate) {
      return reply.status(400).send({
        message:
          "startDate, endDate, prevStartDate and prevEndDate are required",
      });
    }

    const result = await getAnalyticsSummary(
      userId,
      { startDate, endDate },
      { startDate: prevStartDate, endDate: prevEndDate },
    );

    return sendSuccess(reply, result);
  });

  /**
   * GET /api/v1/analytics/monthly-trend
   * ?year=2026
   */
  app.get("/monthly-trend", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { year } = request.query as { year: string };
    const parsedYear = year ? Number(year) : new Date().getFullYear();

    const trend = await getMonthlyTrend(userId, parsedYear);
    return sendSuccess(reply, trend);
  });
}
