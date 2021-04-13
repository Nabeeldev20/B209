/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from './Home';
import Exam from './Exam';
import FinishScreen from './FinishScreen';
import Activation from './Activation';



export default function HomeStack({ navigation }) {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator
            screenOptions={{ headerStyle: { height: 50 } }}>
            <Stack.Screen
                name="Home"
                component={Home}
                options={{
                    title: 'بلســم',
                    headerTitleStyle: { fontFamily: 'Cairo-Bold', fontSize: 16 },
                    headerLeft: () => (
                        <MaterialCommunityIcons
                            size={30}
                            style={{ marginLeft: 20 }}
                            name="menu"
                            onPress={() => navigation.openDrawer()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="Exam"
                options={({ route }) => ({
                    title: route.params.quiz.title,
                    headerTitleStyle: {
                        color: '#313131',
                        fontSize: 14,
                        fontFamily: 'Cairo-Bold',
                    },
                })}
                component={Exam}
            />
            <Stack.Screen
                name="FinishScreen"
                component={FinishScreen}
                options={({ route }) => ({
                    title: route.params.quiz.title,
                    headerTitleStyle: {
                        color: '#313131',
                        fontSize: 14,
                        fontFamily: 'Cairo-Bold',
                    },
                })}
            />
            <Stack.Screen
                name="Activation"
                component={Activation}
                options={({ route }) => ({
                    headerTitleStyle: {
                        color: '#313131',
                        fontSize: 14,
                        fontFamily: 'Cairo-Bold',
                    },
                })}
            />
        </Stack.Navigator>
    );
}

