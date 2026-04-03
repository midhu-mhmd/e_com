import { call, put, takeLatest } from "redux-saga/effects";
import { couponsApi } from "./couponsApi";
import { couponsSlice } from "./couponsSlice";

function* fetchCouponsSaga(action: ReturnType<typeof couponsSlice.actions.fetchCouponsRequest>): Generator<any, void, any> {
    try {
        const response = yield call(couponsApi.list, action.payload);
        yield put(couponsSlice.actions.fetchCouponsSuccess(response));
    } catch (error: any) {
        yield put(couponsSlice.actions.fetchCouponsFailure(error.message));
    }
}

function* fetchCouponStatsSaga(): Generator<any, void, any> {
    try {
        const response = yield call(couponsApi.stats);
        yield put(couponsSlice.actions.fetchCouponStatsSuccess(response));
    } catch (error: any) {
        yield put(couponsSlice.actions.fetchCouponStatsFailure(error.message));
    }
}

function* fetchRewardConfigSaga(): Generator<any, void, any> {
    try {
        const response = yield call(couponsApi.getRewardConfig);
        yield put(couponsSlice.actions.fetchRewardConfigSuccess(response));
    } catch (error: any) {
        yield put(couponsSlice.actions.fetchRewardConfigFailure(error.message));
    }
}

function* updateRewardConfigSaga(action: ReturnType<typeof couponsSlice.actions.updateRewardConfigRequest>): Generator<any, void, any> {
    try {
        const response = yield call(couponsApi.updateRewardConfig, action.payload);
        yield put(couponsSlice.actions.updateRewardConfigSuccess(response.config));
    } catch (error: any) {
        yield put(couponsSlice.actions.updateRewardConfigFailure(error.message));
    }
}

function* resetRewardDefaultsSaga(): Generator<any, void, any> {
    try {
        const response = yield call(couponsApi.resetRewardDefaults);
        yield put(couponsSlice.actions.updateRewardConfigSuccess(response.config));
    } catch (error: any) {
        yield put(couponsSlice.actions.updateRewardConfigFailure(error.message));
    }
}

function* createCouponSaga(action: ReturnType<typeof couponsSlice.actions.createCouponRequest>): Generator<any, void, any> {
    try {
        const response = yield call(couponsApi.create, action.payload);
        yield put(couponsSlice.actions.createCouponSuccess(response));
    } catch (error: any) {
        yield put(couponsSlice.actions.createCouponFailure(error.message));
    }
}

function* updateCouponSaga(action: ReturnType<typeof couponsSlice.actions.updateCouponRequest>): Generator<any, void, any> {
    try {
        const { id, payload } = action.payload;
        const response = yield call(couponsApi.update, id, payload);
        yield put(couponsSlice.actions.updateCouponSuccess(response));
    } catch (error: any) {
        yield put(couponsSlice.actions.updateCouponFailure(error.message));
    }
}

function* softDeleteCouponSaga(action: ReturnType<typeof couponsSlice.actions.softDeleteCouponRequest>): Generator<any, void, any> {
    try {
        yield call(couponsApi.softDelete, action.payload);
        yield put(couponsSlice.actions.softDeleteCouponSuccess(action.payload));
    } catch (error: any) {
        yield put(couponsSlice.actions.softDeleteCouponFailure(error.message));
    }
}

function* restoreCouponSaga(action: ReturnType<typeof couponsSlice.actions.restoreCouponRequest>): Generator<any, void, any> {
    try {
        yield call(couponsApi.restore, action.payload);
        yield put(couponsSlice.actions.restoreCouponSuccess(action.payload));
    } catch (error: any) {
        yield put(couponsSlice.actions.restoreCouponFailure(error.message));
    }
}

function* deleteCouponSaga(action: ReturnType<typeof couponsSlice.actions.deleteCouponRequest>): Generator<any, void, any> {
    try {
        yield call(couponsApi.delete, action.payload);
        yield put(couponsSlice.actions.deleteCouponSuccess(action.payload));
    } catch (error: any) {
        yield put(couponsSlice.actions.deleteCouponFailure(error.message));
    }
}

export function* couponsSaga() {
    yield takeLatest(couponsSlice.actions.fetchCouponsRequest.type, fetchCouponsSaga);
    yield takeLatest(couponsSlice.actions.fetchCouponStatsRequest.type, fetchCouponStatsSaga);
    yield takeLatest(couponsSlice.actions.fetchRewardConfigRequest.type, fetchRewardConfigSaga);
    yield takeLatest(couponsSlice.actions.updateRewardConfigRequest.type, updateRewardConfigSaga);
    yield takeLatest(couponsSlice.actions.resetRewardDefaultsRequest.type, resetRewardDefaultsSaga);
    yield takeLatest(couponsSlice.actions.createCouponRequest.type, createCouponSaga);
    yield takeLatest(couponsSlice.actions.updateCouponRequest.type, updateCouponSaga);
    yield takeLatest(couponsSlice.actions.softDeleteCouponRequest.type, softDeleteCouponSaga);
    yield takeLatest(couponsSlice.actions.restoreCouponRequest.type, restoreCouponSaga);
    yield takeLatest(couponsSlice.actions.deleteCouponRequest.type, deleteCouponSaga);
}
