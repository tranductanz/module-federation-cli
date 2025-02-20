/** @format */
import * as Repack from '@callstack-mwg/repack';

const deps = {
    react: Repack.Federated.SHARED_REACT,
    'react-native': Repack.Federated.SHARED_REACT,
    'react-native-fast-image': {
        singleton: true,
        eager: true
    },
    'react-native-safe-area-context': {
        singleton: true,
        eager: true
    },
    'react-native-gesture-handler': {
        singleton: true,
        eager: true
    },

    '@react-native-community/datetimepicker': {
        singleton: true,
        eager: true
    },
    'react-native-webview': {
        singleton: true,
        eager: true
    },
    'react-native-svg': {
        singleton: true,
        eager: true
    },

    '@react-navigation/native-stack': {
        singleton: true,
        eager: true
    },
    'lottie-react-native': {
        singleton: true,
        eager: true
    }
};

export { deps };
