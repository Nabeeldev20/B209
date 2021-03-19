import * as React from 'react'
import { View, Text, StyleSheet, FlatList, ScrollView, Dimensions } from 'react-native'
import { Checkbox, Divider, Subheading, Switch, Surface, TouchableRipple, useTheme } from 'react-native-paper'
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DateTime } from 'luxon'
import Analytics from 'appcenter-analytics';
import { useFonts } from 'expo-font';

import { get_database, get_error_msgs, update_error_msgs } from './db'
import { MMKV } from 'react-native-mmkv';

export default function CustomExam({ navigation }) {
    let [fontsLoaded] = useFonts({
        'Cairo_700Bold': require('../assets/fonts/Cairo-Bold.ttf'),
        'Cairo_600SemiBold': require('../assets/fonts/Cairo-SemiBold.ttf'),
    });
    const Stack = createStackNavigator();
    const { colors } = useTheme();
    const [selectedSubject, setSelectedSubject] = React.useState([]);
    const [onlyCycles, setOnlyCycles] = React.useState(false);
    const [randomQuestions, setRandomQuestions] = React.useState(true);
    const [randomChoices, setRandomChoices] = React.useState(true);
    const [quizArray, setQuizArray] = React.useState([])
    const [isAll, setIsAll] = React.useState(false);


    const [screenHeight, setScreenHeight] = React.useState(Dimensions.get('window'));
    const { height } = Dimensions.get('window');
    const scrollEnabled = () => {
        return screenHeight > height ? true : false
    }
    const onContentSizeChange = (contentHeight) => {
        setScreenHeight(contentHeight);
    }

    function custom_exam({ navigation }) {

        const SubjectCheckbox = () => {
            let subjects = [];
            get_database().forEach(quiz => subjects.push(quiz.subject));
            return (
                <FlatList
                    data={[...new Set(subjects)]}
                    extraData={[...new Set(subjects)]}
                    ListEmptyComponent={empty_subject}
                    renderItem={({ item }) => (
                        <View key={item} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Checkbox
                                status={selectedSubject.includes(item) ? 'checked' : 'unchecked'}
                                onPress={() => selectedSubject.length == 1 ? (setSelectedSubject([]), setQuizArray([]), setIsAll(false)) : setSelectedSubject([item])}
                                color='#00C853' />
                            <Text
                                style={[styles.text, { color: selectedSubject.includes(item) ? '#00C853' : 'grey' }]}
                                onPress={() => selectedSubject.length == 1 ? (setSelectedSubject([]), setQuizArray([]), setIsAll(false)) : setSelectedSubject([item])}
                            >{item}</Text>
                        </View>
                    )}
                    numColumns={2}
                />
            );
        }
        const empty_subject = () => {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}>
                    <MaterialCommunityIcons name='file-download' size={24} color='grey' />
                    <Text style={styles.text}> جرّب إضافة بعض الملفات </Text>
                </View>
            )
        }
        const SubjectFilesList = () => {
            const Files = get_database().filter(quiz => quiz.subject == selectedSubject[0]);
            if (selectedSubject.length == 1) {
                return (

                    <View>
                        <FlatList
                            data={Files}
                            renderItem={({ item, i }) => (
                                <View key={item.title} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <Checkbox
                                        status={quizArray.includes(item.title) ? 'checked' : 'unchecked'}
                                        onPress={() => quizArray.includes(item.title) ? setQuizArray(quizArray.filter(file => file != item.title)) : setQuizArray([...quizArray, item.title])}
                                        color='#00C853' />
                                    <Text
                                        style={styles.text}
                                        onPress={() => quizArray.includes(item.title) ? setQuizArray(quizArray.filter(file => file != item.title)) : setQuizArray([...quizArray, item.title])}
                                    >{item.title}</Text>
                                </View>
                            )}
                            ItemSeparatorComponent={() => (<Divider />)}
                            numColumns={2}
                        />
                    </View>

                )
            } else {
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}>
                        <MaterialCommunityIcons name='file-plus' size={24} color='grey' />
                        <Text style={styles.text}>اختر مقرراً من فضلك</Text>
                    </View>
                )
            }
        }
        const ExamOptions = () => {
            return (
                <View>
                    <View style={[styles.row, { padding: 5 }]}>
                        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                            <MaterialCommunityIcons name='shuffle' size={20} style={{ marginRight: 3 }} color='grey' />
                            <Text style={styles.text}>عشوائية بالأسئلة</Text>
                        </View>
                        <Switch
                            value={randomQuestions}
                            onValueChange={() => setRandomQuestions(!randomQuestions)}
                            color='#00C853'
                            disabled={selectedSubject.length != 1 ? true : false}
                        />
                    </View>
                    <Divider />
                    <View style={[styles.row, { padding: 5 }]}>
                        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                            <MaterialCommunityIcons name='shuffle-variant' size={20} style={{ marginRight: 3 }} color='grey' />
                            <Text style={styles.text}>عشوائية بالخيارات</Text>
                        </View>
                        <Switch
                            value={randomChoices}
                            onValueChange={() => setRandomChoices(!randomChoices)}
                            color={colors.success}
                            disabled={selectedSubject.length != 1 ? true : false}
                        />
                    </View>
                    <Divider />
                    <View style={[styles.row, { padding: 5 }]}>
                        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                            <MaterialCommunityIcons name='check-decagram' size={20} style={{ marginRight: 3 }} color='grey' />
                            <Text style={styles.text}>الدورات فقط</Text>
                        </View>
                        <Switch
                            value={onlyCycles}
                            onValueChange={() => handle_cycles_only()}
                            color={colors.error}
                            disabled={selectedSubject.length != 1 ? true : false}
                        />
                    </View>
                </View>
            )
        }
        const handleAll = () => {
            if (selectedSubject.length == 1) {
                let array = get_database().filter(quiz => quiz.subject == selectedSubject[0]);
                let output = [];
                array.forEach(item => output.push(item.title));
                setQuizArray([...new Set(output)]);
                if (isAll) {
                    setQuizArray([]);
                    setIsAll(!isAll)
                }
                setIsAll(!isAll)
            }
        }
        const handle_cycles_only = () => {
            let array = get_database().filter(quiz => quiz.subject == selectedSubject[0])
            let output = [];
            array.forEach(item => item.is_cycle() ? output.push(item.title) : null);
            setQuizArray([...new Set(output)]);
            if (onlyCycles) {
                setQuizArray([]);
                setOnlyCycles(!onlyCycles)
            }
            setOnlyCycles(!onlyCycles)
        }
        function make_questions() {
            let output = [];
            get_database().filter(quiz => quiz.subject == selectedSubject[0]).forEach(file => {
                if (quizArray.includes(file.title)) {
                    output = [...output, ...file.questions]
                }
            })
            return { questions: output, questions_number: output.length }
        }

        const makeExam = () => {
            if (quizArray.length > 0) {
                const quiz = {
                    title: `امتحان مخصص في ${selectedSubject[0]}`,
                    questions: make_questions().questions,
                    index: 0,
                    get_question(index) {
                        return this.questions[index]
                    },
                    get_questions_number() {
                        return this.questions.length
                    },
                    get_remaining_time(index) {
                        let time = (((this.questions.length - index) * 45) / 60).toFixed(2).toString().split('');
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
                Analytics.trackEvent('Custom Exam', { Subject: selectedSubject[0] });
                quiz.get_shuffled_questions(randomQuestions, randomChoices)
                navigation.navigate('Home', {
                    screen: 'Exam',
                    params: {
                        quiz,
                        exam_time: DateTime.fromISO(DateTime.now().toISOTime())
                    }
                })
            }
        }
        function read_mmkv() {
            try {
                let output = MMKV.get('act_array')
                if (output != null || undefined) {
                    return output
                } else {
                    output = 'null or undefined'
                }
            } catch (error) {
                update_error_msgs({ Code: 'Error reading MMKV', error })
            }
        }
        return (
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollview}
                scrollEnabled={scrollEnabled}
                onContentSizeChange={onContentSizeChange}
            >
                <View style={styles.container}>
                    <Text>{JSON.stringify(get_error_msgs(), null, 2)}</Text>
                    <Text>{JSON.stringify(read_mmkv(), null, 2)}</Text>
                    <Surface style={styles.surface}>
                        <Subheading style={styles.title}>المقررات</Subheading>
                        <SubjectCheckbox />
                    </Surface>
                    <Surface style={styles.surface}>
                        <View style={styles.row}>
                            <Subheading style={styles.title}>ملفات المقرر</Subheading>
                            <View style={styles.row}>
                                <Text style={[styles.text, { marginRight: 5, color: 'grey' }]}> اختيار الكل</Text>
                                <Switch value={isAll} onValueChange={handleAll} color='#00C853' disabled={selectedSubject.length != 1 ? true : false} />
                            </View>
                        </View>

                        <SubjectFilesList />

                    </Surface>

                    <Surface style={styles.surface}>
                        <Subheading style={styles.title}>خيارات إضافية</Subheading>
                        <ExamOptions />
                    </Surface>

                    <TouchableRipple
                        rippleColor="rgba(0, 0, 0, .32)"
                        onPress={makeExam}
                        style={{ margin: 3 }}
                    >
                        <Surface style={[styles.surface, { alignItems: 'center', justifyContent: 'center', margin: 0 }]}>
                            <Text
                                style={[styles.title, { textDecorationLine: selectedSubject.length != 1 || quizArray.length == 0 ? 'line-through' : null }]}
                            >خوض الامتحان</Text>
                        </Surface>
                    </TouchableRipple>
                    <Text style={[styles.text, { alignSelf: 'center', fontSize: 12 }]}>عدد الأسئلة {make_questions().questions_number} </Text>
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
                    headerTitleStyle: { fontFamily: 'Cairo_700Bold' },
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
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 14,
        color: 'grey'
    },
    row: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    surface: {
        padding: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#D7D8D2',
        backgroundColor: 'white',
        margin: 3
    },
    title: {
        fontFamily: 'Cairo_700Bold',
        color: '#313131'
    },
    scrollview: {
        flexGrow: 1,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
