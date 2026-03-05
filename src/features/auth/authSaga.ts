import { call, put, select, takeLatest } from "redux-saga/effects";
import { authApi } from "./authApi";
import { tokenManager } from "../../services/api";
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
    const msg = getErrMsg(err, "Failed to send OTP");
    const status = err?.response?.status;
    const data = err?.response?.data;

    // Detect inactive/blocked user from status code, response flag, or message keywords
    if (
      status === 403 ||
      data?.is_active === false ||
      /blocked|inactive|disabled|deactivated/i.test(msg)
    ) {
      yield put(authError("ACCOUNT_INACTIVE"));
    } else {
      yield put(authError(msg));
    }
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

    // ✅ VERIFICATION FLAGS: Backend automatically sets is_email_verified or is_phone_verified on successful OTP
    // Just confirm they're set by fetching fresh user data
    if (user?.id) {
      try {
        const meRes: { data: any } = yield call(authApi.me);
        user = meRes.data?.user ?? meRes.data;

        // ✅ Verify the flags are actually persisted
        if (action.payload.otp_type === 'email') {
          if (user?.is_email_verified) {
            console.log("[Auth] ✅ CONFIRMED: is_email_verified is TRUE in /me/ response");
          } else {
            console.warn("[Auth] ⚠️ WARNING: is_email_verified is not true in /me/ response");
          }
        } else if (action.payload.otp_type === 'phone') {
          if (user?.is_phone_verified) {
            console.log("[Auth] ✅ CONFIRMED: is_phone_verified is TRUE in /me/ response");
          } else {
            console.warn("[Auth] ⚠️ WARNING: is_phone_verified is not true in /me/ response");
          }
        }
      } catch (meErr: any) {
        console.error("[Auth] Failed to fetch /users/me/ after OTP:", meErr?.response?.data || meErr?.message);
        // Continue with user data from verify response
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
