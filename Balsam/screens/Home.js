import * as React from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { TouchableRipple, Surface, Dialog, Portal, Divider, IconButton, Button, useTheme } from 'react-native-paper'
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FileSystem } from 'react-native-file-access';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { DateTime } from 'luxon'
import Analytics from 'appcenter-analytics';
import Exam from './Exam'
import FinishScreen from './FinishScreen'
import Activation from './Activation'
import { get_database, update_database, is_quiz_valid } from './db'


let data = get_database()
export default function Home({ navigation }) {
    const Stack = createStackNavigator();
    const { colors } = useTheme();


    function EmptyHome() {
        return (
            <Animatable.View animation="fadeIn" style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
                <MaterialCommunityIcons
                    name='file-download'
                    color='grey'
                    size={50} style={{ marginLeft: 5 }} />
                <Text style={{ fontFamily: 'Cairo_700Bold', color: 'grey' }}>جرّب إضافة بعض الملفات</Text>
            </Animatable.View>
        )
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

    function Home_component({ navigation }) {
        const [dialogData, setDialogData] = React.useState({ visible: false })
        const [unfinishedDialog, setUnfinishedDialog] = React.useState({ visible: false, index: 0, questions_number: 0 })
        const [database, setDatabase] = React.useState(data)

        async function remove_file(title, path) {
            setDatabase(database.filter(quiz => quiz.title != title));
            setDialogData({ visible: false })
            // in db.js
            update_database(database.filter(quiz => quiz.title != title));
            await FileSystem.unlink(path)
        }


        function go_exam(quiz) {
            if (is_quiz_valid(quiz.code) == false) {
                navigation.push('Activation', { subject_name: quiz.subject, code: quiz.code })
            } else {
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
                    navigation.push('Exam', { quiz, exam_time: DateTime.fromISO(DateTime.now().toISOTime()) })
                }
            }

        }
        function resume_exam({ quiz, continue_exam = false } = {}) {
            if (continue_exam) {
                navigation.push('Exam', { quiz, exam_time: DateTime.fromISO(DateTime.now().toISOTime()) })
            } else {
                quiz.index = 0
                quiz.get_shuffled_questions(true, true);
                navigation.push('Exam', { quiz, exam_time: DateTime.fromISO(DateTime.now().toISOTime()) });
                setUnfinishedDialog({ visible: false })
            }
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
        return (
            <View style={styles.container}>
                {database.length > 0 ?
                    <FlatList
                        data={database}
                        extraData={database}
                        keyExtractor={item => item.title}
                        renderItem={({ item, index }) => (
                            <Animatable.View animation="fadeInRight" delay={index * 350}>
                                <TouchableRipple
                                    key={item.title}
                                    onPress={() => go_exam(item)}
                                    onLongPress={async () => {
                                        setDialogData({
                                            visible: true,
                                            title: item.title,
                                            path: item.path,
                                            average_accuracy: item.get_average_accuracy(),
                                            average_time: item.get_average_time(),
                                            last_score: item.average_accuracy[item.average_accuracy.length - 1] ?? 0,
                                            last_time_score: item.average_time[item.average_time.length - 1] ?? 0,
                                            last_time: item.last_time
                                        })
                                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    }
                                    }
                                    rippleColor="rgba(0, 0, 0, .32)"
                                    style={{ marginVertical: 3 }}
                                >
                                    <Surface style={styles.Listcontainer}>
                                        <View>
                                            <Text style={styles.title}>{item.title}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <MaterialCommunityIcons
                                                    name={get_icon(item).name}
                                                    color={get_icon(item).color}
                                                    size={16} style={{ marginLeft: 5 }} />
                                                <Text style={styles.subtitle}>{item.subject}</Text>
                                                {item.is_cycle() ? <Text style={[styles.cycle_university, { color: colors.error }]}>{item.cycle_university}</Text> : null}
                                            </View>
                                        </View>


                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                <Text style={styles.numbers}>{item.get_questions_number()}</Text>
                                                <MaterialCommunityIcons name="format-list-numbered" size={16} color="grey" style={{ marginLeft: 5 }} />
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.numbers}>{item.get_estimated_time()}</Text>
                                                <MaterialCommunityIcons name="progress-clock" size={16} color="grey" style={{ marginLeft: 5 }} />
                                            </View>
                                        </View>

                                    </Surface>
                                </TouchableRipple>
                            </Animatable.View>
                        )}
                    /> : <EmptyHome />}
                <Portal>

                    <Dialog visible={unfinishedDialog.visible} onDismiss={() => setUnfinishedDialog({ visible: false })} style={{ padding: 10 }}>
                        <Dialog.Title style={[styles.dialog_title, { padding: 5, margin: 5 }]}>لم تنه الامتحان آخر مرة!</Dialog.Title>
                        <Divider />
                        <Dialog.Content style={{ margin: 3, padding: 10 }}>
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
                        <Dialog.Title style={[styles.title, { margin: 5, padding: 10 }]}>{dialogData.title}</Dialog.Title>
                        <Divider />

                        <Dialog.Content style={{ margin: 3, padding: 3 }}>
                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons name='target-variant' size={16} style={{ marginRight: 3 }} color='grey' />
                                    <Text style={styles.dialog_text}>متوسط التحصيل في المقرر</Text>
                                </View>
                                <Text style={styles.dialog_text}>{dialogData.average_accuracy}</Text>
                            </View>
                            <Divider />
                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons name='history' size={16} style={{ marginRight: 3 }} color='grey' />
                                    <Text style={styles.dialog_text}>متوسط الوقت في المقرر</Text>
                                </View>
                                <Text style={styles.dialog_text}>{dialogData.average_time}</Text>
                            </View>
                            <Divider />
                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons name='calendar-today' size={16} style={{ marginRight: 3 }} color='grey' />
                                    <Text style={styles.dialog_text}>آخر مرة </Text>
                                </View>
                                <Text style={styles.dialog_text}>{calculate_last_time(dialogData.last_time)}</Text>
                            </View>
                            <Divider />
                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons name='file-check' color='#313131' size={16} style={{ marginRight: 3 }} color='grey' />
                                    <Text style={styles.dialog_text}>آخر نتيجة</Text>
                                </View>
                                <Text style={styles.dialog_text}>% {dialogData.last_score}</Text>
                            </View>
                            <Divider />
                            <View style={[styles.row, { justifyContent: 'space-between' }]}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons name='clock-check' size={16} style={{ marginRight: 3 }} color='grey' />
                                    <Text style={styles.dialog_text}>آخر توقيت</Text>
                                </View>
                                <Text style={styles.dialog_text}>{dialogData.last_time_score} د</Text>
                            </View>
                            <Divider />
                        </Dialog.Content>
                        <Dialog.Actions style={[styles.row, { justifyContent: 'space-between' }]}>
                            <IconButton icon='trash' size={20} color='red' onPress={() => remove_file(dialogData.title, dialogData.path)} />
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
        <Stack.Navigator screenOptions={{ headerStyle: { height: 50 } }}>
            <Stack.Screen
                name="Home"
                component={Home_component}
                options={{
                    title: 'بلســم',
                    headerTitleStyle: { fontFamily: 'Cairo_700Bold' },
                    headerLeft: () => (<MaterialCommunityIcons size={24} style={{ marginLeft: 20 }} name='menu' onPress={() => navigation.openDrawer()} />)
                }} />
            <Stack.Screen
                name="Exam"
                options={({ route }) => ({
                    headerTitleStyle: {
                        color: '#313131',
                        fontSize: 16,
                        fontFamily: 'Cairo_700Bold'
                    }
                })}
                component={Exam} />
            <Stack.Screen
                name="FinishScreen"
                component={FinishScreen}
                options={({ route }) => ({
                    title: route.params.quiz.title,
                    headerTitleStyle: {
                        color: '#313131',
                        fontSize: 16,
                        fontFamily: 'Cairo_700Bold'
                    }
                })} />
            <Stack.Screen
                name="Activation"
                component={Activation}
                options={({ route }) => ({
                    headerTitleStyle: {
                        color: '#313131',
                        fontSize: 16,
                        fontFamily: 'Cairo_700Bold',
                        height: 26
                    }
                })} />
        </Stack.Navigator>
    )
}


const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        flex: 1,
        width: '100%'
    },
    Listcontainer: {
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        borderWidth: 1,
        borderColor: '#D7D8D2',
        backgroundColor: 'white'
    },
    title: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 18,
        marginTop: 0
    },
    subtitle: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 15,
        lineHeight: 20,
        color: 'grey',
        marginLeft: 15
    },
    numbers: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 17,
        color: 'grey',
        lineHeight: 23
    },
    cycle_university: {
        fontSize: 12,
        marginLeft: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5
    },
    dialog_text: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 15,
        lineHeight: 20,
        marginLeft: 5,
        color: '#313131',
        selectable: false
    },
    dialog_title: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 18,
    },
    dialog_button: {
        letterSpacing: 0,
        fontFamily: 'Cairo_700Bold'
    }
})