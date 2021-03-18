import * as React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Surface, TouchableRipple, Divider } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DateTime } from 'luxon'
import * as Animatable from 'react-native-animatable';
import { get_database, save_file } from './db'

let database = get_database();

export default function FinishScreen({ navigation, route }) {
    const { quiz, wrong_count, exam_time } = route.params

    function get_ratio_score() {
        let right = quiz.get_questions_number() - wrong_count;
        return Math.ceil((right * 100) / quiz.get_questions_number())
    }
    function get_text_score(number) {
        function between(x, min, max) {
            return x >= min && x < max ? true : false
        }
        if (between(number, 0, 70)) {
            return { text: 'عادي.', color: '#313131' }
        }
        if (between(number, 70, 80)) {
            return { text: 'جيد', color: '#4CAF50' }
        }
        if (between(number, 80, 85)) {
            return { text: 'جيد جداً', color: '#4CAF50' }
        }
        if (between(number, 85, 90)) {
            return { text: 'ممتاز', color: '#4CAF50' }
        }
        if (between(number, 90, 95)) {
            return { text: 'رائع', color: '#4CAF50' }
        }
        if (between(number, 95, 100) || number == 100) {
            return { text: 'عظيم جداً', color: '#4CAF50' }
        }
    }
    function get_time() {
        let end = DateTime.fromISO(DateTime.now().toISOTime())
        let start = exam_time
        return Math.ceil(end.diff(start, 'minutes').toObject().minutes)
    }
    function get_recommendation(index) {
        let data = database.filter(item => item.subject == quiz.subject).filter(file => file.title != quiz.title).sort((a, b) => b.last_time - a.last_time);
        if (data[index] != undefined) {
            return {
                visible: true,
                title: data[index].title,
                quiz: data[index],
                questions_number: data[index].get_questions_number()
            }
        }
        return { visible: false }
    }
    function go_exam(exam = quiz) {
        exam.get_shuffled_questions();
        exam.index = 0;
        navigation.replace('Exam', { quiz: exam, exam_time: DateTime.fromISO(DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE)) })
    }
    async function update_quiz() {
        quiz.update_average_time(Math.ceil(get_time() * 60));
        quiz.update_average_accuracy(get_ratio_score());
        quiz.index = 0;
        quiz.last_time = DateTime.now().toISODate();
        save_file(quiz)
    }
    function update_data() {
        if (!quiz.title.includes('مخصص')) {
            React.useEffect(() => {
                navigation.addListener('beforeRemove', (e) => {
                    update_quiz();
                })
            }, [])

        }
    }
    update_data();
    return (
        <Animatable.View style={styles.container} animation="fadeIn" duration={2000}>
            <View>
                <Surface style={styles.surface}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 2 }}>
                        <Text style={[styles.message, { color: get_text_score(get_ratio_score()).color }]}>{get_text_score(get_ratio_score()).text}</Text>
                        <Animatable.Text
                            style={[styles.numbers, { color: get_text_score(get_ratio_score()).color }]}
                            animation="tada"
                            iterationCount={3}>
                            {quiz.get_questions_number() - wrong_count}/{quiz.get_questions_number()}
                        </Animatable.Text>
                    </View>
                    <Divider style={{ margin: 4 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', padding: 10 }}>
                        <View style={{ alignItems: 'center' }}>
                            <MaterialCommunityIcons name='chart-bell-curve-cumulative' size={16} />
                            <Text style={styles.exam_result}>الدقة</Text>
                            <Text style={styles.exam_result}>%{get_ratio_score()}</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <MaterialCommunityIcons name='timer-sand' size={16} />
                            <Text style={styles.exam_result}>الوقت</Text>
                            <Text style={styles.exam_result}>{get_time()} د</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <MaterialCommunityIcons name='playlist-remove' size={16} />
                            <Text style={styles.exam_result}>الخطأ</Text>
                            <Text style={styles.exam_result}>{wrong_count}</Text>
                        </View>
                    </View>
                </Surface>

                {!quiz.title.includes('مخصص') ?
                    <Surface style={styles.surface}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name='target-variant' size={16} style={{ marginRight: 15 }} />
                                <Text style={styles.exam_result}>متوسط التحصيل في مقرر {quiz.subject}</Text>
                            </View>
                            <Text style={styles.exam_result}>%{quiz.get_average_accuracy()}</Text>
                        </View>
                        <Divider />
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name='history' size={16} style={{ marginRight: 15 }} />
                                <Text style={styles.exam_result}>متوسط الوقت لمقرر {quiz.subject}</Text>
                            </View>
                            <Text style={styles.exam_result}>%{quiz.get_average_time()}</Text>
                        </View>
                    </Surface> : null}

                <TouchableRipple
                    onPress={() => go_exam()}
                    rippleColor="rgba(0, 0, 0, .32)"
                    style={{
                        marginHorizontal: 50,
                        marginVertical: 20,
                    }}>
                    <Surface style={styles.doItAgain}>
                        <Text style={{ fontFamily: 'Cairo_700Bold', fontSize: 15 }}>خوض الاختبار مجدداً</Text>
                        <MaterialCommunityIcons name='refresh' color='green' size={25} style={{ marginLeft: 10 }} />
                    </Surface>
                </TouchableRipple>

                {!quiz.title.includes('مخصص') ?

                    <View style={{ flex: 1 }}>
                        {get_recommendation(0).visible ?
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                                    <MaterialCommunityIcons name='telescope' color='grey' size={16} style={{ marginRight: 3 }} />
                                    <Text style={{ fontFamily: 'Cairo_600SemiBold', color: 'grey' }}>اختبارت أخرى لحلها: </Text>
                                </View>

                                <TouchableRipple
                                    key={get_recommendation(0).title}
                                    onPress={() => go_exam(get_recommendation(0).quiz)}
                                    rippleColor="rgba(0, 0, 0, .32)"
                                    style={{
                                        margin: 5,
                                    }}>
                                    <Surface style={styles.recommendation}>
                                        <Text style={{ fontFamily: 'Cairo_700Bold' }}>{get_recommendation(0).title}</Text>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <Text>{get_recommendation(0).questions_number}</Text>
                                            <MaterialCommunityIcons name="format-list-numbered" size={16} color="grey" style={{ marginLeft: 5 }} />
                                        </View>
                                    </Surface>
                                </TouchableRipple>

                            </View> : <EmptySpace />}

                        {get_recommendation(1).visible ?
                            <TouchableRipple
                                key={get_recommendation(1).title}
                                onPress={() => go_exam(get_recommendation(1).quiz)}
                                rippleColor="rgba(0, 0, 0, .32)"
                                style={{
                                    margin: 5,
                                }}>
                                <Surface style={styles.recommendation}>
                                    <Text style={{ fontFamily: 'Cairo_700Bold' }}>{get_recommendation(1).title}</Text>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <Text>{get_recommendation(1).questions_number}</Text>
                                        <MaterialCommunityIcons name="format-list-numbered" size={16} color="grey" style={{ marginLeft: 5 }} />
                                    </View>
                                </Surface>
                            </TouchableRipple> : null}
                    </View> : null}
            </View>
        </Animatable.View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        padding: 5,
    },
    message: {
        fontFamily: 'Cairo_900Black',
        fontSize: 35,
        color: '#4CAF50',
    },
    numbers: {
        fontFamily: 'Cairo_900Black',
        fontSize: 30,
        color: '#4CAF50',
    },
    surface: {
        margin: 5,
        padding: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#D7D8D2',
        backgroundColor: 'white',
    },
    exam_result: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 16,
        lineHeight: 20
    },
    recommendation: {

        padding: 15,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#D7D8D2',
        backgroundColor: 'white',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    doItAgain: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#D7D8D2',
        backgroundColor: 'white',
        elevation: 3,
    }
})