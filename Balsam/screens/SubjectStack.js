import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Subject from './Subject'
import Bookmarks from './Bookmarks'
import { useFonts } from 'expo-font';

export default function SubjectStack({ navigation }) {
    const Stack = createStackNavigator();
    let [fontsLoaded] = useFonts({
        'Cairo_700Bold': require('../assets/fonts/Cairo-Bold.ttf'),
    });
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { height: 50 } }}>
            <Stack.Screen
                name="Subject"
                component={Subject}
                options={{
                    headerTitleStyle: { fontFamily: 'Cairo_700Bold', height: 30 },
                    headerLeft: () => (<MaterialCommunityIcons size={24} style={{ marginLeft: 20 }} name='menu' onPress={() => navigation.openDrawer()} />)
                }} />
            <Stack.Screen
                name='Bookmarks'
                component={Bookmarks}
                options={{
                    headerTitleStyle: { fontFamily: 'Cairo_700Bold', height: 30 },
                }} />
        </Stack.Navigator>
    )
} 