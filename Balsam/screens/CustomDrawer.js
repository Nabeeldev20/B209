import * as React from 'react'
import { View, StyleSheet, Text, ScrollView } from 'react-native'
import { Divider } from 'react-native-paper';
import { DrawerItem } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { get_database } from './db'


export default function CustomDrawer({ navigation }) {
    let data = get_database()
    const get_subjects = () => {
        let output = [];
        data.forEach(file => output.push(file.subject))
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
                        <Text style={{ fontFamily: 'Cairo-SemiBold', margin: 5, fontSize: 15, color: 'grey' }}>المقررات</Text>
                    </View>
                    <ScrollView>
                        {get_subjects().map(subject => {
                            return (
                                <DrawerItem
                                    label={subject}
                                    key={subject}
                                    labelStyle={styles.drawer_text}
                                    onPress={() => navigation.navigate('SubjectStack', { screen: 'Subject', params: { subject_name: subject } })}
                                />
                            )
                        })}
                    </ScrollView>

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
        fontFamily: 'Cairo-Bold',
        fontSize: 14,
        height: 26,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 2
    }
})
