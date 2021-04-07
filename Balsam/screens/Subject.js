import * as React from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, Switch, ToastAndroid } from 'react-native'
import { Surface, Portal, Dialog, Button, Divider, useTheme } from 'react-native-paper'
import * as Haptics from 'expo-haptics';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FileSystem } from 'react-native-file-access';
import { DateTime } from 'luxon'
import Analytics from 'appcenter-analytics';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import { get_database, set_database, get_act, update_error_msgs } from './db'
export default function Subject({ navigation, route }) {
    const Stack = createStackNavigator();
    const { subject_name } = route.params;

    const [onlyCycles, setOnlyCycles] = React.useState(false);
    const [data, setData] = React.useState([])
    const [dialogData, setDialogData] = React.useState({ visible: false })
    const [unfinishedDialog, setUnfinishedDialog] = React.useState({ visible: false, index: 0, questions_number: 0 })
    const { colors } = useTheme();
    useFocusEffect(
        React.useCallback(() => {
            setData([...new Set(get_database())].filter(quiz => quiz.subject == subject_name));
        }, [subject_name])
    );
    function subject_component() {

        function Header() {
            function has_cycles() {
                let output = [];
                for (let i = 0; i < data.length; i++) {
                    if (data[i].is_cycle()) {
                        output.push(data[i].title)
                    }
                }
                if (output.length > 1) return true;
                return false;
            }
            if (has_cycles()) {
                return (
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        margin: 3
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <MaterialCommunityIcons
                                name='check-decagram'
                                color='#616161'
                                size={16}
                                style={{ marginRight: 6 }} />
                            <Text style={{
                                fontFamily: 'Cairo-SemiBold',
                                fontSize: 16,
                                height: 25,
                                marginRight: 5
                            }}>الدورات فقط</Text>
                            <Switch
                                value={onlyCycles}
                                onValueChange={handle_switch}
                                trackColor={{ false: '#767577', true: '#ec9b99' }}
                                thumbColor={onlyCycles ? '#E53935' : '#f4f3f4'} />
                        </View>
                    </View>
                )
            }
            return null
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
            set_database(get_database().filter(quiz => quiz.title != title));
            try {
                await FileSystem.unlink(path)
            } catch (error) {
                ToastAndroid.showWithGravity(
                    'Error#011',
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM
                )
            }
            if (data.length == 0) {
                navigation.jumpTo('Home')
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
                    let codes = get_act()
                    if (codes.includes(quiz_code)) {
                        return true
                    }
                    return false
                }
                if (has_code(quiz.code) == false) {
                    navigation.navigate('Home', {
                        screen: 'Activation',
                        params: {
                            subject_name: quiz.subject, code: quiz.code
                        }
                    })
                } else {
                    go()
                }
            } else {
                go()
            }
        }
        function resume_exam({ quiz, continue_exam = false } = {}) {
            if (continue_exam) {
                navigation.navigate('Home', {
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
                navigation.navigate('Home', {
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
            setUnfinishedDialog({ visible: false })
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
                return { name: 'asterisk', color: '#616161' }
            }
            else if (quiz.taken_number > 0) {
                return { name: 'checkbox-blank-circle', color: '#616161' }
            }
            return { name: 'checkbox-blank-circle-outline', color: '#616161' }
        }
        function Files() {
            return (
                <View>
                    <FlatList
                        data={data}
                        keyExtractor={item => item.title}
                        extraData={data}
                        renderItem={({ item }) => (
                            <View
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
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-start'
                                                }}>
                                                <MaterialCommunityIcons
                                                    name={get_icon(item).name}
                                                    color={get_icon(item).color}
                                                    size={16}
                                                    style={{ marginHorizontal: 5 }} />
                                                <Text style={styles.subtitle}>{item.subject}</Text>
                                                {item.is_cycle() ? <Text style={[styles.cycle_university, { color: colors.error }]}>{item.cycle_university}</Text> : null}
                                                {item.taken_number != 0 ?
                                                    <Text
                                                        style={[styles.subtitle, {
                                                            paddingLeft: 10,
                                                            fontSize: 12
                                                        }]}>منذ {calculate_last_time(item.last_time)}</Text> : null}
                                            </View>
                                        </View>


                                        <View>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-end',
                                                    marginBottom: 5
                                                }}>
                                                <Text style={styles.numbers}>{item.get_questions_number()}</Text>
                                                <MaterialCommunityIcons
                                                    name="format-list-numbered"
                                                    size={20}
                                                    color="#616161"
                                                    style={{ marginLeft: 5 }} />
                                            </View>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-end'
                                                }}>
                                                <Text style={styles.numbers}>{item.get_estimated_time()}</Text>
                                                <MaterialCommunityIcons
                                                    name="progress-clock"
                                                    size={20}
                                                    color="#616161"
                                                    style={{ marginLeft: 5 }} />
                                            </View>
                                        </View>

                                    </Pressable>
                                </Surface>
                            </View>
                        )}
                    />
                    <Portal>
                        <Dialog
                            visible={unfinishedDialog.visible}
                            onDismiss={() => setUnfinishedDialog({ visible: false })}>
                            <Dialog.Title style={{
                                fontFamily: 'Cairo-Bold',
                                fontSize: 18,
                                marginTop: 15,
                                marginBottom: 15
                            }}>لم تنه الامتحان آخر مرة!</Dialog.Title>
                            <Dialog.Content style={{ paddingHorizontal: 15, paddingBottom: 0 }}>
                                <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 15 }}>توقفت عند السؤال {unfinishedDialog.index} من أصل {unfinishedDialog.questions_number}</Text>
                            </Dialog.Content>
                            <Dialog.Actions style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginHorizontal: 5,
                            }}>
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

                        <Dialog
                            visible={dialogData.visible}
                            onDismiss={() => setDialogData({ visible: false })}>
                            <Dialog.Title style={{
                                fontFamily: 'Cairo-Bold',
                                fontSize: 18,
                                marginTop: 15,
                                marginBottom: 15
                            }}>{dialogData.title}</Dialog.Title>
                            <Dialog.Content style={{ paddingHorizontal: 15, paddingBottom: 0 }}>
                                <View style={styles.row}>
                                    <View style={styles.row}>
                                        <MaterialCommunityIcons
                                            name='chart-areaspline-variant'
                                            size={20}
                                            color='#616161'
                                            style={{ marginRight: 3 }} />
                                        <Text style={styles.dialog_text}>متوسط الدقة</Text>
                                    </View>
                                    <Text style={styles.dialog_text}>{dialogData.average_accuracy}</Text>
                                </View>
                                <Divider />
                                <View style={styles.row}>
                                    <View style={styles.row}>
                                        <MaterialCommunityIcons
                                            name='history'
                                            size={20}
                                            color='#616161'
                                            style={{ marginRight: 3 }} />
                                        <Text style={styles.dialog_text}>متوسط الوقت</Text>
                                    </View>
                                    <Text style={styles.dialog_text}>{dialogData.average_time}</Text>
                                </View>
                                <Divider />
                                <View style={styles.row}>
                                    <View style={styles.row}>
                                        <MaterialCommunityIcons
                                            name='calendar-today'
                                            size={20}
                                            color='#616161'
                                            style={{ marginRight: 3 }} />
                                        <Text style={styles.dialog_text}>آخر مرة </Text>
                                    </View>
                                    <Text style={styles.dialog_text}>{calculate_last_time(dialogData.last_time)}</Text>
                                </View>
                                <Divider />
                                <View style={styles.row}>
                                    <View style={styles.row}>
                                        <MaterialCommunityIcons
                                            name='medal'
                                            size={20}
                                            color='#616161'
                                            style={{ marginRight: 3 }} />
                                        <Text style={styles.dialog_text}>آخر نتيجة</Text>
                                    </View>
                                    <Text style={styles.dialog_text}>% {dialogData.last_score}</Text>
                                </View>
                                <Divider />
                                <View style={styles.row}>
                                    <View style={styles.row}>
                                        <MaterialCommunityIcons
                                            name='clock-check'
                                            size={20}
                                            color='#616161'
                                            style={{ marginRight: 3 }} />
                                        <Text style={styles.dialog_text}>آخر توقيت</Text>
                                    </View>
                                    <Text style={styles.dialog_text}>{dialogData.last_time_score}</Text>
                                </View>
                            </Dialog.Content>

                            <Dialog.Actions
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginHorizontal: 5,
                                }}>
                                <Button
                                    color='#E53935'
                                    labelStyle={{ letterSpacing: 0, fontFamily: 'Cairo-Bold' }}
                                    onPress={() => remove_file(dialogData.title, dialogData.path)}>
                                    حذف الملف
                                    </Button>
                                <Button
                                    onPress={() => setDialogData({ visible: false })}
                                    labelStyle={{ letterSpacing: 0, fontFamily: 'Cairo-Bold' }}
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
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { height: 50 } }}>
            <Stack.Screen
                name="Subject"
                component={subject_component}
                options={{
                    title: route.params.subject_name,
                    headerTitleStyle: { fontFamily: 'Cairo-Bold', fontSize: 14 },
                    headerLeft: () => (<MaterialCommunityIcons size={30} style={{ marginLeft: 20 }} name='menu' onPress={() => navigation.openDrawer()} />)
                }} />
        </Stack.Navigator>
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
        justifyContent: 'space-between',
        paddingVertical: 5
    },
    title: {
        fontFamily: 'Cairo-Bold',
        fontSize: 18,
        paddingBottom: 3,
        selectable: false
    },
    subtitle: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 14,
        lineHeight: 20,
        height: 20,
        color: '#616161',
        marginHorizontal: 4,
        selectable: false
    },
    numbers: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 15,
        height: 20,
        lineHeight: 23,
        color: '#616161',
        selectable: false
    },
    cycle_university: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 14,
        lineHeight: 20,
        height: 20,
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
    },
    dialog_title: {
        fontFamily: 'Cairo-Bold',
        fontSize: 18,
    },
    dialog_button: {
        letterSpacing: 0,
        fontFamily: 'Cairo-Bold'
    }
})