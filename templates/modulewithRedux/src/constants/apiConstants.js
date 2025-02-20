import Config from 'react-native-config'

export const HEADER_API = `${Config.HOST_MAP}mwg-app-service-gis-web-service/api/`
export const API_GETLINESTRING = `${HEADER_API}routing?profile=`
export const API_GET_DISTANCE = `${HEADER_API}distance`
export const API_GET_NEAR_LOCATION = `${Config.HOST_ERP}mwg-app-service-contribute-map/api/contribute/els/nearest?lat=`
export const API_SEARCH_LOCATION = `${HEADER_API}address/search_xwork`
export const API_GET_DESTINATION = `http://10.1.24.67:6001/api/Customer/Get-Customer-Info-By-SO`
export const API_GET_TOKEN = `${Config.HOST_ERP}mwg-app-telemetry-service/api/telemetry/device/gentoken`
