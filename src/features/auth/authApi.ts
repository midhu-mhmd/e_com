import { api } from "../../services/api"
import type { SendOtpRequest, VerifyOtpRequest } from "../../types/types";

export const authApi = {
  sendOtp: (data: SendOtpRequest) =>
    api.post("/auth/otp/request/", data),

  verifyOtp: (data: VerifyOtpRequest) =>
    api.post("/auth/otp/login/", data),

  googleCallback: (data: { code: string; referral_code?: string }) =>
    api.post("/auth/google/callback/", data),

  me: () => api.get("/users/me/"),

  logout: () => api.post("/auth/logout/"),
};