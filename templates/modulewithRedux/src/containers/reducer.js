import * as _action from './action'
import * as _state from './state'
export const trackingStaffReducer = function (
    state = _state.trackingStaffState,
    action
) {
    switch (action.type) {
        case _action.getRoute.RESET_DATA:
            return {
                dataXwork: _state.trackingStaffState.dataXwork,
                getRoute: _state.trackingStaffState.getRoute,
                searchLocation: _state.trackingStaffState.searchLocation,
                getNear: _state.trackingStaffState.getNear
            }
        case _action.getRoute.GET_DATA_XWORK:
            return {
                ...state,
                dataXwork: action.data
            }
        case _action.getRoute.START_GET_ROUTE: {
            return {
                ...state,
                getRoute: {
                    ...state.getRoute,
                    isFetching: true,
                    isError: false,
                    isSuccess: false,
                    msgError: ''
                }
            }
        }
        case _action.getRoute.RESET_GET_ROUTE: {
            return {
                ...state,
                getRoute: {
                    isFetching: false,
                    isError: false,
                    isSuccess: false,
                    data: [],
                    msgError: ''
                }
            }
        }
        case _action.getRoute.SUCCESS_GET_ROUTE: {
            return {
                ...state,
                getRoute: {
                    isFetching: false,
                    isError: false,
                    isSuccess: true,
                    data: action.data,
                    msgError: ''
                }
            }
        }
        case _action.getRoute.ERROR_GET_ROUTE: {
            return {
                ...state,
                getRoute: {
                    isFetching: false,
                    isError: true,
                    isSuccess: false,
                    data: '',
                    msgError: action?.msgError
                }
            }
        }
        case _action.getRoute.START_SEARCH: {
            return {
                ...state,
                searchLocation: {
                    isFetching: true,
                    isError: false,
                    isSuccess: false,
                    data: [],
                    msgError: ''
                }
            }
        }
        case _action.getRoute.SUCCESS_SEARCH: {
            return {
                ...state,
                searchLocation: {
                    isFetching: false,
                    isError: false,
                    isSuccess: true,
                    data: action.data,
                    msgError: ''
                }
            }
        }
        case _action.getRoute.ERROR_SEARCH: {
            return {
                ...state,
                searchLocation: {
                    isFetching: false,
                    isError: true,
                    isSuccess: false,
                    data: '',
                    msgError: action?.msgError
                }
            }
        }
        case _action.getRoute.START_GET_NEAR: {
            return {
                ...state,
                getNear: {
                    isFetching: true,
                    isError: false,
                    isSuccess: false,
                    data: null,
                    msgError: ''
                }
            }
        }
        case _action.getRoute.SUCCESS_GET_NEAR: {
            return {
                ...state,
                getNear: {
                    isFetching: false,
                    isError: false,
                    isSuccess: true,
                    data: action.data,
                    msgError: ''
                }
            }
        }
        case _action.getRoute.ERROR_GET_NEAR: {
            return {
                ...state,
                getNear: {
                    isFetching: false,
                    isError: true,
                    isSuccess: false,
                    data: '',
                    msgError: action?.msgError
                }
            }
        }
        default:
            return state
    }
}
