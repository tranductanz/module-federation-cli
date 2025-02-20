import { images } from '../assets'
export const AvoidFeatures = {
    highways: 'highways',
    tollways: 'tollways',
    ferries: 'ferries'
}
export const RouteProfiles = {
    motorcycle: 'driving-motorcycle',
    walk: 'foot-walking',
    car: 'driving-car'
}
export const StepRoute = {
    searching: 'searching',
    choosed: 'choosed',
    routing: 'routing',
    chooseStart: 'choose-start'
}
export const ColorMain = 'rgba(79, 129, 239, 1)'

export const ArrProfile = [
    { id: RouteProfiles.motorcycle, icon: images.motobike },
    { id: RouteProfiles.walk, icon: images.walking },
    { id: RouteProfiles.car, icon: images.car }
]
export const PreferenceRouting = {
    shortest: 'shortest',
    fastest: 'fastest'
}
export const NIL_LINE_STRINGS = [
    [0, 0],
    [-1, -1]
]

export const HCM_DEFAULT_COORDS = [106.68166, 10.777888]
