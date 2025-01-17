/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    ToastAndroid,
    Linking,
} from 'react-native';
import {
    Surface,
    Dialog,
    Portal,
    Divider,
    Button,
    useTheme,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { DateTime } from 'luxon';
import { useFocusEffect } from '@react-navigation/native';
import { FileSystem } from 'react-native-file-access';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Analytics from 'appcenter-analytics';
import Database from './DatabaseContext';
import { app_database } from './db';
export default function Home({ navigation }) {
    const { colors } = useTheme();
    const { DB } = React.useContext(Database);
    const [dialogData, setDialogData] = React.useState({ visible: false });
    const [unfinishedDialog, setUnfinishedDialog] = React.useState({
        visible: false,
        index: 0,
        questions_number: 0,
    });
    const [data, set_data] = React.useState(DB.current);
    const is_first = React.useRef(true);
    useFocusEffect(
        React.useCallback(() => {
            let mounted = true;
            if (mounted) {
                if (is_first.current === false) {
                    let database_data = app_database.get_database;
                    set_data(database_data);
                }
            }

            return () => {
                mounted = false;
                is_first.current = false;
            };
        }, []),
    );
    function EmptyHome() {
        return (
            <Animatable.View animation="fadeIn" style={{ flex: 1, width: '100%' }}>
                <View style={{
                    flexGrow: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <MaterialCommunityIcons
                        name="file-download"
                        color="grey"
                        size={50} style={{ marginLeft: 5 }} />
                    <Text style={{ fontFamily: 'Cairo-Bold', color: 'grey' }}>جرّب إضافة بعض الملفات</Text>
                </View>
                <View style={{ paddingHorizontal: 10 }}>
                    <Text style={{ fontFamily: 'Cairo-SemiBold', color: 'grey' }}>ملفات بلسم بلاحقة quiz.</Text>
                    <View style={{
                        flexDirection: 'row',
                        paddingVertical: 5,
                    }}>
                        <Button
                            icon="telegram"
                            onPress={() => Linking.openURL('https://t.me/Balsam_app')}
                            style={{ flex: 1 }}
                            contentStyle={{ flexDirection: 'row-reverse' }}
                            labelStyle={{ fontFamily: 'Cairo-SemiBold' }}
                            compact
                            color="grey">قناتنا على التلغرام</Button>
                        <Button
                            icon="account-question"
                            onPress={() => Linking.openURL('https://t.me/Balsam_dev')}
                            style={{ flex: 1 }}
                            contentStyle={{ flexDirection: 'row-reverse' }}
                            labelStyle={{ fontFamily: 'Cairo-SemiBold' }}
                            compact
                            color="grey">بحاجة مساعدة؟</Button>
                    </View>
                </View>
            </Animatable.View>
        );
    }
    function Tutorial() {
        if (data.length > 0 && data.length <= 4) {
            return (
                <Animatable.View
                    animation="fadeIn"
                    style={{ alignItems: 'center', flexDirection: 'row', padding: 5 }}>
                    <MaterialCommunityIcons
                        name="lightbulb-on"
                        size={16}
                        color="grey" />
                    <Text style={{
                        fontFamily: 'Cairo-SemiBold',
                        fontSize: 12, color: 'grey', padding: 5,

                    }}>اضغط مطولاً على أي من البطاقات للمزيد من المعلومات</Text>
                </Animatable.View>
            );
        }
        return null;
    }
    function calculate_last_time(lastTime = DateTime.now().toISODate()) {
        let end = DateTime.fromISO(DateTime.now().toISODate());
        let start = DateTime.fromISO(lastTime);
        let math = end.diff(start, 'days').toObject().days;
        if (math === 0) {
            return 'اليوم';
        }
        return `${math} يوم`;
    }
    async function remove_file(title, ID, path) {
        setDialogData({ visible: false });
        set_data(data.filter(quiz => quiz.ID !== ID));
        app_database.update_database = {
            is_array: false,
            update: app_database.get_database.filter(quiz => quiz.ID !== ID),
        };
        try {
            await FileSystem.unlink(path);
            ToastAndroid.showWithGravity(
                `تم حذف ${title}`,
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
            );
        } catch (error) {
            ToastAndroid.showWithGravity(
                'Error#011',
                ToastAndroid.LONG,
                ToastAndroid.TOP,
            );
        }
    }

    function go_exam(quiz) {
        function go() {
            if (quiz.index > 0) {
                setUnfinishedDialog({
                    visible: true,
                    index: quiz.index + 1,
                    questions_number: quiz.get_questions_number(),
                    quiz,
                });
            } else {
                Analytics.trackEvent('Exam', {
                    Subject: quiz.subject,
                    FileName: quiz.title,
                });
                quiz.get_shuffled_questions(true, true);
                navigation.push('Exam', {
                    quiz,
                    exam_time: DateTime.fromISO(DateTime.now().toISOTime()),
                    random_questions: true,
                    random_choices: true,
                });
            }
        }
        if (quiz.is_paid()) {
            function has_code(quiz_code) {
                let codes = app_database.get_activation;
                if (codes.includes(quiz_code)) {
                    return true;
                }
                return false;
            }
            if (has_code(quiz.code) === false) {
                navigation.push('Activation', {
                    subject_name: quiz.subject,
                    code: quiz.code,
                });
            } else {
                go();
            }
        } else {
            go();
        }
    }
    function resume_exam({ quiz, continue_exam = false } = {}) {
        if (continue_exam) {
            navigation.push('Exam', {
                quiz,
                exam_time: DateTime.fromISO(DateTime.now().toISOTime()),
                random_questions: true,
                random_choices: true,
            });
            setUnfinishedDialog({ visible: false });
        } else {
            quiz.index = 0;
            quiz.wrong_count = 0;
            quiz.get_shuffled_questions(true, true);
            navigation.push('Exam', {
                quiz,
                exam_time: DateTime.fromISO(DateTime.now().toISOTime()),
                random_questions: true,
                random_choices: true,
            });
            setUnfinishedDialog({ visible: false });
        }
    }
    function get_icon(quiz) {
        if (quiz.is_cycle()) {
            return { name: 'check-decagram', color: '#E53935' };
        } else if (quiz.index > 0) {
            return { name: 'asterisk', color: '#37474F' };
        } else if (quiz.taken_number > 0) {
            return { name: 'checkbox-blank-circle', color: '#37474F' };
        }
        return { name: 'checkbox-blank-circle-outline', color: '#37474F' };
    }
    return (
        <View style={styles.container}>
            {data.length > 0 ? (
                <FlatList
                    data={data}
                    extraData={data}
                    keyExtractor={item => item.ID}
                    renderItem={({ item }) => (
                        <View
                            style={{
                                marginVertical: 3,
                            }}>
                            <Surface
                                style={{
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
                                                let last =
                                                    item.average_time[item.average_time.length - 1];
                                                let time = (last / 60).toFixed(2).toString().split('');
                                                if (time.length === 4) {
                                                    time.unshift('0');
                                                    time[2] = ':';
                                                    return time.join('');
                                                }
                                                time[2] = ':';
                                                return time.join('');
                                            }
                                            return 0;
                                        }
                                        setDialogData({
                                            visible: true,
                                            title: item.title,
                                            path: item.path,
                                            ID: item.ID,
                                            average_accuracy: item.get_average_accuracy(),
                                            average_time: item.get_average_time(),
                                            last_score:
                                                item.average_accuracy[
                                                item.average_accuracy.length - 1
                                                ] ?? 0,
                                            last_time_score: calculate_last_time_score() ?? '00:00',
                                            last_time: item.last_time,
                                            taken_number: item.taken_number,
                                        });
                                        await Haptics.impactAsync(
                                            Haptics.ImpactFeedbackStyle.Medium,
                                        );
                                    }}
                                    android_ripple={{
                                        color: 'rgba(0, 0, 0, .32)',
                                        borderless: false,
                                    }}
                                    style={{
                                        padding: 12,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                    <View>
                                        <Text style={styles.title}>{item.title}</Text>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                            }}>
                                            <MaterialCommunityIcons
                                                name={get_icon(item).name}
                                                color={get_icon(item).color}
                                                size={16}
                                                style={{ marginHorizontal: 5 }}
                                            />
                                            <Text style={styles.subtitle}>{item.subject}</Text>
                                            {item.is_cycle() ? (
                                                <Text
                                                    style={[
                                                        styles.cycle_university,
                                                        { color: colors.error },
                                                    ]}>
                                                    {item.cycle_university}
                                                </Text>
                                            ) : null}
                                        </View>
                                    </View>

                                    <View>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                                marginBottom: 5,
                                            }}>
                                            <Text style={styles.numbers}>
                                                {item.get_questions_number()}
                                            </Text>
                                            <MaterialCommunityIcons
                                                name="format-list-numbered"
                                                size={20}
                                                color="#616161"
                                                style={{ marginLeft: 5 }}
                                            />
                                        </View>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                            }}>
                                            <Text style={styles.numbers}>
                                                {item.get_estimated_time()}
                                            </Text>
                                            <MaterialCommunityIcons
                                                name="progress-clock"
                                                size={20}
                                                color="#616161"
                                                style={{ marginLeft: 5 }}
                                            />
                                        </View>
                                    </View>
                                </Pressable>
                            </Surface>
                        </View>
                    )}
                />
            ) : (
                    <EmptyHome />
                )}

            <Portal>
                <Dialog
                    visible={unfinishedDialog.visible}
                    onDismiss={() => setUnfinishedDialog({ visible: false })}>
                    <Dialog.Title
                        style={{
                            fontFamily: 'Cairo-Bold',
                            fontSize: 18,
                            marginTop: 15,
                            marginBottom: 15,
                        }}>
                        لم تنه الامتحان آخر مرة!
          </Dialog.Title>
                    <Dialog.Content style={{ paddingHorizontal: 15, paddingBottom: 0 }}>
                        <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 15 }}>
                            توقفت عند السؤال {unfinishedDialog.index} من أصل{' '}
                            {unfinishedDialog.questions_number}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginHorizontal: 5,
                        }}>
                        <Button
                            labelStyle={styles.dialog_button}
                            onPress={() => resume_exam({ quiz: unfinishedDialog.quiz })}>
                            البدء من جديد
            </Button>
                        <Button
                            color={colors.success}
                            labelStyle={styles.dialog_button}
                            onPress={() =>
                                resume_exam({ quiz: unfinishedDialog.quiz, continue_exam: true })
                            }>
                            تكملة الامتحان
            </Button>
                    </Dialog.Actions>
                </Dialog>

                <Dialog
                    visible={dialogData.visible}
                    onDismiss={() => setDialogData({ visible: false })}>
                    <Dialog.Title
                        style={{
                            fontFamily: 'Cairo-Bold',
                            fontSize: 18,
                            marginTop: 15,
                            marginBottom: 15,
                        }}>
                        {dialogData.title}
                    </Dialog.Title>
                    <Dialog.Content style={{ paddingHorizontal: 15, paddingBottom: 0 }}>
                        <View style={styles.row}>
                            <View style={styles.row}>
                                <MaterialCommunityIcons
                                    name="chart-areaspline-variant"
                                    size={20}
                                    color="#616161"
                                    style={{ marginRight: 3 }}
                                />
                                <Text style={styles.dialog_text}>متوسط دقة</Text>
                            </View>
                            <Text style={styles.dialog_text}>
                                {dialogData.average_accuracy}
                            </Text>
                        </View>
                        <Divider />
                        <View style={styles.row}>
                            <View style={styles.row}>
                                <MaterialCommunityIcons
                                    name="history"
                                    size={20}
                                    color="#616161"
                                    style={{ marginRight: 3 }}
                                />
                                <Text style={styles.dialog_text}>متوسط وقت </Text>
                            </View>
                            <Text style={styles.dialog_text}>{dialogData.average_time}</Text>
                        </View>
                        <Divider />
                        <View style={styles.row}>
                            <View style={styles.row}>
                                <MaterialCommunityIcons
                                    name="calendar-today"
                                    size={20}
                                    color="#616161"
                                    style={{ marginRight: 3 }}
                                />
                                <Text style={styles.dialog_text}>آخر مرة </Text>
                            </View>
                            <Text style={styles.dialog_text}>
                                {calculate_last_time(dialogData.last_time)}
                            </Text>
                        </View>
                        <Divider />
                        <View style={styles.row}>
                            <View style={styles.row}>
                                <MaterialCommunityIcons
                                    name="medal"
                                    size={20}
                                    color="#616161"
                                    style={{ marginRight: 3 }}
                                />
                                <Text style={styles.dialog_text}>آخر نتيجة</Text>
                            </View>
                            <Text style={styles.dialog_text}>% {dialogData.last_score}</Text>
                        </View>
                        <Divider />
                        <View style={styles.row}>
                            <View style={styles.row}>
                                <MaterialCommunityIcons
                                    name="clock-check"
                                    size={20}
                                    color="#616161"
                                    style={{ marginRight: 3 }}
                                />
                                <Text style={styles.dialog_text}>آخر توقيت</Text>
                            </View>
                            <Text style={styles.dialog_text}>
                                {dialogData.last_time_score}
                            </Text>
                        </View>
                        <Divider />
                        <View style={styles.row}>
                            <View style={styles.row}>
                                <MaterialCommunityIcons
                                    name="file-eye"
                                    size={20}
                                    color="#616161"
                                    style={{ marginRight: 3 }}
                                />
                                <Text style={styles.dialog_text}>عدد مرّات الاختبار</Text>
                            </View>
                            <Text style={styles.dialog_text}>
                                {dialogData.taken_number}
                            </Text>
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
                            color="#E53935"
                            labelStyle={{ letterSpacing: 0, fontFamily: 'Cairo-Bold' }}
                            onPress={() => remove_file(dialogData.title, dialogData.ID, dialogData.path)}>
                            حذف الملف
            </Button>
                        <Button
                            onPress={() => setDialogData({ visible: false })}
                            labelStyle={{ letterSpacing: 0, fontFamily: 'Cairo-Bold' }}>
                            حسناً
            </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Tutorial />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 5,
        flex: 1,
        width: '100%',
    },
    title: {
        fontFamily: 'Cairo-Bold',
        fontSize: 18,
        paddingBottom: 3,
    },
    subtitle: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 14,
        height: 20,
        lineHeight: 20,
        color: '#616161',
        marginHorizontal: 3,
    },
    numbers: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 15,
        color: '#616161',
        height: 20,
        lineHeight: 23,
    },
    cycle_university: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 12,
        height: 20,
        marginLeft: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    dialog_text: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 15,
        lineHeight: 20,
        marginLeft: 5,
        color: '#313131',
        selectable: false,
    },
    dialog_title: {
        fontFamily: 'Cairo-Bold',
        fontSize: 18,
    },
    dialog_button: {
        letterSpacing: 0,
        fontFamily: 'Cairo-Bold',
    },
    headline: {
        fontFamily: 'Cairo-Bold',
        fontSize: 21,
        paddingBottom: 20,
    },
});
