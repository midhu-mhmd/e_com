import { call, put, select, takeLatest } from "redux-saga/effects";
import { authApi } from "./authApi";
import { tokenManager } from "../../services/api";
import { profileApi } from "../user/profileApi";
import {
  requestOtp,
  verifyOtp,
  setStep,
  authError,
  setUser,
  checkAuth,
  checkAuthDone,
  setUnauthenticated,
  logout,
} from "./authSlice";

const getErrMsg = (err: any, fallback: string) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

function* handleSendOtp(action: ReturnType<typeof requestOtp>): Generator<any, any, any> {
  try {
    // Build clean payload without undefined fields
    const payload: any = { otp_type: action.payload.otp_type };
    if (action.payload.phone_number) payload.phone_number = action.payload.phone_number;
    if (action.payload.email) payload.email = action.payload.email;

    yield call(authApi.sendOtp, payload);
    yield put(setStep("otp"));
  } catch (err: any) {
    yield put(authError(getErrMsg(err, "Failed to send OTP")));
  }
}

function* handleVerifyOtp(action: ReturnType<typeof verifyOtp>): Generator<any, any, any> {
  try {
    // Build clean payload without undefined fields
    const payload: any = { otp_type: action.payload.otp_type, otp_code: action.payload.otp_code };
    if (action.payload.phone_number) payload.phone_number = action.payload.phone_number;
    if (action.payload.email) payload.email = action.payload.email;
    if (action.payload.name) payload.name = action.payload.name;

    // ✅ verifies OTP & server returns access token + sets session cookie
    const verifyRes: { data: any } = yield call(authApi.verifyOtp, payload);

    // ✅ Extract access token from response and store it
    const accessToken = verifyRes.data?.access || verifyRes.data?.accessToken || verifyRes.data?.token;
    if (accessToken) {
      tokenManager.set(accessToken);
    }

    // ✅ Get user from verify response directly to ensure we get the Verified status instantly
    let user = verifyRes.data?.user ?? verifyRes.data;

    // ✅ If verify response didn't have user, fetch it now that we have the token
    if (!user || (!user.id && !user.email && !user.phone_number)) {
      const res: { data: any } = yield call(authApi.me);
      user = res.data?.user ?? res.data;
    }

    // ✅ CRITICAL FIX: Manually set verification flags based on what was just verified
    // This ensures the UI immediately reflects the verification status
    if (user?.id) {
      if (action.payload.otp_type === 'email') {
        user.is_email_verified = true;
      } else if (action.payload.otp_type === 'phone') {
        user.is_phone_verified = true;
      }

      try {
        const updatePayload: any = {};
        let shouldUpdate = false;

        // 1. Check if we need to save the name (registration flow)
        if (action.payload.name && (!user.first_name && !user.last_name)) {
          const parts = action.payload.name.trim().split(/\s+/);
          updatePayload.first_name = parts[0] || "";
          updatePayload.last_name = parts.slice(1).join(" ") || "";
          shouldUpdate = true;
          console.log("[Auth] Queuing missing name for save:", { first_name: updatePayload.first_name, last_name: updatePayload.last_name });
        }

        // 2. AGGRESSIVE PERSISTENCE: Force verification flags on backend after successful OTP
        if (action.payload.otp_type === 'email') {
          updatePayload.is_email_verified = true;
          shouldUpdate = true;
          console.log("[Auth] Persisting is_email_verified: true on backend after successful OTP");
        } else if (action.payload.otp_type === 'phone') {
          updatePayload.is_phone_verified = true;
          shouldUpdate = true;
          console.log("[Auth] Persisting is_phone_verified: true on backend after successful OTP");
        }

        // 3. Dispatch the update if anything changed - USE PUT INSTEAD OF PATCH
        if (shouldUpdate) {
          const updated: any = yield call(profileApi.updateMe, updatePayload);
          // Merge fresh data with existing user to ensure everything is perfectly synced
          user = { ...user, ...updated };
        }
      } catch (_e: any) {
        console.error("[Auth] Failed to aggressively persist verification flags:", _e?.response?.data || _e?.message || _e);
        // Continue anyway - user object already has flags set locally
      }
    }

    // ✅ Force Query Cache sync
    import("../../main").then(({ queryClient }) => {
      queryClient.setQueryData(["userProfile"], user);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    });

    // ✅ store in redux (UI/guard will redirect)
    yield put(setUser(user));
  } catch (err: any) {
    yield put(authError(getErrMsg(err, "Invalid OTP")));
  }
}

function* handleCheckAuth(): Generator<any, any, any> {
  try {
    // ✅ Skip if user is already authenticated (e.g. just verified OTP)
    const alreadyAuthenticated: boolean = yield select((state: any) => state.auth.isAuthenticated);
    if (alreadyAuthenticated) {
      yield put(checkAuthDone());
      return;
    }

    // ✅ Check if we even have a token locally before calling API
    const hasToken = tokenManager.get();
    if (!hasToken) {
      yield put(setUnauthenticated());
      yield put(checkAuthDone());
      return;
    }

    // ✅ Call /users/me to restore session on page load/refresh
    const res: { data: any } = yield call(authApi.me);
    const user = res.data?.user ?? res.data;
    yield put(setUser(user));
  } catch (err: any) {
    // No valid session, clear auth state
    yield put(setUnauthenticated());
  } finally {
    yield put(checkAuthDone());
  }
}

function* handleLogout(): Generator<any, any, any> {
  try {
    // ✅ Call backend to clear the refresh cookie
    yield call(authApi.logout);
  } catch (_err) {
    // Even if the API fails, we still clear the local state
  } finally {
    // ✅ Clear in-memory access token
    tokenManager.clear();
    // ✅ Clear Redux auth state (keeps checkingAuth=false so routes render)
    yield put(setUnauthenticated());
  }
}

export function* authSaga(): Generator<any, any, any> {
  yield takeLatest(requestOtp.type, handleSendOtp);
  yield takeLatest(verifyOtp.type, handleVerifyOtp);
  yield takeLatest(checkAuth.type, handleCheckAuth);
  yield takeLatest(logout.type, handleLogout);
}
