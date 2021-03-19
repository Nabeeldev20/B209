import * as React from 'react'
import { View, StyleSheet, Text, ScrollView } from 'react-native'
import { Divider } from 'react-native-paper';
import { DrawerItem } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';

import { get_database } from './db'


export default function CustomDrawer({ navigation }) {
    let [fontsLoaded] = useFonts({
        'Cairo_700Bold': require('../assets/fonts/Cairo-Bold.ttf'),
        'Cairo_600SemiBold': require('../assets/fonts/Cairo-SemiBold.ttf'),
    });
    const get_subjects = () => {
        let output = [];
        get_database().forEach(file => output.push(file.subject))
        return [... new Set(output)]
    }
    return (
        <View style={styles.container}>

            <DrawerItem
                label='الرئيسة'
                icon={() => <MaterialCommunityIcons size={20} name='home' />}
                labelStyle={styles.drawer_text}
                style={{ marginVertical: 1 }}
                onPress={() => navigation.navigate('Home')} />

            <DrawerItem
                label='امتحان مخصص'
                icon={() => <MaterialCommunityIcons size={20} name='auto-fix' />}
                labelStyle={styles.drawer_text}
                onPress={() => navigation.navigate('CustomExam')}
                style={{ marginVertical: 1 }}
            />


            {get_subjects().length > 0 ?
                <View>
                    <Divider />
                    <View style={styles.row}>
                        <MaterialCommunityIcons name='bookshelf' color='grey' size={20} />
                        <Text style={{ fontFamily: 'Cairo_600SemiBold', margin: 5, fontSize: 16, color: 'grey' }}>المقررات</Text>
                    </View>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ flexGrow: 1 }}>
                        {get_subjects().map(subject => {
                            return (
                                <DrawerItem
                                    label={subject}
                                    key={subject}
                                    labelStyle={styles.drawer_text}
                                    onPress={() => navigation.navigate('SubjectStack', { screen: 'Subject', params: { subject_name: subject } })}
                                />
                            )
                        })}</ScrollView>

                </View> : null}
        </View>

    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 5
    },
    drawer_text: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 17,
        height: 27,
    }
})