import * as React from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, Switch } from 'react-native'
import { Surface, Portal, Dialog, IconButton, Button, Divider } from 'react-native-paper'
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FileSystem } from 'react-native-file-access';
import { DateTime } from 'luxon'
import Analytics from 'appcenter-analytics';

import { get_database, update_database, get_bookmarks, erase_database } from './db'
// TODO fix paid file issues here
export default function Subject({ navigation, route }) {
    const { subject_name } = route.params;

    React.useEffect(() => {
        navigation.setOptions({ title: subject_name });
    }, [subject_name])

    const [onlyCycles, setOnlyCycles] = React.useState(false);
    const [data, setData] = React.useState(get_database().filter(quiz => quiz.subject == subject_name))
    const [dialogData, setDialogData] = React.useState({ visible: false })


    function Header() {
        return (
            <View style={[styles.row, { justifyContent: get_bookmarks().filter(bookmark => bookmark.subject == subject_name).length >= 1 ? 'space-between' : 'flex-end', alignItems: 'baselines' }]}>
                {get_bookmarks().filter(bookmark => bookmark.subject == subject_name).length >= 1 ?
                    <Pressable
                        onPress={() => navigation.navigate('Bookmarks', { subject_name })}
                        android_ripple={{ color: 'rgba(0, 0, 0, .32)', borderless: false }}
                        style={{ marginVertical: 3 }}
                    >
                        <View style={styles.row}>
                            <MaterialCommunityIcons style={{ marginRight: 3 }} name='bookmark-multiple' size={16} color='grey' />
                            <Text style={styles.Header_text}>المحفوظات
                                   ( {get_bookmarks().length})
                            </Text>
                        </View>
                    </Pressable> : null}

                <View style={styles.row}>
                    <MaterialCommunityIcons
                        name='check-decagram'
                        color='grey'
                        size={16} style={{ marginRight: 6 }} />
                    <Text style={[styles.Header_text, { marginRight: 5 }]}>الدورات فقط</Text>
                    <Switch
                        value={onlyCycles}
                        onValueChange={handle_switch}
                        trackColor={{ false: '#767577', true: '#ec9b99' }}
                        thumbColor={{ false: '#f4f3f4', true: '#E53935' }} />
                </View>
            </View>
        )
    }

    function empty_state_cycle() {
        return (
            <Animatable.View animation="fadeIn" style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
                <MaterialCommunityIcons
                    name='file-hidden'
                    color='grey'
                    size={50} style={{ marginLeft: 5 }} />
                <Text style={{ fontFamily: 'Cairo_700Bold', color: 'grey' }}>الدنيا دوارة بس لا يوجد دورات هنا</Text>
            </Animatable.View>
        )
    }

    function handle_switch() {
        if (!onlyCycles) {
            setData(data.filter(quiz => quiz.cycle_university.length > 3))
            setOnlyCycles(true)
        } else {
            setOnlyCycles(false)
            setData(get_database().filter(quiz => quiz.subject == subject_name))
        }
    }


    async function remove_file(title, path) {
        setData(data.filter(quiz => quiz.title != title));
        setDialogData({ visible: false })
        //db.js
        erase_database()
        update_database(...data.filter(quiz => quiz.title != title));
        try {
            await FileSystem.unlink(path)
        } catch (error) {

        }
    }
    if (data.length > 0) {
        if (data[0].subject != subject_name) {
            setData(database.filter(quiz => quiz.subject == subject_name))
        }
    }
    function go_exam(item) {
        Analytics.trackEvent('Exam', { Subject: item.subject, FileName: item.title });
        item.get_shuffled_questions(true, true)
        navigation.navigate('Home', {
            screen: 'Exam', params: { quiz: item, exam_time: DateTime.fromISO(DateTime.now().toISOTime()) }
        })
    }
    function calculate_last_time(lastTime = DateTime.now().toISODate()) {
        let end = DateTime.fromISO(DateTime.now().toISODate());
        let start = DateTime.fromISO(lastTime);
        let math = end.diff(start, 'days').toObject().days;
        if (math == 0) {
            return 'اليوم'
        }
        return `${math} يوم`
    }
    function get_icon(quiz) {
        if (quiz.is_cycle()) {
            return { name: 'check-decagram', color: '#E53935' }
        }
        else if (quiz.index > 0) {
            return { name: 'asterisk', color: 'grey' }
        }
        else if (quiz.taken_number > 0) {
            return { name: 'checkbox-blank-circle', color: 'grey' }
        }
        return { name: 'checkbox-blank-circle-outline', color: 'grey' }
    }
    function Files() {
        return (
            <View>
                <FlatList
                    data={data}
                    keyExtractor={item => item.title}
                    extraData={data}
                    ListEmptyComponent={empty_state_cycle}
                    renderItem={({ item, index }) => (
                        <Animatable.View
                            animation="fadeInRight"
                            delay={index * 350}
                            duration={1500}>
                            <View
                                key={item.title}
                                style={[
                                    styles.Listcontainer,
                                    {
                                        marginVertical: 3,
                                        backgroundColor: 'white',
                                        elevation: 2
                                    }]}>
                                <Pressable
                                    onPress={() => go_exam(item)}
                                    onLongPress={async () => {
                                        setDialogData({
                                            visible: true,
                                            title: item.title,
                                            path: item.path,
                                            average_accuracy: item.get_average_accuracy(),
                                            average_time: item.get_average_time(),
                                            last_score: item.average_accuracy[item.average_accuracy.length - 1] || 0,
                                            last_time_score: item.average_time[item.average_time.length - 1] || 0,
                                            last_time: item.last_time
                                        })
                                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    }}
                                    android_ripple={{ color: 'rgba(0, 0, 0, .32)', borderless: false }}>

                                    <Surface>
                                        <View>
                                            <Text style={styles.title}>{item.title}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <MaterialCommunityIcons
                                                    name={get_icon(item).name}
                                                    color={get_icon(item).color}
                                                    size={20} style={{ marginLeft: 5 }} />
                                                {item.is_cycle() ? <Text style={styles.cycle_university}>{item.cycle_university}</Text> : null}
                                                <Text style={styles.subtitle}>منذ {calculate_last_time(item.last_time)}</Text>
                                            </View>
                                        </View>


                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                <Text style={styles.numbers}>{item.get_questions_number()}</Text>
                                                <MaterialCommunityIcons name="format-list-numbered" size={20} color="grey" style={{ marginLeft: 5 }} />
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.numbers}>{item.get_estimated_time()}</Text>
                                                <MaterialCommunityIcons name="progress-clock" size={20} color="grey" style={{ marginLeft: 5 }} />
                                            </View>
                                        </View>
                                    </Surface>
                                </Pressable>
                            </View>
                        </Animatable.View>
                    )}
                />
                <Portal>
                    <Dialog visible={dialogData.visible} onDismiss={() => setDialogData({ visible: false })}>
                        <Dialog.Title style={[styles.title, { padding: 10 }]}>{dialogData.title}</Dialog.Title>
                        <Divider />

                        <Dialog.Content style={{ padding: 5 }}>



                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons name='target-variant' size={20} style={{ marginRight: 3 }} color='grey' />
                                    <Text style={styles.dialog_text}>متوسط التحصيل في المقرر</Text>
                                </View>
                                <Text style={styles.dialog_text}>{dialogData.average_accuracy}</Text>
                            </View>
                            <Divider />


                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons name='history' size={20} style={{ marginRight: 3 }} color='grey' />
                                    <Text style={styles.dialog_text}>متوسط الوقت في المقرر</Text>
                                </View>
                                <Text style={styles.dialog_text}>{dialogData.average_time}</Text>
                            </View>
                            <Divider />

                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons name='calendar-today' size={20} style={{ marginRight: 3 }} color='grey' />
                                    <Text style={styles.dialog_text}>آخر مرة </Text>
                                </View>
                                <Text style={styles.dialog_text}>{calculate_last_time(dialogData.last_time)}</Text>
                            </View>
                            <Divider />

                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons
                                        name='file-check'
                                        color='grey'
                                        size={20}
                                        style={{ marginRight: 3 }} />
                                    <Text style={styles.dialog_text}>آخر نتيجة</Text>
                                </View>
                                <Text style={styles.dialog_text}>% {dialogData.last_score}</Text>
                            </View>
                            <Divider />



                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons name='clock-check' size={20} style={{ marginRight: 3 }} color='grey' />
                                    <Text style={styles.dialog_text}>آخر توقيت</Text>
                                </View>
                                <Text style={styles.dialog_text}>{dialogData.last_time_score} د</Text>
                            </View>
                            <Divider />



                        </Dialog.Content>


                        <Dialog.Actions style={[styles.row, { justifyContent: 'space-between' }]}>
                            <IconButton
                                icon='file-remove'
                                color='#E53935'
                                size={20}
                                onPress={() => remove_file(dialogData.title, dialogData.path)} />
                            <Button
                                onPress={() => setDialogData({ visible: false })}
                                labelStyle={{ letterSpacing: 0, fontFamily: 'Cairo_700Bold' }}
                            >حسناً</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Header />
            <Files />
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        paddingVertical: 5
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5
    },
    Header_text: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 15,
        height: 25,
        letterSpacing: 0,
        selectable: false
    },
    Listcontainer: {
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D7D8D2',
    },
    title: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 18,
        marginTop: 0,
        selectable: false
    },
    subtitle: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 15,
        lineHeight: 20,
        color: 'grey',
        marginLeft: 15,
        selectable: false
    },
    numbers: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 17,
        color: 'grey',
        lineHeight: 23,
        selectable: false
    },
    cycle_university: {
        color: 'red',
        fontSize: 15,
        marginLeft: 5,
        selectable: false
    },
    dialog_text: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 15,
        lineHeight: 20,
        marginLeft: 5,
        color: '#313131',
        selectable: false
    }
})