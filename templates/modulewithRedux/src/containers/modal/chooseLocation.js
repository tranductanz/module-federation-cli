import { MyText } from '@mwg-kits/components'
import React, { useMemo, useState, Fragment, useEffect } from 'react'
import { Mixins } from '@mwg-sdk/styles'
import {
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StyleSheet,
    Alert
} from 'react-native'
import { openSettings } from 'react-native-permissions'
import { images } from '../../assets'
import { COMMON_CONST } from '../../constants'
import Geolocation from 'react-native-geolocation-service'
import { requestPermission } from '@mwg-kits/core'
import { helper } from '@mwg-kits/common'
import * as utils from '../../utils'
const AvoidFeatures = {
    highways: 'highways',
    tollways: 'tollways',
    ferries: 'ferries'
}
export const RouteProfiles = {
    motorcycle: 'driving-motorcycle',
    walk: 'foot-walking',
    car: 'driving-car'
}
const StepRoute = {
    searching: 'searching',
    choosed: 'choosed',
    routing: 'routing',
    chooseStart: 'choose-start'
}
const ColorMain = 'rgba(79, 129, 239, 1)'
export const ChooseLocationModal = React.memo(
    ({
        refBottom,
        BottomSheetGorhom,
        setState,
        refCamera,
        state,
        lineString,
        getRoute,
        getLineString,
        cancelRouting
    }) => {
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
            userCoords
        } = state
        const lineStringRoute = lineString?.[0]?.properties?.segments?.[0]
        const [isOpenOptions, setIsOpenOptions] = useState(false)
        const snap = useMemo(() => {
            switch (step) {
                case StepRoute.searching:
                    return ['35%']
                case StepRoute.choosed:
                    return ['35%']
                case StepRoute.routing:
                    return ['25%']
                case StepRoute.chooseStart:
                    return ['30%']
                default:
                    return ['30%']
            }
        }, [step, isOpenOptions])

        const onPressOptionRoute = ({ id, name }) => {
            const data = options?.avoid_features ?? []
            if (data?.some((e) => e === id)) {
                const newArr = data.filter((e) => e !== id)
                const avoid_features =
                    newArr.length === 0
                        ? null
                        : {
                              avoid_features: newArr
                          }
                setState((prev) => ({ ...prev, options: avoid_features }))
            } else {
                data?.push(id)
                const avoid_features = {
                    avoid_features: data
                }
                setState((prev) => ({ ...prev, options: avoid_features }))
            }
        }
        const renderItemProfile = ({ item, index }) => {
            return (
                <TouchableOpacity
                    onPress={() => {
                        if (
                            helper.IsNonEmptyArray(startCoords) &&
                            helper.IsNonEmptyArray(destCoords)
                        ) {
                            getRoute(startCoords, destCoords, item.id, true)
                        } else if (startCoords.length === 0) {
                            optionGetGPSOrChooseMap()
                        }
                        setState((prev) => ({ ...prev, profile: item.id }))
                    }}
                    style={[
                        Mixins.scaleImage(36, 36),
                        styles.renderItemProfile,
                        {
                            backgroundColor:
                                profile === item.id ? ColorMain : 'white'
                        }
                    ]}>
                    <Image
                        source={item.icon}
                        style={[
                            Mixins.scaleImage(40, 40),
                            {
                                tintColor:
                                    profile === item.id ? 'white' : ColorMain
                            }
                        ]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            )
        }
        const OptionRoute = ({ id, name }) => {
            const check = options?.avoid_features.some((e) => e === id)
            return (
                <TouchableOpacity
                    onPress={() => {
                        onPressOptionRoute({ id, name })
                    }}
                    style={{
                        flexDirection: 'row',
                        paddingVertical: 8,
                        alignItems: 'center'
                    }}>
                    <View
                        style={{
                            borderRadius: 4,
                            marginRight: Mixins.scale(8),
                            padding: 2,
                            borderWidth: 1,
                            borderColor: check ? 'white' : ColorMain,
                            backgroundColor: check ? ColorMain : 'white'
                        }}>
                        <Image
                            source={images.ic_check_white}
                            style={Mixins.scaleImage(16, 16)}
                            resizeMode="contain"
                        />
                    </View>
                    <MyText text={name} addSize={1} />
                </TouchableOpacity>
            )
        }
        const getCurrentGPS = async () => {
            try {
                const status = await requestPermission('location')
                console.log('status', status)
                if (status === 'granted') {
                    Geolocation.getCurrentPosition(
                        ({ coords: { longitude, latitude } }) => {
                            setState((prev) => ({
                                ...prev,
                                userCoords: [longitude, latitude]
                            }))
                        }
                    )
                    return
                } else {
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
            } catch (e) {
                console.log('e', e)
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
        const optionGetGPSOrChooseMap = () => {
            return Alert.alert(
                `Chọn điểm bắt đầu`,
                `Vui lòng chọn điểm bắt đầu trên bản đồ`,
                [
                    {
                        text: 'Sử dụng định vị',
                        onPress: async () => {
                            const status = await requestPermission('location')
                            if (status === 'granted') {
                                Geolocation.getCurrentPosition(
                                    ({ coords: { longitude, latitude } }) => {
                                        setState((p) => ({
                                            ...p,
                                            startCoords: [longitude, latitude]
                                        }))
                                        getRoute(
                                            [longitude, latitude],
                                            destCoords
                                        )
                                    }
                                )
                            } else {
                                getCurrentGPS()
                            }
                        }
                    },
                    {
                        text: 'Chọn địa điểm',
                        onPress: () =>
                            setState((p) => ({
                                ...p,
                                step: StepRoute.chooseStart
                            }))
                    },
                    {
                        text: 'Huỷ',
                        onPress: () => {},
                        style: 'cancel'
                    }
                ]
            )
        }
        const onPressStart = async () => {
            try {
                const status = await requestPermission('location')
                if (status === 'granted') {
                    Geolocation.getCurrentPosition(
                        ({ coords: { longitude, latitude } }) => {
                            setState((p) => ({
                                ...p,
                                startCoords: [longitude, latitude],
                                isRouting: true,
                                step: StepRoute.routing
                            }))
                            getRoute([longitude, latitude], destCoords)

                            refCamera.current?.setCamera({
                                pitch: 45,
                                zoomLevel: 18,
                                animationDuration: 1000,
                                centerCoordinate: [longitude, latitude]
                            })
                        }
                    )
                }
            } catch (e) {
                console.log(e)
                getCurrentGPS()
            }
        }
        const StepChoosen = () => {
            if (step === StepRoute.choosed && isOpenOptions) {
                return null
            }
            return (
                <BottomSheetGorhom.BottomSheetScrollView style={{ flex: 1 }}>
                    {namePointEnd &&
                        !isRouting &&
                        step === StepRoute.choosed && (
                            <View>
                                {helper.IsNonEmptyArray(lineString) && (
                                    <View
                                        style={{
                                            height: Mixins.scale(66),
                                            flexDirection: 'row'
                                        }}>
                                        <BottomSheetGorhom.BottomSheetFlatList
                                            scrollEnabled={false}
                                            horizontal
                                            data={COMMON_CONST.ArrProfile}
                                            renderItem={renderItemProfile}
                                        />
                                        {/* <TouchableOpacity onPress={()=>{

                                        }}>
                                            <Image
                                                source={images.ic_close}
                                                style={Mixins.scaleImage(
                                                    20,
                                                    20
                                                )}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity> */}
                                    </View>
                                )}
                                <View
                                    style={{
                                        width: '100%',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between'
                                    }}>
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between'
                                        }}>
                                        {getLineString.data.length === 0 && (
                                            <TouchableOpacity
                                                disabled={
                                                    getLineString.isFetching
                                                }
                                                style={styles.btnGetRoute}
                                                onPress={() => {
                                                    optionGetGPSOrChooseMap()
                                                    // getCurrentGPS();
                                                }}>
                                                {getLineString.isFetching ? (
                                                    <ActivityIndicator color="white" />
                                                ) : (
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            justifyContent:
                                                                'center',
                                                            alignItems: 'center'
                                                        }}>
                                                        <Image
                                                            source={
                                                                images.ic_routing
                                                            }
                                                            style={[
                                                                Mixins.scaleImage(
                                                                    30,
                                                                    30
                                                                ),
                                                                {
                                                                    tintColor:
                                                                        'white'
                                                                }
                                                            ]}
                                                            resizeMode="contain"
                                                        />
                                                        <MyText
                                                            text="Chỉ đường"
                                                            style={{
                                                                paddingLeft:
                                                                    Mixins.scale(
                                                                        8
                                                                    ),
                                                                color: 'white'
                                                            }}
                                                            addSize={2}
                                                            typeFont="medium"
                                                        />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            style={styles.btnStart}
                                            onPress={onPressStart}>
                                            <Image
                                                source={images.ic_navigate}
                                                style={[
                                                    Mixins.scaleImage(30, 30),
                                                    {
                                                        tintColor: ColorMain
                                                    }
                                                ]}
                                                resizeMode="contain"
                                            />
                                            <MyText
                                                addSize={2}
                                                text="Bắt đầu"
                                                style={{
                                                    paddingLeft:
                                                        Mixins.scale(8),
                                                    color: ColorMain
                                                }}
                                                typeFont="medium"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.btnMore}
                                        onPress={() => {
                                            // TODO:
                                            setIsOpenOptions(true)
                                        }}>
                                        <Image
                                            source={images.ic_more_vertical}
                                            style={[
                                                Mixins.scaleImage(20, 20),
                                                { tintColor: ColorMain }
                                            ]}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                    {step === StepRoute.routing && (
                        <TouchableOpacity
                            style={styles.btnCancel}
                            onPress={cancelRouting}>
                            <MyText text="Huỷ" style={{ color: 'white' }} />
                        </TouchableOpacity>
                    )}
                    {step === StepRoute.chooseStart &&
                        helper.IsEmptyString(namePointStart) && (
                            <MyText
                                text={'Vui lòng chọn điểm bắt đầu'}
                                addSize={2}
                                style={{
                                    paddingBottom: Mixins.scale(6),
                                    alignSelf: 'center'
                                }}
                            />
                        )}
                    {!isOpenOptions &&
                        (step === StepRoute.choosed ||
                            step === StepRoute.routing) && (
                            <View style={{ flex: 1 }}>{renderDistance()}</View>
                        )}

                    <MyText
                        text={
                            step === StepRoute.chooseStart
                                ? namePointStart
                                : namePointEnd
                        }
                        addSize={2}
                        style={{ paddingBottom: Mixins.scale(6) }}
                    />

                    {step === StepRoute.chooseStart &&
                        helper.IsNonEmptyArray(startCoords) && (
                            <TouchableOpacity
                                style={styles.optionsApprove}
                                onPress={() => {
                                    getRoute(startCoords, destCoords)
                                    setState((p) => ({
                                        ...p,
                                        step: StepRoute.choosed
                                    }))
                                }}>
                                <MyText
                                    text="Xác nhận"
                                    style={{ color: 'white' }}
                                />
                            </TouchableOpacity>
                        )}
                </BottomSheetGorhom.BottomSheetScrollView>
            )
        }
        const renderDistance = () => {
            if (lineStringRoute)
                return (
                    <MyText
                        text={`${utils.caculateDuration(
                            lineStringRoute?.duration
                        )} `}
                        addSize={5}
                        typeFont="medium">
                        <MyText
                            text={
                                lineStringRoute?.distance < 1
                                    ? `(${Math.floor(
                                          lineStringRoute?.distance * 1000
                                      )}m)`
                                    : `(${lineStringRoute?.distance.toFixed(
                                          1
                                      )}km)`
                            }
                            addSize={5}
                            typeFont="medium"
                        />
                    </MyText>
                )
            else if (helper.IsNonEmptyArray(userCoords))
                return (
                    <MyText
                        text={`(${utils
                            .distanceLonLatKm(userCoords, destCoords)
                            .toFixed(1)}km)`}
                        addSize={5}
                        typeFont="medium"
                    />
                )
            else return null
        }
        const StepChoose = () => {
            if (
                !isOpenOptions ||
                step === StepRoute.searching ||
                step === StepRoute.routing
            ) {
                return null
            }
            return (
                <View style={{ justifyContent: 'space-between', flex: 1 }}>
                    <View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingBottom: Mixins.scale(16)
                            }}>
                            <MyText
                                text="Các tuỳ chọn"
                                addSize={4}
                                typeFont="medium"
                            />
                            <TouchableOpacity
                                hitSlop={{
                                    top: 5,
                                    bottom: 5,
                                    left: 5,
                                    right: 5
                                }}
                                onPress={() => {
                                    setIsOpenOptions(false)
                                }}>
                                <Image
                                    source={images.ic_close}
                                    style={Mixins.scaleImage(12, 12)}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>

                        {profile !== RouteProfiles.walk && (
                            <Fragment>
                                <OptionRoute
                                    id={AvoidFeatures.tollways}
                                    name="Tránh trạm thu phí"
                                />
                                <OptionRoute
                                    id={AvoidFeatures.highways}
                                    name="Tránh đường cao tốc"
                                />
                            </Fragment>
                        )}
                        <OptionRoute
                            id={AvoidFeatures.ferries}
                            name="Tránh phà"
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.optionsApprove}
                        onPress={() => {
                            setIsOpenOptions(false)
                            if (
                                helper.IsNonEmptyArray(startCoords) &&
                                helper.IsNonEmptyArray(destCoords)
                            )
                                getRoute(startCoords, destCoords, profile)
                        }}>
                        <MyText text="Áp dụng" style={{ color: 'white' }} />
                    </TouchableOpacity>
                </View>
            )
        }
        return (
            <BottomSheetGorhom.BottomSheetModal
                enablePanDownToClose={false}
                ref={refBottom}
                index={0}
                snapPoints={snap}
                onDismiss={() => {}}>
                <View
                    style={{
                        flex: 1,
                        margin: Mixins.scale(16),
                        backgroundColor: 'white'
                    }}>
                    <StepChoosen />
                    <StepChoose />
                </View>
            </BottomSheetGorhom.BottomSheetModal>
        )
    }
)
const styles = StyleSheet.create({
    renderItem: {
        paddingVertical: Mixins.scale(8),
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        justifyContent: 'space-between'
    },
    renderItemProfile: {
        marginRight: Mixins.scale(8),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ColorMain,

        borderRadius: 10,
        padding: Mixins.scale(20)
    },
    optionsApprove: {
        marginTop: Mixins.scale(16),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Mixins.scale(16),
        backgroundColor: ColorMain,
        marginBottom: Mixins.scale(8),
        marginBottom: Mixins.scale(16)
    },
    btnStart: {
        flex: 1,
        borderRadius: Mixins.scale(16),
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Mixins.scale(8),
        marginBottom: Mixins.scale(8),
        borderWidth: 1,
        flexDirection: 'row',
        borderColor: ColorMain
    },
    btnGetRoute: {
        flex: 1,
        borderRadius: Mixins.scale(16),
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Mixins.scale(8),
        backgroundColor: ColorMain,
        marginBottom: Mixins.scale(8),
        marginRight: Mixins.scale(8)
    },
    btnMore: {
        borderRadius: Mixins.scale(16),
        justifyContent: 'center',
        alignItems: 'center',
        padding: Mixins.scale(16),
        marginBottom: Mixins.scale(8),
        borderWidth: 1,
        marginLeft: Mixins.scale(8),
        borderColor: ColorMain
    },
    btnCancel: {
        borderRadius: Mixins.scale(16),
        justifyContent: 'center',
        alignItems: 'center',
        padding: Mixins.scale(16),
        backgroundColor: '#EF4E4E',
        marginBottom: Mixins.scale(16)
    }
})
