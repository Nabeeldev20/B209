import * as React from 'react'
import { View, Text, StyleSheet, FlatList, ScrollView, Dimensions, Pressable, Switch } from 'react-native'
import { Checkbox, Divider, Subheading, Surface, useTheme } from 'react-native-paper'
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DateTime } from 'luxon'
import Analytics from 'appcenter-analytics';
import { get_database, get_act, get_error_msgs } from './db'

export default function CustomExam({ navigation }) {
    const Stack = createStackNavigator();
    const { colors } = useTheme();

    const [screenHeight, setScreenHeight] = React.useState(Dimensions.get('window'));
    const { height } = Dimensions.get('window');
    const scrollEnabled = () => {
        return screenHeight > height ? true : false
    }
    const onContentSizeChange = (contentHeight) => {
        setScreenHeight(contentHeight);
    }
    const [selected_subject, set_selected_subject] = React.useState('');
    const [selected_quizzes, set_selected_quizzes] = React.useState([]);
    const [selected_all, set_selected_all] = React.useState(false);
    const [random_questions, set_random_questions] = React.useState(true);
    const [random_choices, set_random_choices] = React.useState(true);
    const [selected_cycles, set_selected_cycles] = React.useState(false);
    function custom_exam({ navigation }) {

        function SubjectsCheckboxes() {
            function get_subjects() {
                let output = [];
                get_database().forEach(item => {
                    output.push(item.subject)
                })
                return [...new Set(output)]
            }
            function is_selected(item) {
                if (selected_subject == item) return true
                return false
            }
            function select(item) {
                if (selected_subject == item) {
                    set_selected_subject('');
                    set_selected_quizzes([]);
                    set_selected_all(false);
                } else {
                    set_selected_subject(item)
                }
            }
            function NoSubjects() {
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}>
                        <MaterialCommunityIcons name='file-download' size={24} color='grey' />
                        <Text style={styles.text}> جرّب إضافة بعض الملفات </Text>
                    </View>
                )
            }
            return (
                <Surface style={{
                    margin: 4,
                    elevation: 1,
                    padding: 3,
                    borderWidth: 1,
                    borderColor: '#d7d8d2'
                }}>
                    <Subheading style={{
                        fontFamily: 'Cairo-Bold',
                        color: '#343434',
                        padding: 5
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
                                        alignItems: 'center'
                                    }}>
                                    <Checkbox
                                        onPress={() => select(item)}
                                        status={is_selected(item) ? 'checked' : 'unchecked'}
                                        color='#00C853' />
                                    <Text style={{
                                        fontFamily: 'Cairo-SemiBold',
                                        fontSize: 14,
                                        color: '#616161'
                                    }}>{item}</Text>
                                </Pressable>
                            )
                        }} />

                </Surface>
            )
        }
        function QuizzesCheckBoxes() {
            function is_selected(item) {
                if (selected_quizzes.includes(item)) return true
                return false
            }
            function unselect(item) {
                return selected_quizzes.filter(title => title != item)

            }
            function select(item) {
                if (is_selected(item)) {
                    set_selected_quizzes(unselect(item))
                } else {
                    set_selected_quizzes([...selected_quizzes, item])
                }
            }
            function handle_selected_all() {
                if (selected_all) {
                    set_selected_all(false);
                    set_selected_quizzes([])
                } else {
                    set_selected_all(true);
                    set_selected_cycles(false)
                    set_selected_quizzes([...get_quizzes().all])
                }
            }
            function NoQuizzes() {
                if (selected_subject == '') {
                    return (
                        <View style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}>
                            <MaterialCommunityIcons name='book-plus' size={24} color='grey' />
                            <Text style={styles.text}>اختر مقرراً من فضلك</Text>
                        </View>
                    )
                }
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}>
                        <MaterialCommunityIcons name='file-key' size={24} color='grey' />
                        <Text style={styles.text}>ملفات البنوك المفعلة + المجانية</Text>
                    </View>
                )
            }
            return (
                <Surface style={{
                    margin: 4,
                    elevation: 1,
                    padding: 3,
                    borderWidth: 1,
                    borderColor: '#d7d8d2'
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 3
                    }}>
                        <Subheading style={{
                            fontFamily: 'Cairo-Bold',
                            color: '#313131',
                            padding: 5
                        }}>اختبارات المقرر</Subheading>
                        <View style={styles.row}>
                            <Text style={[styles.text, { marginRight: 5, color: '#616161' }]}> اختيار الكل</Text>
                            <Switch
                                value={selected_all}
                                onValueChange={() => handle_selected_all()}
                                trackColor={{ false: '#767577', true: '#75d99e' }}
                                thumbColor={selected_all ? '#00C853' : '#f4f3f4'}
                                disabled={selected_subject == ''} />
                        </View>
                    </View>
                    <FlatList
                        data={get_quizzes().all}
                        extraData={get_quizzes().all}
                        numColumns={2}
                        ListEmptyComponent={NoQuizzes}
                        renderItem={({ item }) => {
                            return (
                                <Pressable
                                    key={item}
                                    onPress={() => select(item)}
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}>
                                    <Checkbox
                                        onPress={() => select(item)}
                                        status={is_selected(item) ? 'checked' : 'unchecked'}
                                        color='#00C853' />
                                    <Text style={{
                                        fontFamily: 'Cairo-SemiBold',
                                        fontSize: 14,
                                        color: '#616161'
                                    }}>{item}</Text>
                                </Pressable>
                            )
                        }} />
                </Surface>
            )
        }
        function QuizOptions() {
            function get_cycles() {
                let { all, cycles } = get_quizzes();
                let output = []
                for (let i = 0; i < all.length; i++) {
                    if (cycles.includes(all[i])) {
                        output.push(all[i])
                    }
                }
                return output
            }
            function handle_selected_cycles() {

                if (selected_cycles) {
                    set_selected_cycles(false);
                    set_selected_quizzes([])
                } else {
                    set_selected_cycles(true);
                    set_selected_all(false);
                    set_selected_quizzes([...get_cycles()])
                }
            }
            return (
                <Surface style={{
                    margin: 4,
                    elevation: 1,
                    padding: 3,
                    borderWidth: 1,
                    borderColor: '#d7d8d2'
                }}>
                    <Subheading style={{
                        fontFamily: 'Cairo-Bold',
                        color: '#343434',
                        padding: 5
                    }}>خيارات إضافية</Subheading>
                    <View style={[styles.row, { padding: 5 }]}>
                        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                            <MaterialCommunityIcons
                                name='shuffle'
                                size={20}
                                color='grey'
                                style={{ marginRight: 3 }} />
                            <Text style={styles.text}>عشوائية بالأسئلة</Text>
                        </View>
                        <Switch
                            value={random_questions}
                            onValueChange={() => set_random_questions(!random_questions)}
                            trackColor={{ false: '#767577', true: '#75d99e' }}
                            thumbColor={random_questions ? '#00C853' : '#f4f3f4'}
                            disabled={selected_subject == ''} />
                    </View>
                    <Divider />
                    <View style={[styles.row, { padding: 5 }]}>
                        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                            <MaterialCommunityIcons
                                name='shuffle-variant'
                                size={20}
                                color='#616161'
                                style={{ marginRight: 3 }} />
                            <Text style={styles.text}>عشوائية بالخيارات</Text>
                        </View>
                        <Switch
                            value={random_choices}
                            onValueChange={() => set_random_choices(!random_choices)}
                            trackColor={{ false: '#767577', true: '#75d99e' }}
                            thumbColor={random_choices ? '#00C853' : '#f4f3f4'}
                            disabled={selected_subject == ''} />

                    </View>
                    <Divider />
                    <View style={[styles.row, { padding: 5 }]}>
                        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                            <MaterialCommunityIcons
                                name='check-decagram'
                                size={20}
                                color='#616161'
                                style={{ marginRight: 3 }} />
                            <Text style={styles.text}>الدورات فقط</Text>
                        </View>
                        <Switch
                            value={selected_cycles}
                            onValueChange={() => handle_selected_cycles()}
                            trackColor={{ false: '#767577', true: '#ec9b99' }}
                            thumbColor={selected_cycles ? '#E53935' : '#f4f3f4'}
                            disabled={get_cycles().length == 0} />
                    </View>
                    <Divider />
                    <View style={[styles.row, { padding: 5 }]}>
                        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                            <MaterialCommunityIcons
                                name='format-list-numbered-rtl'
                                size={20}
                                color='#616161'
                                style={{ marginRight: 3 }} />
                            <Text style={[styles.text, { marginRight: 3 }]}>عدد الأسئلة</Text>
                        </View>
                        <Text style={styles.text} >{get_questions().length}</Text>
                    </View>
                </Surface>
            )
        }
        function GoExam() {
            function is_ready() {
                if (selected_subject == '' || selected_quizzes.length == 0) return false;
                return true
            }
            return (
                <View style={{
                    margin: 5,
                }}>
                    <Surface style={{
                        borderWidth: 2,
                        borderColor: is_ready() ? colors.success : '#D7D8D2'
                    }}>
                        <Pressable
                            onPress={make_exam}
                            android_ripple={{ color: 'rgba(0, 0, 0, .32)', borderless: false }}
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 15
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
            )
        }
        function get_quizzes() {
            function is_valid(quiz) {
                if (quiz.is_paid()) {
                    if (get_act().includes(quiz.code)) {
                        return true
                    }
                    return false
                } else {
                    return true
                }
            }
            function fetch_quizzes() {
                let all = [];
                let cycles = []
                let data = get_database().filter(file => file.subject == selected_subject);
                for (let i = 0; i < data.length; i++) {
                    if (is_valid(data[i])) {
                        all.push(data[i].title);
                        if (data[i].is_cycle()) {
                            cycles.push(data[i].title)
                        }
                    }
                }
                return { all, cycles }
            }
            return fetch_quizzes()
        }
        function get_questions() {
            let data = get_database();
            let output = []
            for (let i = 0; i < data.length; i++) {
                if (selected_quizzes.includes(data[i].title)) {
                    output = [...output, ...data[i].questions]
                }
            }
            return output
        }
        function make_exam() {
            if (selected_quizzes.length > 0) {
                let quiz = {
                    title: `امتحان مخصص في ${selected_subject}`,
                    subject: selected_subject,
                    questions: get_questions(),
                    index: 0,
                    get_question(index) {
                        return this.questions[index]
                    },
                    get_questions_number() {
                        return this.questions.length
                    },
                    get_remaining_time(index) {
                        let diff = this.questions.length - index;
                        if (diff == 1) {
                            diff = 0.6
                        }
                        let time = ((diff * 45) / 60).toFixed(2).toString().split('');
                        if (time.length == 4) {
                            time.unshift('0')
                            time[2] = ':'
                            return time.join('')
                        }
                        time[2] = ':'

                        return time.join('')
                    },
                    get_shuffled_questions(onlyQuestions = true, onlyChoices = true) {
                        if (onlyQuestions) {
                            let array = this.questions
                            for (let i = array.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [array[i], array[j]] = [array[j], array[i]];
                            }
                            this.questions = array
                        }

                        if (onlyChoices) {

                            for (let i = 0; i < this.questions.length; i++) {
                                let choices_array = this.questions[i].choices
                                for (let i = choices_array.length - 1; i > 0; i--) {
                                    const j = Math.floor(Math.random() * (i + 1));
                                    [choices_array[i], choices_array[j]] = [choices_array[j], choices_array[i]];
                                }
                                this.questions[i].choices = choices_array
                            }
                        }
                    }
                }
                Analytics.trackEvent('Custom Exam', { Subject: selected_subject });
                quiz.get_shuffled_questions(random_questions, random_choices);
                navigation.navigate('Home', {
                    screen: 'Exam',
                    params: {
                        quiz,
                        exam_time: DateTime.fromISO(DateTime.now().toISOTime()),
                        random_questions,
                        random_choices
                    }
                })
            }
        }
        return (
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                scrollEnabled={scrollEnabled}
                onContentSizeChange={onContentSizeChange}>
                <View style={styles.container}>
                    <SubjectsCheckboxes />
                    <QuizzesCheckBoxes />
                    <QuizOptions />
                    <GoExam />
                    <Text style={{ color: 'red' }}>{JSON.stringify(get_error_msgs(), null, 2)}</Text>
                </View>
            </ScrollView>
        )
    }

    return (
        <Stack.Navigator screenOptions={{ headerStyle: { height: 50 } }}>
            <Stack.Screen
                name='CustomExam'
                component={custom_exam}
                options={{
                    title: 'امتحان مخصص',
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
        padding: 5
    },
    text: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 14,
        color: '#616161'
    },
    row: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    surface: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#D7D8D2',
        margin: 3
    },
    title: {
        fontFamily: 'Cairo-Bold',
        color: '#313131'
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
