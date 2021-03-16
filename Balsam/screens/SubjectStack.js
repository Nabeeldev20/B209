import * as React from 'react'
import { View, Text, Button } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack';
import Bookmarks from './Bookmarks'
import { Octicons } from '@expo/vector-icons';
import Subject from './Subject'

export default function SubjectStack({ navigation, route }) {
    const Stack = createStackNavigator();

    return (
        <Stack.Navigator screenOptions={{ headerStyle: { height: 50 } }}>
            <Stack.Screen
                name="Subject"
                component={Subject}
                options={{
                    headerTitleStyle: { fontFamily: 'Cairo_700Bold', height: 30 },
                    headerLeft: () => (<Octicons size={24} style={{ marginLeft: 20 }} name='three-bars' onPress={() => navigation.openDrawer()} />)
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