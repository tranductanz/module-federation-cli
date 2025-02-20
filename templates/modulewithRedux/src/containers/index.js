import React, { useRef, useEffect, useState, useMemo } from 'react'
import {
    TouchableOpacity,
    View,
    Platform,
    StyleSheet,
    Image,
    Alert
} from 'react-native'
import { ChooseLocationModal } from './modal/chooseLocation'
import { helper } from '@mwg-kits/common'
import { images } from '../assets'
import { Mixins } from '@mwg-sdk/styles'
import { MyLineString } from './lineString'
import { MyText } from '@mwg-kits/components'
import { openSettings } from 'react-native-permissions'
import { requestPermission } from '@mwg-kits/core'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SearchLocation } from './modal/searchLocation'
import { useDispatch, useSelector } from 'react-redux'
import { XworkColor as Colors } from '@mwg-sdk/styles'
import * as actionTrackingStaff from './action'
import Geolocation from 'react-native-geolocation-service'
import Mapbox from '@rnmapbox/maps'
import * as utils from '../utils'
import { COMMON_CONST } from '../constants'

export const Home = (props) => {
    const dispatch = useDispatch()
    const [state, setState] = useState({
        destCoords: [],
        inputEnd: '',
        isRouting: false,
        isVisible: false,
        lastCoords: [],
        namePointEnd: '',
        namePointStart: '',
        options: null,
        profile: COMMON_CONST.RouteProfiles.motorcycle,
        reference: COMMON_CONST.PreferenceRouting.fastest,
        startCoords: [],
        step: COMMON_CONST.StepRoute.searching,
        userCoords: [],
        isAcceptNear: false
    })
    const {
        destCoords,
        inputEnd,
        isRouting,
        isVisible,
        lastCoords,
        namePointEnd,
        namePointStart,
        options,
        profile,
        reference,
        startCoords,
        step,
        userCoords,
        isAcceptNear
    } = state
    const [showSearch, setShowSearch] = useState(false)
    const refModal = useRef(null)
    const refMap = useRef(null)
    const refCamera = useRef(null)
    const refSearch = useRef(null)

    const dataXwork = useSelector(
        (state) => state.trackingStaffReducer.dataXwork
    )
    const getLineString = useSelector(
        (state) => state.trackingStaffReducer.getRoute
    )
    const getDataSearch = useSelector(
        (state) => state.trackingStaffReducer.searchLocation
    )
    const getNearLocation = useSelector(
        (state) => state.trackingStaffReducer.getNear
    )
    const lineString = getLineString.data
    const onUserLocationUpdate = async ({
        coords: { latitude, longitude, heading }
    }) => {
        if (isRouting) {
            if (lastCoords.length === 0) {
                setState((prev) => ({
                    ...prev,
                    lastCoords: [longitude, latitude]
                }))
            }
            refCamera.current?.setCamera({
                heading,
                animationDuration: 1000,
                zoomLevel: 16,
                centerCoordinate: [longitude, latitude]
            })
            const distanceNear = utils.distanceLonLatKm(destCoords, [
                longitude,
                latitude
            ])
            if (distanceNear < 0.02) {
                setState((p) => ({ ...p, isAcceptNear: true }))
            }
            // const distance = utils.distanceLonLatKm(lastCoords, [
            //     longitude,
            //     latitude
            // ])
            // console.log('distance', distance)
            // if (distance > 0.1) {
            //     // getRoute([longitude, latitude], destCoords, profile)
            //     setState((prev) => ({
            //         ...prev,
            //         lastCoords: [longitude, latitude]
            //     }))
            // }
        }
    }

    //componentDidMount
    useEffect(() => {
        getCurrentGPS(true)
        return refModal?.current?.close()
    }, [])
    useEffect(() => {
        if (isAcceptNear) {
            return Alert.alert(`Thông báo.`, `Bạn đã đến nơi`, [
                {
                    text: 'Xác nhận',
                    onPress: () => {
                        setState((prev) => ({ ...prev, isAcceptNear: false }))
                        cancelRouting()
                    },

                    style: 'cancel'
                }
            ])
        }
    }, [isAcceptNear])
    // b1: lấy thông tin địa chỉ
    useEffect(() => {
        if (dataXwork?.receiver?.length === 2) {
            setState((prev) => ({
                ...prev,
                namePointEnd: dataXwork?.receiverFullAddress,
                destCoords:
                    dataXwork?.receiver[0] > 100
                        ? [
                              parseFloat(dataXwork?.receiver[0]),
                              parseFloat(dataXwork?.receiver[1])
                          ]
                        : [
                              parseFloat(dataXwork?.receiver[1]),
                              parseFloat(dataXwork?.receiver[0])
                          ],
                step: COMMON_CONST.StepRoute.choosed
            }))
            refModal.current?.present()
        } else if (helper.IsNonEmptyString(dataXwork?.receiverFullAddress)) {
            setState((prev) => ({
                ...prev,
                inputEnd: dataXwork?.receiverFullAddress
            }))
            setShowSearch(true)
        }
    }, [dataXwork])
    useEffect(() => {
        if (helper.IsNonEmptyArray(destCoords)) {
            refCamera.current?.setCamera({
                zoomLevel: 16,
                animationDuration: 1000,
                centerCoordinate: destCoords,
                paddingBottom: 50
            })
        }
    }, [destCoords])
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            console.log('PLAY')
            dispatch(
                actionTrackingStaff.searchLocation({
                    searchAddress: inputEnd,
                    coordinates: helper.IsNonEmptyArray(userCoords)
                        ? userCoords
                        : COMMON_CONST.HCM_DEFAULT_COORDS
                })
            )
        }, 850)
        return () => {
            clearTimeout(delayDebounceFn)
        }
    }, [inputEnd])
    //b2: chọn địa chỉ
    useEffect(() => {
        if (helper.IsNonEmptyArray(lineString) && !isRouting) {
            const { bbox } = lineString?.[0]
            refCamera.current?.fitBounds(
                [bbox?.[0], bbox?.[1]],
                [bbox?.[2], bbox?.[3]],
                [
                    Mixins.scale(160),
                    Mixins.scale(20),
                    Mixins.scale(350),
                    Mixins.scale(20)
                ],
                2000
            )
        }
    }, [lineString])
    useEffect(() => {
        const data = getNearLocation.data
        const coordinates = [data?.location?.lon, data?.location?.lat]
        dispatch(actionTrackingStaff.resetGetRoute())
        if (helper.IsValidateObject(data)) {
            if (
                helper.IsNonEmptyArray(destCoords) &&
                step === COMMON_CONST.StepRoute.chooseStart
            ) {
                console.log('isHare')
                setState((p) => ({
                    ...p,
                    startCoords: coordinates,
                    namePointStart: data.searchAddress
                }))
            } else {
                setState((p) => ({
                    ...p,
                    destCoords: coordinates,
                    namePointEnd: data.searchAddress,
                    step: COMMON_CONST.StepRoute.choosed
                }))
            }
            refModal?.current?.present()
        }
    }, [getNearLocation.data])
    const cancelRouting = () => {
        setState((prev) => ({
            ...prev,
            step: COMMON_CONST.StepRoute.choosed,
            isRouting: false
            // startCoords: userCoords
        }))
        refCamera.current?.setCamera({
            zoomLevel: 18,
            pitch: -45,
            animationDuration: 1000,
            centerCoordinate: userCoords
        })
    }
    const onPressItem = (item) => {
        setShowSearch(false)
        refModal.current.present()
        const coordinates = item.geometry?.coordinates
        dispatch(actionTrackingStaff.resetGetRoute())
        if (step !== COMMON_CONST.StepRoute.chooseStart) {
            // getRoute(startCoords, coordinates, profile);
            setState((prev) => ({
                ...prev,
                isSearching: false,
                namePointEnd: item.properties.searchAddress,
                destCoords: coordinates,
                step: COMMON_CONST.StepRoute.choosed
            }))
        } else {
            getRoute(coordinates, destCoords, profile)
            setState((prev) => ({
                ...prev,
                isSearching: false,
                namePointStart: item.properties.searchAddress,
                startCoords: coordinates,
                step: COMMON_CONST.StepRoute.choosed
            }))
        }
    }
    //b3: chọn điểm bắt đầu
    const getCurrentGPS = async (isCenter = true) => {
        try {
            const status = await requestPermission('location')
            if (status === 'granted') {
                Geolocation.getCurrentPosition(
                    ({ coords: { longitude, latitude } }) => {
                        setState((prev) => ({
                            ...prev,
                            userCoords: [longitude, latitude]
                        }))
                        if (isCenter) {
                            refCamera.current?.setCamera({
                                zoomLevel: 16,
                                animationDuration: 1000,
                                centerCoordinate: [longitude, latitude],
                                paddingBottom: 50
                            })
                        }
                    }
                )
                return
            } else {
                Alert.alert(
                    `Chức năng cần phải cho phép.`,
                    `Vị trí của bạn đã bị vô hiệu hoá\n `,
                    [
                        { text: 'Cài đặt', onPress: () => openSettings() },
                        {
                            text: 'Huỷ',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel'
                        }
                    ]
                )
            }
        } catch (e) {
            console.log(e)
            Alert.alert(
                `Chức năng cần phải cho phép.\n`,
                `Vị trí của bạn đã bị vô hiệu hoá\n `,
                [
                    { text: 'Cài đặt', onPress: () => openSettings() },
                    {
                        text: 'Huỷ',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel'
                    }
                ]
            )
        }
    }

    const hasLineString = useMemo(
        () =>
            helper.hasProperty(lineString[0], 'geometry') &&
            helper.hasProperty(lineString[0].geometry, 'coordinates') &&
            lineString[0]?.geometry?.coordinates?.length > 1 &&
            lineString[0]?.geometry?.coordinates[0][0] !==
                COMMON_CONST.NIL_LINE_STRINGS[0][0],
        [lineString]
    )

    const getRoute = (startCoords, endCoords, pro, reset) => {
        if (
            helper.IsNonEmptyArray(startCoords) &&
            helper.IsNonEmptyArray(endCoords)
        ) {
            if (reset) {
                dispatch(actionTrackingStaff.resetGetRoute())
            }
            dispatch(
                actionTrackingStaff.trackingStaff({
                    reference: reference,
                    profile: pro ?? profile,
                    rootCoords: startCoords,
                    destCoords: endCoords,
                    options: options
                })
            )
        }
    }
    const followUserMode = useMemo(
        () =>
            Platform.OS === 'android'
                ? Mapbox.UserTrackingMode.FollowWithHeading
                : Mapbox.UserTrackingMode.Follow,
        [Mapbox.UserTrackingMode]
    )
    const onMapPressed = (data) => {
        if (
            getLineString.data.length > 0 &&
            step === COMMON_CONST.StepRoute.routing
        ) {
            return
        }
        const coordinates = data?.geometry?.coordinates
        const request = {
            coordinates: coordinates
        }
        dispatch(actionTrackingStaff.getNearLocation(request))
    }
    const TopBar = () => {
        return (
            <View style={styles.viewTopBarContainer}>
                <View style={styles.viewTopBar}>
                    <TouchableOpacity
                        onPress={() => props.navigation.goBack()}
                        style={styles.btnGoBack}>
                        <Image
                            source={images.ic_left_arrow}
                            style={[Mixins.scaleImage(40, 40)]}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            cancelRouting()
                            setShowSearch(true)
                        }}
                        style={styles.searchBar}>
                        <MyText
                            numberOfLines={1}
                            text={
                                helper.IsNonEmptyString(inputEnd)
                                    ? inputEnd
                                    : 'Tìm kiếm vị trí...'
                            }
                            style={{
                                color: helper.IsNonEmptyString(inputEnd)
                                    ? null
                                    : '#7B8794',
                                textAlignVertical: 'top',
                                fontSize: 15,
                                paddingLeft: 0,
                                paddingBottom: 0,
                                flex: 9
                            }}
                            // ref={refSearch}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={getCurrentGPS} style={styles.btnGPS}>
                    <Image
                        source={images.ic_gps}
                        style={Mixins.scaleImage(30, 30)}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {TopBar()}
            <Mapbox.MapView
                ref={refMap}
                projection={'globe'}
                style={styles.map}
                styleURL={'https://cdnv2.tgdd.vn/maps/styles/mwg.json'}
                logoEnabled={false}
                compassEnabled={true}
                attributionEnabled={false}
                compassFadeWhenNorth={true}
                compassPosition={{
                    top: Platform.OS === 'android' ? 136 : 120,
                    right: 16
                }}
                scaleBarPosition={{ bottom: 0, left: 8 }}
                onPress={onMapPressed}>
                {helper.IsNonEmptyArray(destCoords) && (
                    <Mapbox.ShapeSource
                        id={'homeShape'}
                        key={'homeShape'}
                        shape={{
                            id: 'pin',
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: destCoords
                            }
                        }}>
                        <Mapbox.SymbolLayer
                            id={'homeSymbolLayer'}
                            key={'homeSymbolLayer'}
                            style={{
                                iconSize:
                                    (Platform.OS === 'ios' ? 0.06 : 0.08) *
                                    1.35,
                                iconImage: 'iconEnd',
                                iconAnchor: 'bottom',
                                iconAllowOverlap: true
                            }}
                        />
                    </Mapbox.ShapeSource>
                )}
                {helper.IsNonEmptyArray(startCoords) &&
                    step !== COMMON_CONST.StepRoute.routing && (
                        <Mapbox.ShapeSource
                            id={'startCoordsToRouting'}
                            key={'startCoordsToRouting'}
                            shape={{
                                id: 'pinStartCoordsToRouting',
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: startCoords
                                }
                            }}>
                            <Mapbox.SymbolLayer
                                id={'startCoordsToRouting'}
                                key={'startCoordsToRouting'}
                                style={{
                                    iconSize:
                                        (Platform.OS === 'ios' ? 0.06 : 0.08) *
                                        1.35,
                                    iconImage: 'iconStart',
                                    iconAnchor: 'bottom',
                                    iconAllowOverlap: true
                                }}
                            />
                        </Mapbox.ShapeSource>
                    )}
                <Mapbox.Images
                    images={{
                        iconStart: images.pinStart,
                        iconEnd: images.pinEnd
                    }}
                />
                <Mapbox.RasterDemSource
                    id={'rasterDemID'}
                    url={'FixMeNoURL'}
                    tileSize={514}
                    maxZoomLevel={14}>
                    <Mapbox.Terrain
                        style={{
                            exaggeration: 1.5
                        }}
                    />
                    <Mapbox.Atmosphere style={styles.mapAtmosphere} />
                    <Mapbox.SkyLayer
                        id={'skyLayerID'}
                        style={{
                            skyType: 'atmosphere',
                            skyAtmosphereSun: [0.0, 0.0],
                            skyAtmosphereSunIntensity: 15.0
                        }}
                    />
                </Mapbox.RasterDemSource>
                <MyLineString
                    isRouting={step === COMMON_CONST.StepRoute.routing}
                    endCoords={destCoords}
                    hasLineString={hasLineString}
                    lineString={getLineString?.data}
                    startCoordsToRouting={startCoords}
                    profile={profile}
                />
                <Mapbox.Camera
                    ref={refCamera}
                    allowUpdates={true}
                    zoomLevel={16}
                    centerCoordinate={
                        helper.IsNonEmptyArray(destCoords)
                            ? destCoords
                            : COMMON_CONST.HCM_DEFAULT_COORDS
                    }
                    animationDuration={0}
                    followUserMode={followUserMode}
                />
                <Mapbox.UserLocation
                    androidRenderMode={'gps'}
                    showsUserHeadingIndicator={true}
                    renderMode={
                        Platform.OS === 'ios'
                            ? Mapbox.UserLocationRenderMode.Normal
                            : Mapbox.UserLocationRenderMode.Native
                    }
                    visible={true}
                    onUpdate={onUserLocationUpdate}
                />
            </Mapbox.MapView>
            {dataXwork !== null && (
                <ChooseLocationModal
                    refBottom={refModal}
                    BottomSheetGorhom={dataXwork.BottomSheetGorhom}
                    setState={setState}
                    refCamera={refCamera}
                    state={state}
                    lineString={getLineString?.data}
                    getRoute={getRoute}
                    getLineString={getLineString}
                    onPressItem={onPressItem}
                    cancelRouting={cancelRouting}
                />
            )}
            <SearchLocation
                getDataSearch={getDataSearch}
                getLineString={getLineString}
                getRoute={getRoute}
                isVisible={showSearch}
                lineString={getLineString?.data}
                onPressItem={onPressItem}
                refSearch={refSearch}
                setShowSearch={setShowSearch}
                setState={setState}
                state={state}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    driveOptionTxt: { color: '#323F4B', fontSize: 16 },
    icCheckDriveOption: { width: 11, height: 11, tintColor: Colors.WHITE },
    driveOptionsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14
    },
    checkDriveOptions: {
        width: 20,
        height: 20,
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#7B8794'
    },
    contributeBtn: {
        borderRadius: 99,
        width: 56,
        height: 56,
        backgroundColor: Colors.DARK_BLUE_60,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end'
    },
    icPlus: { width: 24, height: 24, tintColor: Colors.WHITE },
    wrapContributeTxt: {
        padding: 12,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.DARK_BLUE_40
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        marginRight: 20,
        alignSelf: 'flex-end'
    },
    arrowRight: {
        borderTopWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftWidth: 8,
        borderTopColor: Colors.DARK_BLUE_40,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent'
    },
    btnContribute: {
        position: 'absolute',
        alignItems: 'flex-end',
        zIndex: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        alignSelf: 'flex-end'
    },
    btnGPS: {
        marginLeft: Mixins.scale(16),
        alignSelf: 'flex-start',
        padding: Mixins.scale(8),
        borderRadius: Mixins.scale(8),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    searchBar: {
        flex: 1,
        marginVertical: 8,
        paddingHorizontal: Mixins.scale(16),
        paddingVertical: Mixins.scale(16),
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 16,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    btnGoBack: {
        backgroundColor: '#F5F7FA',
        borderRadius: 99,
        height: Mixins.scale(50),
        width: Mixins.scale(50),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Mixins.scale(8)
    },
    viewTopBarContainer: {
        position: 'absolute',
        top: Mixins.scale(60),
        width: '100%',
        zIndex: 1000,
        pointerEvents: 'box-none'
    },
    viewTopBar: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: Mixins.scale(16)
    },
    mapAtmosphere: {
        color: 'rgb(186, 210, 235)',
        highColor: COMMON_CONST.ColorMain,
        horizonBlend: 0.02,
        spaceColor: 'rgb(11, 11, 25)',
        starIntensity: 0.6
    }
})
