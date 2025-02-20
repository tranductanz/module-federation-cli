import Mapbox from '@rnmapbox/maps'
import { lineString as makeLineString } from '@turf/helpers'
import { helper } from '@mwg-kits/common'
import { Fragment } from 'react'
import { COMMON_CONST } from '../constants'

export const switchMainLine = false
export const MyLineString = ({
    hasLineString,
    lineString,
    startCoordsToRouting,
    endCoords,
    profile,
    isRouting
}) => {
    if (!hasLineString) {
        return null
    }

    const mainLineString = lineString[0].geometry.coordinates
    let subLineString1 = makeLineString(COMMON_CONST.NIL_LINE_STRINGS)
    if (lineString?.length === 2) {
        subLineString1 = makeLineString(lineString[1].geometry.coordinates)
    }
    let subLineString2 = makeLineString(COMMON_CONST.NIL_LINE_STRINGS)
    if (lineString?.length === 3) {
        subLineString2 = makeLineString(lineString[2].geometry.coordinates)
    }
    const mainShape = makeLineString(mainLineString)
    const startShape = makeLineString([startCoordsToRouting, mainLineString[0]])
    const endShape = makeLineString([
        mainLineString[mainLineString.length - 1],
        endCoords
    ])
    return (
        <Fragment>
            {helper.IsEmptyArray(subLineString1) ||
            profile === COMMON_CONST.RouteProfiles.walk ? null : (
                <Mapbox.ShapeSource
                    id={'subLineStringId1'}
                    shape={subLineString1}>
                    <Mapbox.LineLayer
                        id={'subLayerLineId1'}
                        style={{
                            ...lineStyleSubLayerProps
                        }}
                    />
                </Mapbox.ShapeSource>
            )}
            {helper.IsEmptyArray(subLineString2) ||
            profile === COMMON_CONST.RouteProfiles.walk ? null : (
                <Mapbox.ShapeSource
                    id={'subLineStringId2'}
                    shape={subLineString2}>
                    <Mapbox.LineLayer
                        id={'subLayerLineId2'}
                        style={{
                            ...lineStyleSubLayerProps,
                            lineColor: switchMainLine
                                ? lineStyleLayerProps.lineColor
                                : lineStyleSubLayerProps.lineColor
                        }}
                    />
                </Mapbox.ShapeSource>
            )}
            <Mapbox.ShapeSource id={'lineStringId'} shape={mainShape}>
                <Mapbox.LineLayer
                    id={'layerLineId'}
                    belowLayerID={
                        switchMainLine ? 'subLayerLineId2' : undefined
                    }
                    style={{
                        ...lineStyleLayerProps,
                        lineDasharray:
                            profile === COMMON_CONST.RouteProfiles.walk
                                ? [0, 1, 2]
                                : [],
                        lineColor: switchMainLine
                            ? lineStyleSubLayerProps.lineColor
                            : lineStyleLayerProps.lineColor
                    }}
                />
            </Mapbox.ShapeSource>

            <Mapbox.ShapeSource id={'shapeEndToPin'} shape={endShape}>
                <Mapbox.LineLayer
                    id={'shapeEndToPin'}
                    style={lineStyleLayerProps}
                />
            </Mapbox.ShapeSource>

            {!isRouting && (
                <Mapbox.ShapeSource id={'coordsToStart'} shape={startShape}>
                    <Mapbox.LineLayer
                        id={'coordsToStart'}
                        style={lineStyleLayerProps}
                    />
                </Mapbox.ShapeSource>
            )}
        </Fragment>
    )
}
export const lineStyleLayerProps = {
    lineColor: 'rgba(79, 129, 239, 1)',
    lineWidth: 5,
    lineJoin: 'round',
    lineDasharray: [0, 1, 2]
}
export const lineStyleSubLayerProps = {
    lineColor: 'rgba(176, 176, 176, 1)',
    lineWidth: 5,
    lineJoin: 'round'
}
