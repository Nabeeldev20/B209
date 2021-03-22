import * as React from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, Switch } from 'react-native'
import { Surface, Portal, Dialog, IconButton, Button, Divider, useTheme } from 'react-native-paper'
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FileSystem } from 'react-native-file-access';
import { DateTime } from 'luxon'
import Analytics from 'appcenter-analytics';

import { get_database, update_database, get_bookmarks, erase_database } from './db'
export default function Subject({ navigation, route }) {
    const { subject_name } = route.params;

    React.useEffect(() => {
        navigation.setOptions({ title: subject_name });
    }, [subject_name])

    const [onlyCycles, setOnlyCycles] = React.useState(false);
    const [data, setData] = React.useState(get_database().filter(quiz => quiz.subject == subject_name))
    const [dialogData, setDialogData] = React.useState({ visible: false })
    const [unfinishedDialog, setUnfinishedDialog] = React.useState({ visible: false, index: 0, questions_number: 0 })
    const { colors } = useTheme();

    function Header() {
        return (
            <View
                style={[
                    styles.row,
                    {
                        justifyContent: get_bookmarks().filter(bookmark => bookmark.subject == subject_name).length >= 1 ? 'space-between' : 'flex-end',
                        alignItems: 'baseline'
                    }]}>
                {get_bookmarks().filter(bookmark => bookmark.subject == subject_name).length >= 1 ?
                    <Pressable
                        onPress={() => navigation.navigate('Bookmarks', { subject_name })}
                        android_ripple={{ color: 'rgba(0, 0, 0, .32)', borderless: false }}
                        style={[styles.row, { marginVertical: 3 }]}>

                        <MaterialCommunityIcons
                            name='bookmark-multiple'
                            size={20}
                            color='grey'
                            style={{ marginRight: 3 }} />
                        <Text style={styles.Header_text}>المحفوظات
                                   ( {get_bookmarks().length})
                        </Text>

                    </Pressable> : null}

                <View style={styles.row}>
                    <MaterialCommunityIcons
                        name='check-decagram'
                        color='grey'
                        size={16}
                        style={{ marginRight: 6 }} />
                    <Text style={[styles.Header_text, { marginRight: 5 }]}>الدورات فقط</Text>
                    <Switch
                        value={onlyCycles}
                        onValueChange={handle_switch}
                        trackColor={{ false: '#767577', true: '#ec9b99' }}
                        thumbColor={onlyCycles ? '#E53935' : '#f4f3f4'} />
                </View>
            </View>
        )
    }

    function empty_state_cycle() {
        return (
            <Animatable.View
                animation="fadeIn"
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                }}>
                <MaterialCommunityIcons
                    name='file-hidden'
                    color='grey'
                    size={50} style={{ marginLeft: 5 }} />
                <Text style={{ fontFamily: 'Cairo-Bold', color: 'grey' }}>الدنيا دوارة بس لا يوجد دورات هنا</Text>
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
    function go_exam(quiz) {
        function go() {
            if (quiz.index > 0) {
                setUnfinishedDialog({
                    visible: true,
                    index: quiz.index + 1,
                    questions_number: quiz.get_questions_number(),
                    quiz
                })
            } else {
                Analytics.trackEvent('Exam', { Subject: quiz.subject, FileName: quiz.title });
                quiz.get_shuffled_questions(true, true)
                navigation.navigate('Home', {
                    screen: 'Exam',
                    params: {
                        quiz,
                        exam_time: DateTime.fromISO(DateTime.now().toISOTime()),
                        random_questions: true,
                        random_choices: true
                    }
                })
            }
        }
        if (quiz.is_paid()) {
            function has_code(quiz_code) {
                let codes = [];
                get_act().forEach(item => {
                    codes.push(item.code)
                })
                if (codes.includes(quiz_code)) {
                    return true
                }
                return false
            }
            if (has_code(quiz.code) == false) {
                navigation.push('Activation', { subject_name: quiz.subject, code: quiz.code })
            } else {
                go()
            }
        } else {
            go()
        }
    }
    function resume_exam({ quiz, continue_exam = false } = {}) {
        if (continue_exam) {
            navigation.push('Home', {
                screen: 'Exam',
                params: {
                    quiz,
                    exam_time: DateTime.fromISO(DateTime.now().toISOTime()),
                    random_questions: true,
                    random_choices: true
                }
            })
        } else {
            quiz.index = 0
            quiz.get_shuffled_questions(true, true);
            navigation.push('Home', {
                screen: 'Exam',
                params: {
                    quiz,
                    exam_time: DateTime.fromISO(DateTime.now().toISOTime()),
                    random_questions: true,
                    random_choices: true
                }
            })
            setUnfinishedDialog({ visible: false })
        }
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
                            key={item.title}
                            style={{
                                marginVertical: 3,
                            }}>
                            <Surface style={{
                                backgroundColor: '#fff',
                                elevation: 2,
                                borderWidth: 1,
                                borderColor: '#D7D8D2',
                            }}>
                                <Pressable
                                    onPress={() => go_exam(item)}
                                    onLongPress={async () => {
                                        function calculate_last_time_score() {
                                            if (item.average_time.length > 0) {
                                                let last = item.average_time[item.average_time.length - 1];
                                                let time = (last / 60).toFixed(2).toString().split('');
                                                if (time.length == 4) {
                                                    time.unshift('0')
                                                    time[2] = ':'
                                                    return time.join('')
                                                }
                                                time[2] = ':'
                                                return time.join('')
                                            }
                                            return 0
                                        }
                                        setDialogData({
                                            visible: true,
                                            title: item.title,
                                            path: item.path,
                                            average_accuracy: item.get_average_accuracy(),
                                            average_time: item.get_average_time(),
                                            last_score: item.average_accuracy[item.average_accuracy.length - 1] ?? 0,
                                            last_time_score: calculate_last_time_score() ?? '00:00',
                                            last_time: item.last_time
                                        })
                                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    }}
                                    android_ripple={{ color: 'rgba(0, 0, 0, .32)', borderless: false }}
                                    style={{
                                        padding: 12,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>

                                    <View>
                                        <Text style={styles.title}>{item.title}</Text>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center'
                                            }}>
                                            <MaterialCommunityIcons
                                                name={get_icon(item).name}
                                                color={get_icon(item).color}
                                                size={20}
                                                style={{ marginLeft: 5 }} />
                                            <Text style={styles.subtitle}>{item.subject}</Text>
                                            {item.is_cycle() ? <Text style={[styles.cycle_university, { color: colors.error }]}>{item.cycle_university}</Text> : null}
                                            <Text style={styles.subtitle}>منذ {calculate_last_time(item.last_time)}</Text>
                                        </View>
                                    </View>


                                    <View>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end'
                                            }}>
                                            <Text style={styles.numbers}>{item.get_questions_number()}</Text>
                                            <MaterialCommunityIcons
                                                name="format-list-numbered"
                                                size={20}
                                                color="grey"
                                                style={{ marginLeft: 5 }} />
                                        </View>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center'
                                            }}>
                                            <Text style={styles.numbers}>{item.get_estimated_time()}</Text>
                                            <MaterialCommunityIcons
                                                name="progress-clock"
                                                size={20}
                                                color="grey"
                                                style={{ marginLeft: 5 }} />
                                        </View>
                                    </View>

                                </Pressable>
                            </Surface>
                        </Animatable.View>
                    )}
                />
                <Portal>

                    <Dialog
                        visible={unfinishedDialog.visible}
                        onDismiss={() => setUnfinishedDialog({ visible: false })}>
                        <Dialog.Title style={styles.dialog_title}>لم تنه الامتحان آخر مرة!</Dialog.Title>
                        <Divider />
                        <Dialog.Content>
                            <Text style={styles.dialog_text}>توقفت عند السؤال {unfinishedDialog.index} من أصل {unfinishedDialog.questions_number}</Text>
                        </Dialog.Content>
                        <Dialog.Actions style={[styles.row, { justifyContent: 'space-between' }]}>
                            <Button
                                labelStyle={styles.dialog_button}
                                onPress={() => resume_exam({ quiz: unfinishedDialog.quiz })}
                            >البدء من جديد</Button>
                            <Button
                                color={colors.success}
                                labelStyle={styles.dialog_button}
                                onPress={() => resume_exam({ quiz: unfinishedDialog.quiz, continue_exam: true })}
                            >تكملة الامتحان</Button>
                        </Dialog.Actions>
                    </Dialog>

                    <Dialog visible={dialogData.visible} onDismiss={() => setDialogData({ visible: false })}>
                        <Dialog.Title style={[styles.title, { padding: 10 }]}>{dialogData.title}</Dialog.Title>
                        <Divider />
                        <Dialog.Content style={{ padding: 3 }}>
                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons
                                        name='target-variant'
                                        size={20}
                                        color='grey'
                                        style={{ marginRight: 3 }} />
                                    <Text style={styles.dialog_text}>متوسط التحصيل في المقرر</Text>
                                </View>
                                <Text style={styles.dialog_text}>{dialogData.average_accuracy}</Text>
                            </View>
                            <Divider />
                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons
                                        name='history'
                                        size={20}
                                        color='grey'
                                        style={{ marginRight: 3 }} />
                                    <Text style={styles.dialog_text}>متوسط الوقت في المقرر</Text>
                                </View>
                                <Text style={styles.dialog_text}>{dialogData.average_time}</Text>
                            </View>
                            <Divider />
                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons
                                        name='calendar-today'
                                        size={20}
                                        color='grey'
                                        style={{ marginRight: 3 }} />
                                    <Text style={styles.dialog_text}>آخر مرة </Text>
                                </View>
                                <Text style={styles.dialog_text}>{calculate_last_time(dialogData.last_time)}</Text>
                            </View>
                            <Divider />
                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons
                                        name='file-check'
                                        size={20}
                                        color='grey'
                                        style={{ marginRight: 3 }} />
                                    <Text style={styles.dialog_text}>آخر نتيجة</Text>
                                </View>
                                <Text style={styles.dialog_text}>% {dialogData.last_score}</Text>
                            </View>
                            <Divider />
                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons
                                        name='clock-check'
                                        size={20}
                                        color='grey'
                                        style={{ marginRight: 3 }} />
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
                                size={24}
                                onPress={() => remove_file(dialogData.title, dialogData.path)} />
                            <Button
                                onPress={() => setDialogData({ visible: false })}
                                labelStyle={{
                                    letterSpacing: 0,
                                    fontFamily: 'Cairo-Bold'
                                }}
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
        fontFamily: 'Cairo-SemiBold',
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
        fontFamily: 'Cairo-Bold',
        fontSize: 18,
        marginTop: 0,
        selectable: false
    },
    subtitle: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 15,
        lineHeight: 20,
        color: 'grey',
        paddingLeft: 5,
        selectable: false
    },
    numbers: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 15,
        color: 'grey',
        lineHeight: 23,
        selectable: false
    },
    cycle_university: {
        color: 'red',
        fontSize: 15,
        paddingLeft: 5,
        selectable: false
    },
    dialog_text: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 15,
        lineHeight: 20,
        paddingLeft: 5,
        color: '#313131',
        selectable: false
    }
})