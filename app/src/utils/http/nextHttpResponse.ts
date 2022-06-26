import { NextApiResponse } from "next";

export type CustomNextHttpResponse<TAdditionalData extends object> = {
  status: number;
  message: string;
  data?: TAdditionalData;
};

function nextHttpResponse<
  TAdditionalData extends object,
  TRes extends NextApiResponse
>(res: TRes, code: number, message: string, additionalData?: TAdditionalData) {
  const responseJson: CustomNextHttpResponse<TAdditionalData> = {
    status: code,
    message: message,
    data: additionalData,
  };
  res.status(code);
  res.json(responseJson);
  res.end();
  return responseJson;
}

export default nextHttpResponse;
