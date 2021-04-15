/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
    Dimensions,
    Pressable,
    Switch,
} from 'react-native';
import {
    Checkbox,
    Divider,
    Subheading,
    Surface,
    Chip,
    useTheme,
} from 'react-native-paper';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DateTime } from 'luxon';
import Analytics from 'appcenter-analytics';
import { app_database } from './db';

export default function CustomExam({ navigation }) {
    const Stack = createStackNavigator();
    const { colors } = useTheme();

    const [screenHeight, setScreenHeight] = React.useState(
        Dimensions.get('window'),
    );
    const { height } = Dimensions.get('window');
    const scrollEnabled = () => {
        return screenHeight > height ? true : false;
    };
    const onContentSizeChange = contentHeight => {
        setScreenHeight(contentHeight);
    };

    function CustomExam_component() {
        let database = app_database.get_database;
        const [subject, set_subject] = React.useState('');
        const [quizzes, set_quizzes] = React.useState([]);
        const [all, set_all] = React.useState(false);
        const [is_random, set_is_random] = React.useState({
            questions: true,
            choices: true,
        });
        const [cycles, set_cycles] = React.useState(false);
        const [total_number, set_total_number] = React.useState(0);
        React.useEffect(() => {
            let numbers = [].concat(...database
                .filter(quiz => quiz.subject === subject)
                .filter(quiz => is_valid(quiz))
                .filter(quiz => quizzes.includes(quiz.title))
                .map(q => q.questions)).length;
            set_total_number(numbers);
        }, [subject, quizzes, database]);
        function is_valid(quiz) {
            let codes = app_database.get_activation.map(c => c.code);
            if (quiz.is_paid()) {
                return codes.includes(quiz.code) ? true : false;
            }
            return true;
        }
        function Subjects() {
            function get_subjects() {
                return [
                    ...new Set(database.map(quiz => quiz.subject)),
                ];
            }
            function select(item) {
                if (subject === item) {
                    set_subject('');
                    set_quizzes([]);
                    set_all(false);
                    set_cycles(false);

                } else {
                    set_subject(item);
                    set_quizzes([]);
                    set_all(false);
                    set_cycles(false);
                }
            }
            function NoSubjects() {
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}>
                        <MaterialCommunityIcons name="file-download" size={24} color="grey" />
                        <Text style={styles.text}> جرّب إضافة بعض الملفات </Text>
                    </View>
                );
            }
            return (
                <Surface style={{
                    margin: 4,
                    elevation: 1,
                    padding: 3,
                    borderWidth: 1,
                    borderColor: '#d7d8d2',
                }}>
                    <Subheading style={{
                        fontFamily: 'Cairo_700Bold',
                        color: '#343434',
                        padding: 10,
                    }}>المقررات</Subheading>
                    <FlatList
                        data={get_subjects()}
                        extraData={get_subjects()}
                        numColumns={2}
                        ListEmptyComponent={NoSubjects}
                        renderItem={({ item }) => {
                            return (
                                <Pressable
                                    key={item}
                                    onPress={() => select(item)}
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Checkbox
                                        onPress={() => select(item)}
                                        status={subject === item ? 'checked' : 'unchecked'}
                                        color="#00C853" />
                                    <Text style={{
                                        fontFamily: 'Cairo_600SemiBold',
                                        fontSize: 14,
                                        color: 'grey',
                                    }}>{item}</Text>
                                </Pressable>
                            );
                        }} />

                </Surface>
            );
        }

        function Quizzes() {
            function get_titles() {
                return database.filter(quiz => quiz.subject === subject).filter(quiz => is_valid(quiz)).map(q => q.title);
            }
            function AllSwitch() {
                function handle_switch() {
                    if (all) {
                        set_quizzes([]);
                        set_all(false);
                    } else {
                        set_quizzes(get_titles());
                        set_all(true);
                    }
                }
                if (subject !== '') {
                    return (
                        <View style={styles.row}>

                            <Text style={[styles.text, { marginRight: 5, color: 'grey' }]}> اختيار الكل</Text>
                            <Switch
                                value={all}
                                onValueChange={() => handle_switch()}
                                trackColor={{ false: '#767577', true: '#75d99e' }}
                                thumbColor={all ? '#00C853' : '#f4f3f4'}
                                disabled={subject === ''} />
                        </View>
                    );
                }
                return null;
            }
            function handle_select(quiz) {
                if (quizzes.includes(quiz)) {
                    set_quizzes(quizzes.filter(q => q !== quiz));
                } else {
                    set_quizzes([...quizzes, quiz]);
                }

            }
            function Chips() {
                if (get_titles().length > 0) {
                    return (
                        <View style={{ padding: 5, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                            {get_titles().map(quiz => {
                                return (
                                    <View key={quiz} style={{ margin: 4 }}>
                                        <Chip
                                            mode="outlined"
                                            textStyle={{ fontFamily: 'Cairo-SemiBold', fontSize: 14 }}
                                            selected={quizzes.includes(quiz) ? true : false}
                                            onPress={() => handle_select(quiz)}>{quiz}</Chip>
                                    </View>
                                );
                            })}
                        </View>
                    );
                }
                return (<NoQuizzes />);
            }
            function Title() {
                return (
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 3,
                    }}>
                        <Subheading style={{
                            fontFamily: 'Cairo-Bold',
                            color: '#313131',
                            padding: 5,
                        }}>اختبارات المقرر</Subheading>
                        <AllSwitch />
                    </View>
                );
            }
            function NoQuizzes() {
                if (subject === '') {
                    return (
                        <View style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}>
                            <MaterialCommunityIcons name="book-plus" size={24} color="grey" />
                            <Text style={styles.text}>اختر مقرراً من فضلك</Text>
                        </View>
                    );
                }
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}>
                        <MaterialCommunityIcons name="file-key" size={24} color="grey" />
                        <Text style={styles.text}>ملفات البنوك المفعلة + المجانية</Text>
                    </View>
                );
            }
            return (
                <Surface style={{
                    margin: 4,
                    elevation: 1,
                    padding: 3,
                    borderWidth: 1,
                    borderColor: '#d7d8d2',
                }}>
                    <Title />
                    <Chips />
                </Surface>
            );
        }

        function Options() {
            function get_cycles_titles() {
                return database
                    .filter(quiz => quiz.subject === subject)
                    .filter(quiz => is_valid(quiz))
                    .filter(quiz => quiz.is_cycle())
                    .map(q => q.title);
            }
            function Questions_switch() {
                return (
                    <View style={[styles.row, { padding: 5 }]}>
                        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                            <MaterialCommunityIcons
                                name="shuffle"
                                size={20}
                                color="grey"
                                style={{ marginRight: 3 }} />
                            <Text style={styles.text}>عشوائية بالأسئلة</Text>
                        </View>
                        <Switch
                            value={is_random.questions}
                            onValueChange={() => set_is_random({ questions: !is_random.questions, choices: is_random.choices })}
                            trackColor={{ false: '#767577', true: '#75d99e' }}
                            thumbColor={is_random.questions ? '#00C853' : '#f4f3f4'}
                            disabled={subject === ''} />
                    </View>
                );
            }
            function Choices_switch() {
                return (
                    <View style={[styles.row, { padding: 5 }]}>
                        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                            <MaterialCommunityIcons
                                name="shuffle-variant"
                                size={20}
                                color="grey"
                                style={{ marginRight: 3 }} />
                            <Text style={styles.text}>عشوائية الخيارات</Text>
                        </View>
                        <Switch
                            value={is_random.choices}
                            onValueChange={() => set_is_random({ questions: is_random.questions, choices: !is_random.choices })}
                            trackColor={{ false: '#767577', true: '#75d99e' }}
                            thumbColor={is_random.choices ? '#00C853' : '#f4f3f4'}
                            disabled={subject === ''} />

                    </View>
                );
            }
            function Cycles_switch() {
                function handle_switch() {
                    if (cycles) {
                        set_cycles(false);
                        set_quizzes([]);
                    } else {
                        set_cycles(true);
                        set_quizzes(get_cycles_titles());
                    }
                }
                return (
                    <View style={[styles.row, { padding: 5 }]}>
                        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                            <MaterialCommunityIcons
                                name="check-decagram"
                                size={20}
                                color="grey"
                                style={{ marginRight: 3 }} />
                            <Text style={styles.text}>الدورات فقط</Text>
                        </View>
                        <Switch
                            value={cycles}
                            onValueChange={() => handle_switch()}
                            trackColor={{ false: '#767577', true: '#ec9b99' }}
                            thumbColor={cycles ? '#E53935' : '#f4f3f4'}
                            disabled={get_cycles_titles().length === 0} />
                    </View>
                );
            }
            function Total_number() {
                return (
                    <View style={[styles.row, { padding: 5 }]}>
                        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                            <MaterialCommunityIcons
                                name="format-list-numbered-rtl"
                                size={20}
                                color="grey"
                                style={{ marginRight: 3 }} />
                            <Text style={styles.text}>عدد الأسئلة</Text>
                        </View>
                        <Text style={{
                            fontFamily: 'Cairo-SemiBold',
                            fontSize: 16,
                            color: '#616161',
                        }} >{total_number}</Text>
                    </View>
                );
            }
            return (
                <Surface style={{
                    margin: 4,
                    elevation: 1,
                    padding: 3,
                    borderWidth: 1,
                    borderColor: '#d7d8d2',
                }}>
                    <Subheading style={{
                        fontFamily: 'Cairo-Bold',
                        color: '#343434',
                        padding: 5,
                    }}>خيارات إضافية</Subheading>
                    <Questions_switch />
                    <Divider />
                    <Choices_switch />
                    <Divider />
                    <Cycles_switch />
                    <Divider />
                    <Total_number />
                </Surface>
            );
        }

        function Exam_button() {
            function is_ready() {
                if (subject === '' || quizzes.length === 0) { return false; }
                return true;
            }
            function make_exam() {
                if (quizzes.length > 0) {
                    let quiz = {
                        title: `امتحان مخصص في ${subject}`,
                        questions:
                            [].concat(...database
                                .filter(q => q.subject === subject)
                                .filter(u => is_valid(u))
                                .filter(i => quizzes.includes(i.title))
                                .map(z => z.questions)),
                        wrong_count: 0,
                        index: 0,
                        get_question(index) {
                            return this.questions[index];
                        },
                        get_questions_number() {
                            return this.questions.length;
                        },
                        get_remaining_time(index) {
                            let time = (((this.questions.length - index) * 45) / 60).toFixed(2).toString().split('');
                            if (time.length === 4) {
                                time.unshift('0');
                                time[2] = ':';
                                return time.join('');
                            }
                            time[2] = ':';
                            return time.join('');
                        },
                        get_shuffled_questions(onlyQuestions = true, onlyChoices = true) {
                            if (onlyQuestions) {
                                let array = this.questions;
                                for (let i = array.length - 1; i > 0; i--) {
                                    const j = Math.floor(Math.random() * (i + 1));
                                    [array[i], array[j]] = [array[j], array[i]];
                                }
                                this.questions = array;
                            }

                            if (onlyChoices) {

                                for (let i = 0; i < this.questions.length; i++) {
                                    let choices_array = this.questions[i].choices;
                                    // eslint-disable-next-line no-shadow
                                    for (let i = choices_array.length - 1; i > 0; i--) {
                                        const j = Math.floor(Math.random() * (i + 1));
                                        [choices_array[i], choices_array[j]] = [choices_array[j], choices_array[i]];
                                    }
                                    this.questions[i].choices = choices_array;
                                }
                            }
                        },
                    };
                    Analytics.trackEvent('Custom Exam', { Subject: subject });
                    quiz.get_shuffled_questions(is_random.questions, is_random.choices);
                    navigation.navigate('Home', {
                        screen: 'Exam',
                        params: {
                            quiz,
                            exam_time: DateTime.fromISO(DateTime.now().toISOTime()),
                            random_questions: is_random.questions,
                            random_choices: is_random.choices,
                        },
                    });
                }
            }
            return (
                <View style={{
                    margin: 5,
                }}>
                    <Surface style={{
                        borderWidth: 2,
                        borderColor: is_ready() ? colors.success : '#D7D8D2',
                    }}>
                        <Pressable
                            onPress={make_exam}
                            android_ripple={{ color: 'rgba(0, 0, 0, .32)', borderless: false }}
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 15,
                            }}>
                            <Text
                                style={
                                    [styles.title,
                                    {
                                        textDecorationLine: is_ready() ? null : 'line-through',
                                        color: is_ready() ? '#343434' : 'grey',
                                    }]}
                            >خوض الامتحان</Text>
                        </Pressable>
                    </Surface>
                </View>
            );
        }



        return (
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                scrollEnabled={scrollEnabled}
                onContentSizeChange={onContentSizeChange}>
                <View style={styles.container}>
                    <Subjects />
                    <Quizzes />
                    {subject !== '' ?
                        <>
                            <Options />
                            <Exam_button />
                        </>
                        : null}
                </View>
            </ScrollView>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerStyle: { height: 50 } }}>
            <Stack.Screen
                name="CustomExam"
                component={CustomExam_component}
                options={{
                    title: 'امتحان مخصص',
                    headerTitleStyle: { fontFamily: 'Cairo-Bold', fontSize: 14 },
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
        </Stack.Navigator>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        padding: 5,
    },
    text: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 14,
        color: '#616161',
    },
    row: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    surface: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#D7D8D2',
        margin: 3,
    },
    title: {
        fontFamily: 'Cairo-Bold',
        color: '#313131',
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
