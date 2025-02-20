import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Home } from '../containers'
import { bindActionCreators } from 'redux'
import * as _actionTrackingStaff from '../containers/action'
import AsyncStorage from '@react-native-async-storage/async-storage'

class MainAppNavigator extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this._action()
    }
    componentWillUnmount() {
        this.props.actionTrackingStaff.resetData()
    }

    _action = async () => {
        const data = this.props
        await this.props.actionTrackingStaff.getDataXwork(data)
        const loginInfo = await AsyncStorage.getItem('LoginInfo')
    }

    render() {
        const { Stack } = this.props

        return (
            <Stack.Navigator
                screenOptions={{
                    headerShown: false
                }}
                initialRouteName="">
                <Stack.Screen name="Home" component={Home} />
            </Stack.Navigator>
        )
    }
}

const mapStateToProps = function () {
    return {}
}

const mapDispatchToProps = (dispatch) => {
    return {
        actionTrackingStaff: bindActionCreators(_actionTrackingStaff, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(MainAppNavigator)
