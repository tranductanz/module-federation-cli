import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiBase, METHOD } from '@mwg-kits/core'
import { API_CONST } from '../constants'
import Config from 'react-native-config'
export const getAccessTokenFromLocalStorage = async () => {
    const loginInfo = await AsyncStorage.getItem('TOKEN')

    // if (!!loginInfo) {
    //     const loginInfoParse = JSON.parse(loginInfo);
    //     const { plainTokenString } = loginInfoParse;
    //     return plainTokenString;
    // }
}
const DEV = 'dev'
export const getRoute = {
    START_GET_ROUTE: 'START_GET_ROUTE',
    SUCCESS_GET_ROUTE: 'SUCCESS_GET_ROUTE',
    ERROR_GET_ROUTE: 'ERROR_GET_ROUTE',
    RESET_GET_ROUTE: 'RESET_GET_ROUTE',

    START_SEARCH: 'START_SEARCH',
    SUCCESS_SEARCH: 'SUCCESS_SEARCH',
    ERROR_SEARCH: 'ERROR_SEARCH',

    START_GET_NEAR: 'START_GET_NEAR',
    SUCCESS_GET_NEAR: 'SUCCESS_GET_NEAR',
    ERROR_GET_NEAR: 'ERROR_GET_NEAR',

    START_GET_DESTINATION: 'START_GET_DESTINATION',
    SUCCESS_GET_DESTINATION: 'SUCCESS_GET_DESTINATION',
    ERROR_GET_DESTINATION: 'ERROR_GET_DESTINATION',

    GET_DATA_XWORK: 'GET_DATA_XWORK',
    RESET_DATA: 'RESET_DATA'
}
const startGetRoute = () => {
    return { type: getRoute.START_GET_ROUTE }
}
export const resetGetRoute = () => {
    return { type: getRoute.RESET_GET_ROUTE }
}
const successGetRoute = (data) => {
    return { type: getRoute.SUCCESS_GET_ROUTE, data: data }
}
const errorGetRoute = (msgError) => {
    return { type: getRoute.ERROR_GET_ROUTE, msgError: msgError }
}
export const getDataXwork = (data) => {
    return {
        type: getRoute.GET_DATA_XWORK,
        data: data
    }
}
export const resetData = () => {
    return {
        type: getRoute.RESET_DATA
    }
}
export const checkDistance = (inputRequest) => async (dispatch) =>
    new Promise(async (resolve, reject) => {
        try {
            const token = await AsyncStorage.getItem('TOKEN')
            const response = await apiBase(
                `${API_CONST.API_GET_DISTANCE}`,
                METHOD.POST,
                inputRequest,
                {
                    access_token: token,
                    enableLogger: true
                }
            )
            if (!response?.error) {
                resolve(response)
            } else {
                let msgError =
                    response?.errorReason !== ''
                        ? response?.errorReason
                        : response?.toastMessage
                throw msgError
            }
        } catch (err) {
            console.log('error', err)
            let errorMsg =
                typeof err === 'string' || err instanceof String
                    ? err
                    : err?.message
                    ? err.message
                    : translate('error_unknown')
            reject(errorMsg)
        }
    })
//profile
export const RouteProfiles = {
    motorcycle: 'driving-motorcycle',
    walk: 'foot-walking',
    car: 'driving-car'
}
const optionWalking = (options) => {
    const feature = []
    if (options?.avoid_features?.some((e) => e === 'ferries')) {
        feature.push('ferries')
        return { avoid_features: feature }
    }
    return {}
}
export const trackingStaff = ({
    isReset,
    profile,
    rootCoords,
    destCoords,
    options,
    alternative_routes,
    preference
}) => {
    return async (dispatch) => {
        try {
            dispatch(startGetRoute())
            const inputRequestDis = {
                profile,
                lonS: rootCoords[0],
                latS: rootCoords[1],
                lonD: destCoords[0],
                latD: destCoords[1]
            }
            const commonOptions = {
                preference,
                units: 'km',
                language: 'vi-vn',
                options:
                    profile === RouteProfiles.walk ? optionWalking() : options,
                coordinates: [rootCoords, destCoords]
            }
            const optionsWithAlterRoutes = {
                ...commonOptions,
                continue_straight: true,
                alternative_routes: {
                    target_count: 3,
                    weight_factor: 1.5,
                    share_factor: 0.6,
                    ...alternative_routes
                }
            }
            const resCheckDistance = checkDistance(inputRequestDis)
            const isFar = resCheckDistance?.object?.distance > 40
            const token = await AsyncStorage.getItem('TOKEN')
            const response = await apiBase(
                `${API_CONST.API_GETLINESTRING}${profile}`,
                METHOD.POST,
                isFar ? commonOptions : optionsWithAlterRoutes,
                {
                    access_token: token,
                    enableLogger: true
                }
            )
            if (!response?.error && response?.Data?.features.length !== 0) {
                dispatch(successGetRoute(response?.Data?.features))
            } else {
                let msgError =
                    response?.errorReason !== ''
                        ? response?.errorReason
                        : response?.toastMessage
                throw msgError
            }
        } catch (err) {
            console.log('error', err)
            let errorMsg =
                typeof err === 'string' || err instanceof String
                    ? err
                    : err?.message
                    ? err.message
                    : translate('error_unknown')
            dispatch(errorGetRoute(errorMsg))
        }
    }
}
const startSearch = () => {
    return { type: getRoute.START_SEARCH }
}
const successSearch = (data) => {
    return { type: getRoute.SUCCESS_SEARCH, data: data }
}
const errorSearch = (msgError) => {
    return { type: getRoute.ERROR_SEARCH, msgError: msgError }
}
export const searchLocation = ({ searchAddress, coordinates }) => {
    return async (dispatch) => {
        try {
            dispatch(startSearch())
            const token = await AsyncStorage.getItem('TOKEN')
            const response = await apiBase(
                `${API_CONST.API_SEARCH_LOCATION}`,
                METHOD.POST,
                {
                    searchAddress: searchAddress,
                    coordinate: { lon: coordinates[0], lat: coordinates[1] },
                    distance: 30,
                    units: 'km'
                },
                {
                    access_token: token
                }
            )
            if (!response?.error) {
                console.log('resb', response)
                dispatch(successSearch(response?.object?.elasticSearchResult))
            } else {
                let msgError =
                    response?.errorReason !== ''
                        ? response?.errorReason
                        : response?.toastMessage
                throw msgError
            }
        } catch (err) {
            console.log('error', err)
            let errorMsg =
                typeof err === 'string' || err instanceof String
                    ? err
                    : err?.message
                    ? err.message
                    : translate('error_unknown')
            dispatch(errorSearch(errorMsg))
        }
    }
}
const startGetNear = () => {
    return { type: getRoute.START_GET_NEAR }
}
const successGetNear = (data) => {
    return { type: getRoute.SUCCESS_GET_NEAR, data: data }
}
const errorGetNear = (msgError) => {
    return { type: getRoute.ERROR_GET_NEAR, msgError: msgError }
}
export const getNearLocation = ({ coordinates, distance }) => {
    return async (dispatch) => {
        try {
            console.log('getNearLocation', coordinates)
            dispatch(startGetNear())
            const token = await AsyncStorage.getItem('TOKEN')
            const response = await apiBase(
                `${API_CONST.API_GET_NEAR_LOCATION}${coordinates[1]}&lon=${
                    coordinates[0]
                }&distance=${distance ?? 50}`,
                METHOD.POST,
                {},
                {
                    access_token: token
                }
            )
            if (!response?.error) {
                console.log('resb1', response)
                dispatch(successGetNear(response?.object))
            } else {
                let msgError =
                    response?.errorReason !== ''
                        ? response?.errorReason
                        : response?.toastMessage
                throw msgError
            }
        } catch (err) {
            console.log('error', err)
            let errorMsg =
                typeof err === 'string' || err instanceof String
                    ? err
                    : err?.message
                    ? err.message
                    : translate('error_unknown')
            dispatch(errorGetNear(errorMsg))
        }
    }
}
const startGetDestination = () => {
    return { type: getRoute.START_GET_DESTINATION }
}
const successGetDestination = (data) => {
    return { type: getRoute.SUCCESS_GET_DESTINATION, data: data }
}
const errorgetDestination = (msgError) => {
    return { type: getRoute.ERROR_GET_DESTINATION, msgError: msgError }
}
export const getDestination = (SALEORDERID) => {
    return async (dispatch) => {
        try {
            dispatch(startGetDestination())
            const token = await AsyncStorage.getItem('TOKEN')
            const response = await apiBase(
                `${API_CONST.API_GET_NEAR_LOCATION}${coordinates[0]}&lon=${coordinates[1]}&distance=${distance}`,
                METHOD.POST,
                {},
                {
                    access_token: token
                }
            )
            if (!response?.error) {
                console.log('resb', response)
                dispatch(successGetDestination(response?.object))
            } else {
                let msgError =
                    response?.errorReason !== ''
                        ? response?.errorReason
                        : response?.toastMessage
                throw msgError
            }
        } catch (err) {
            console.log('error', err)
            let errorMsg =
                typeof err === 'string' || err instanceof String
                    ? err
                    : err?.message
                    ? err.message
                    : translate('error_unknown')
            dispatch(errorgetDestination(errorMsg))
        }
    }
}
export const getToken = () => {
    return async (dispatch) => {
        try {
            //   dispatch(startGetToken());
            const token = await AsyncStorage.getItem('TOKEN')
            const response = await apiBase(
                API_CONST.API_GET_TOKEN,
                METHOD.POST,
                {
                    uuid: '12345678',
                    profileId: 9,
                    configMap: {
                        userName: '98138'
                    }
                },
                {
                    access_token: token,
                    enableLogger: true
                }
            )
            if (!response?.error) {
                console.log('resb', response)
                // dispatch(successGetDestination(response?.object));
            } else {
                let msgError =
                    response?.errorReason !== ''
                        ? response?.errorReason
                        : response?.toastMessage
                throw msgError
            }
        } catch (err) {
            console.log('error', err)
            let errorMsg =
                typeof err === 'string' || err instanceof String
                    ? err
                    : err?.message
                    ? err.message
                    : translate('error_unknown')
            //   dispatch(errorgetDestination(errorMsg));
        }
    }
}
