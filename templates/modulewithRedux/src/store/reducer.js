import { combineReducers } from 'redux'
import { trackingStaffReducer } from '../containers/reducer'

const rootReducer = combineReducers({ trackingStaffReducer })

export { rootReducer }
