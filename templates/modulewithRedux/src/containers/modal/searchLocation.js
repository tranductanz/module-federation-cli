import { MyText, BaseModal } from '@mwg-kits/components'
import React, { useMemo, useState, Fragment } from 'react'
import { Mixins } from '@mwg-sdk/styles'
import {
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StyleSheet,
    Platform,
    TextInput,
    SafeAreaView,
    FlatList
} from 'react-native'
import { images } from '../../assets'
import { helper } from '@mwg-kits/common'
import * as utils from '../../utils'
export const RouteProfiles = {
    motorcycle: 'driving-motorcycle',
    walk: 'foot-walking',
    car: 'driving-car'
}
const ColorMain = 'rgba(79, 129, 239, 1)'
export const SearchLocation = React.memo(
    ({
        isVisible,
        setState,
        state,
        getDataSearch,
        onPressItem,
        setShowSearch,
        refSearch
    }) => {
        const renderItem = ({ item, index }) => {
            const { properties, geometry } = item
            return (
                <TouchableOpacity
                    onPress={() => onPressItem(item)}
                    style={styles.renderItem}>
                    <View
                        style={{
                            flex: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingRight: Mixins.scale(4)
                        }}>
                        <Image
                            source={images.pinEnd}
                            style={Mixins.scaleImage(30, 30)}
                            resizeMode="contain"
                        />
                        {(helper.IsNonEmptyArray(state.desCoords) ||
                            helper.IsNonEmptyArray(state.userCoords)) && (
                            <MyText
                                text={`${utils
                                    .distanceLonLatKm(
                                        geometry.coordinates,
                                        helper.IsNonEmptyArray(state.desCoords)
                                            ? state.desCoords
                                            : state.userCoords
                                    )
                                    .toFixed(1)}km`}
                            />
                        )}
                    </View>

                    <View style={{ flex: 8 }}>
                        <MyText
                            text={properties?.searchName}
                            addSize={2}
                            numberOfLines={1}
                        />
                        <MyText
                            numberOfLines={1}
                            text={`${properties?.road}, ${properties?.wardname}, ${properties?.districtname}, ${properties?.provincename}`}
                        />
                    </View>
                </TouchableOpacity>
            )
        }
        const StepSearch = () => {
            return (
                <View style={{ flex: 1, marginHorizontal: Mixins.scale(16) }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowSearch(false)
                            }}
                            style={{
                                backgroundColor: '#F5F7FA',
                                borderRadius: 99,
                                height: Mixins.scale(50),
                                width: Mixins.scale(50),
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: Mixins.scale(8)
                            }}>
                            <Image
                                source={images.ic_left_arrow}
                                style={[Mixins.scaleImage(40, 40)]}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>

                        <View
                            style={{
                                flex: 1,
                                marginVertical: 8,
                                paddingHorizontal: Mixins.scale(16),
                                paddingVertical:
                                    Platform.OS === 'android'
                                        ? Mixins.scale(8)
                                        : Mixins.scale(16),
                                borderWidth: 1,
                                borderColor: 'black',
                                borderRadius: 16,
                                backgroundColor: 'white',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                            <TextInput
                                value={state.inputEnd}
                                placeholder="Tìm kiếm vị trí..."
                                placeholderTextColor="#7B8794"
                                style={{
                                    textAlignVertical: 'top',
                                    fontSize: 15,
                                    paddingLeft: 0,
                                    paddingBottom: 0,
                                    flex: 9
                                }}
                                ref={refSearch}
                                onChangeText={(t) => {
                                    setState((p) => ({ ...p, inputEnd: t }))
                                }}
                            />
                            {state.inputEnd !== '' && (
                                <TouchableOpacity
                                    hitSlop={{
                                        top: 10,
                                        bottom: 10,
                                        left: 10,
                                        right: 10
                                    }}
                                    onPress={() => {
                                        setState((prev) => ({
                                            ...prev,
                                            inputEnd: ''
                                        }))
                                    }}
                                    style={[
                                        Mixins.scaleImage(20, 20),
                                        {
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignItems: 'flex-end'
                                        }
                                    ]}>
                                    <Image
                                        source={images.ic_delete}
                                        style={[Mixins.scaleImage(16, 16)]}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    {getDataSearch.isFetching ? (
                        <View style={{ paddingTop: 50 }}>
                            <ActivityIndicator color={ColorMain} size="large" />
                        </View>
                    ) : (
                        <FlatList
                            contentContainerStyle={{ flex: 1 }}
                            data={getDataSearch.data}
                            renderItem={renderItem}
                            ListEmptyComponent={() => {
                                return (
                                    <MyText
                                        text="Không tìm thấy kết quả nào."
                                        style={{ alignSelf: 'center' }}
                                    />
                                )
                            }}
                        />
                    )}
                </View>
            )
        }
        return (
            <BaseModal
                onModalShow={() => {
                    refSearch.current?.focus()
                }}
                isVisible={isVisible}
                animationIn={'slideInUp'}
                animationOut={'slideOutDown'}
                animationInTiming={450}
                animationOutTiming={500}
                //   onBackdropPress={onRequestClose}
                onBackButtonPress={() => {
                    setShowSearch(false)
                }}
                style={{ zIndex: 1 }}>
                <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                    {StepSearch()}
                </SafeAreaView>
            </BaseModal>
        )
    }
)
const styles = StyleSheet.create({
    renderItem: {
        paddingVertical: Mixins.scale(8),
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1
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
