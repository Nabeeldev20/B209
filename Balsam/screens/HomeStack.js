/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Animatable from 'react-native-animatable';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from './Home';
import Exam from './Exam';
import FinishScreen from './FinishScreen';
import Activation from './Activation';



export default function HomeStack({ navigation }) {
    const Stack = createStackNavigator();
    const [loading, set_loading] = React.useState(true);
    function LoadingScreen() {
        React.useEffect(() => {
            setTimeout(() => {
                set_loading(false);
            }, 1250);
        }, []);
        return (
            <Animatable.View
                animation="flash"
                iterationCount="infinite"
                duration={3500}
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                }}>
                <MaterialCommunityIcons name="folder-sync" size={35} color="grey" />
                <Text style={[styles.headline, { color: 'grey' }]}>جاري التحميل</Text>
            </Animatable.View>
        );
    }
    return (
        <Stack.Navigator
            screenOptions={{ headerStyle: { height: 50 } }}>
            {loading ?
                <Stack.Screen name="loading" component={LoadingScreen} options={{ headerShown: false, gestureEnabled: false }} />
                : (<>
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
                </>)}
        </Stack.Navigator>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff',
        justifyContent: 'flex-end',
        marginBottom: '2%',
    },
    welcome: {
        fontFamily: 'Cairo-Bold',
        fontSize: 35,
        padding: 10,
        paddingBottom: 3,
    },
    headline: {
        fontFamily: 'Cairo-Bold',
        fontSize: 21,
        paddingBottom: 20,
    },
    text: {
        fontFamily: 'Cairo-SemiBold',
        color: 'grey',
    },
    button: {
        letterSpacing: 0,
        fontFamily: 'Cairo-Bold',
    },
});
