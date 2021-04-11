/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Divider } from 'react-native-paper';
import { DrawerItem, DrawerContentScrollView } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { get_database } from './db';

export default function CustomDrawer({ navigation }) {
    let data = get_database();
    const get_subjects = () => {
        let output = [];
        data.forEach(file => output.push(file.subject));
        return [...new Set(output)];
    };
    return (
        <DrawerContentScrollView>
            <View style={styles.container}>
                <DrawerItem
                    label="الرئيسة"
                    icon={() => <MaterialCommunityIcons size={20} name="home" />}
                    labelStyle={styles.drawer_text}
                    style={{ marginVertical: 1 }}
                    onPress={() => navigation.navigate('Home')}
                />

                <DrawerItem
                    label="امتحان مخصص"
                    icon={() => <MaterialCommunityIcons size={20} name="auto-fix" />}
                    labelStyle={styles.drawer_text}
                    onPress={() => navigation.navigate('CustomExam')}
                    style={{ marginVertical: 1 }}
                />

                <DrawerItem
                    label="المحفوظات"
                    icon={() => (
                        <MaterialCommunityIcons size={20} name="bookmark-multiple" />
                    )}
                    labelStyle={styles.drawer_text}
                    onPress={() => navigation.navigate('Bookmarks')}
                    style={{ marginVertical: 1 }}
                />
                {get_subjects().length > 0 ? (
                    <View>
                        <Divider />
                        <View style={styles.row}>
                            <MaterialCommunityIcons
                                name="bookshelf"
                                color="#616161"
                                size={20}
                            />
                            <Text
                                style={{
                                    fontFamily: 'Cairo-SemiBold',
                                    margin: 5,
                                    fontSize: 15,
                                    color: '#616161',
                                }}>
                                المقررات
              </Text>
                        </View>
                        {get_subjects().map(subject => {
                            return (
                                <DrawerItem
                                    label={subject}
                                    key={subject}
                                    labelStyle={styles.drawer_text}
                                    onPress={() =>
                                        navigation.navigate('Subject', { subject_name: subject })
                                    }
                                />
                            );
                        })}
                    </View>
                ) : null}
            </View>
        </DrawerContentScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 5,
    },
    drawer_text: {
        fontFamily: 'Cairo-Bold',
        fontSize: 14,
        height: 26,
        color: '#616161',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 2,
    },
});
