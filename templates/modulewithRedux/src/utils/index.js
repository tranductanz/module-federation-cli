export const distanceLonLatKm = (a, b) => {
    var R = 6371 // km
    var dLat = toRad(b[1] - a[1])
    var dLon = toRad(b[0] - a[0])
    var lat1 = toRad(a[1])
    var lat2 = toRad(b[1])
    var e =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) *
            Math.sin(dLon / 2) *
            Math.cos(lat1) *
            Math.cos(lat2)
    var c = 2 * Math.atan2(Math.sqrt(e), Math.sqrt(1 - e))
    var d = R * c
    return d
}

const toRad = (deg) => {
    return (deg * Math.PI) / 180
}
export const caculateDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.ceil((seconds % 3600) / 60)
    if (hours === 0) return `${minutes.toString()} phút`
    else return `${hours.toString()} giờ ${minutes.toString()} phút`
}
