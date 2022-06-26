import { NextApiResponse } from "next";
import HttpRequestError from "./HttpRequestError";
import nextHttpResponse from "./nextHttpResponse";

function nextHttpErrorResponse(res: NextApiResponse, err: any) {
  console.error(err);

  const cleanError =
    err instanceof HttpRequestError
      ? err
      : new HttpRequestError("EUNKNOWN", { cause: err });

  const additonalData = {
    code: cleanError.shortCode,
    event_id: cleanError.eventId,
  };

  return nextHttpResponse(
    res,
    cleanError.statusCode,
    cleanError.message,
    process.env.NODE_ENV === "development"
      ? {
          ...additonalData,
          stack: cleanError.stack,
          cause: cleanError.cause,
        }
      : additonalData
  );
}

export default nextHttpErrorResponse;
