import { applyMiddleware, compose, createStore } from 'redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import { rootReducer } from './reducer'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const loggerMiddleware = createLogger()
export const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunk, loggerMiddleware))
)
