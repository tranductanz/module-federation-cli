import {
    SafeAreaProvider,
    SafeAreaInsetsContext
} from 'react-native-safe-area-context'
import { enableScreens } from 'react-native-screens'
import { LogBox } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import { store } from './store/index'
import MainNavigator from './navigator/mainNavigator'
import Mapbox from '@rnmapbox/maps'
import React, { Component } from 'react'

enableScreens()

Mapbox.setAccessToken('')

export default class App extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        LogBox.ignoreLogs([
            'Each child in a list should have a unique "key" prop'
        ])
    }

    render() {
        return (
            <SafeAreaProvider>
                <Provider store={store}>
                    <NavigationContainer>
                        <SafeAreaInsetsContext.Consumer>
                            {(insets) => {
                                return (
                                    <MainNavigator
                                        {...insets}
                                        {...this.props}
                                    />
                                )
                            }}
                        </SafeAreaInsetsContext.Consumer>
                    </NavigationContainer>
                </Provider>
            </SafeAreaProvider>
        )
    }
}
