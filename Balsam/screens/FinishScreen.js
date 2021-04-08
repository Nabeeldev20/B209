import * as React from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, ToastAndroid, FlatList } from 'react-native'
import { Surface, Divider } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DateTime } from 'luxon'
import * as Animatable from 'react-native-animatable';
import { get_database, save_file } from './db'


export default function FinishScreen({ navigation, route }) {
    const { quiz, wrong_count, exam_time, random_questions, random_choices } = route.params;
    const [screenHeight, setScreenHeight] = React.useState(Dimensions.get('window'));
    const { height } = Dimensions.get('window');
    const scrollEnabled = () => {
        return screenHeight > height ? true : false
    }
    const onContentSizeChange = (contentHeight) => {
        setScreenHeight(contentHeight);
    }
    function get_ratio_score() {
        let right = quiz.get_questions_number() - wrong_count;
        return Math.ceil((right * 100) / quiz.get_questions_number())
    }
    function get_text_score(number) {
        function between(x, min, max) {
            return x >= min && x < max ? true : false
        }
        if (between(number, 0, 70)) {
            return { text: 'عادي.', color: '#74d99f' }
        }
        if (between(number, 70, 80)) {
            return { text: 'جيد', color: '#74d99f' }
        }
        if (between(number, 80, 85)) {
            return { text: 'جيد جداً', color: '#36bc6f' }
        }
        if (between(number, 85, 90)) {
            return { text: 'ممتاز', color: '#36bc6f' }
        }
        if (between(number, 90, 95)) {
            return { text: 'رائع', color: '#249d57' }
        }
        if (between(number, 95, 100) || number == 100) {
            return { text: 'عظيم جداً', color: '#249d57' }
        }
    }
    function get_time() {
        let end = DateTime.fromISO(DateTime.now().toISOTime())
        let start = exam_time
        return Math.ceil(end.diff(start, 'minutes').toObject().minutes)
    }
    function go_exam(exam = quiz) {
        exam.get_shuffled_questions(random_questions, random_choices);
        exam.index = 0;
        navigation.replace('Exam', {
            quiz: exam,
            exam_time: DateTime.fromISO(DateTime.now().toISOTime()),
            random_questions,
            random_choices
        })
    }
    async function update_quiz() {
        quiz.update_average_time(Math.ceil(get_time() * 60));
        quiz.update_average_accuracy(get_ratio_score());
        quiz.index = 0;
        quiz.taken_number += 1;
        quiz.last_time = DateTime.now().toISODate();
        try {
            save_file(quiz);
        } catch (error) {
            ToastAndroid.showWithGravity(
                "Error #013",
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM
            );
        }
    }
    function update_data() {
        if (!quiz.title.includes('مخصص')) {
            React.useEffect(() => {
                navigation.addListener('beforeRemove', (e) => {
                    e.preventDefault();
                    ToastAndroid.showWithGravity(
                        "جاري الحفظ",
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM
                    );
                    update_quiz();
                    navigation.dispatch(e.data.action);
                })
            }, [])

        }
    }
    update_data();
    function is_custom_exam() {
        if (quiz.title.includes('مخصص')) return true;
        return false
    }
    function QuizAnalytics() {
        if (is_custom_exam() == false) {
            return (
                <Surface style={styles.surface}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 5
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons
                                name='chart-areaspline-variant'
                                size={20}
                                color='#616161'
                                style={{ marginRight: 5 }} />
                            <Text style={styles.exam_result}>متوسط دقة {quiz.subject}</Text>
                        </View>
                        <Text style={styles.exam_result}>%{quiz.get_average_accuracy()}</Text>
                    </View>
                    <Divider />
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 5
                        }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons
                                name='history'
                                size={20}
                                color='#616161'
                                style={{ marginRight: 5 }} />
                            <Text style={styles.exam_result}>متوسط وقت {quiz.subject}</Text>
                        </View>
                        <Text style={styles.exam_result}>{quiz.get_average_time()}</Text>
                    </View>
                </Surface>
            )
        }
        return null;
    }
    function AgainButton() {
        return (
            <View
                style={{
                    marginHorizontal: 50,
                    marginVertical: 20,
                    padding: 10,
                }}>
                <Surface
                    style={{
                        backgroundColor: 'white',
                        elevation: 3,
                        borderWidth: 1,
                        borderColor: '#D7D8D2'
                    }}>
                    <Pressable
                        onPress={() => go_exam()}
                        android_ripple={{ color: 'rgba(0, 0, 0, .32)', borderless: false }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 15
                        }}>
                        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 15 }}>خوض الاختبار مجدداً</Text>
                        <MaterialCommunityIcons
                            name='refresh'
                            size={25}
                            color={get_text_score(get_ratio_score()).color}
                            style={{ marginLeft: 10 }} />
                    </Pressable>
                </Surface>
            </View>
        )
    }
    function Recommendation() {
        function get_recommendation() {
            let data_subjects = get_database().filter(data_quiz => data_quiz.subject == quiz.subject);
            let other_files = data_subjects.filter(file => file.title != quiz.title).sort((a, b) => a.taken_number - b.last_time);
            return other_files;
        }
        function Header() {
            return (
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 8
                }}>
                    <MaterialCommunityIcons
                        name='telescope'
                        size={20}
                        color='grey'
                        style={{ marginRight: 3 }} />
                    <Text style={{ fontFamily: 'Cairo-SemiBold', color: 'grey' }}>اختبارت أخرى لحلها: </Text>
                </View>
            )
        }
        function Cards() {
            if (get_recommendation().length > 3) {
                let output_data = [get_recommendation()[0], get_recommendation()[1]];
                return (
                    <FlatList
                        data={output_data}
                        renderItem={({ item }) => {
                            return (
                                <View style={{ margin: 5 }}>
                                    <Surface style={{
                                        backgroundColor: 'white',
                                        elevation: 2,
                                        borderWidth: 1,
                                        borderColor: '#D7D8D2',
                                    }}>
                                        <Pressable
                                            onPress={() => go_exam(item)}
                                            android_ripple={{ color: 'rgba(0, 0, 0, .32)', borderless: false }}
                                            style={{
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                padding: 15
                                            }}>
                                            <Text style={{ fontFamily: 'Cairo-Bold' }}>{item.title}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                <Text style={{ fontFamily: 'Cairo-SemiBold' }}>{item.get_questions_number()}</Text>
                                                <MaterialCommunityIcons
                                                    name="format-list-numbered"
                                                    color="#616161"
                                                    size={20}
                                                    style={{ marginLeft: 5 }} />
                                            </View>
                                        </Pressable>
                                    </Surface>
                                </View>
                            )
                        }}
                    />
                )

            }
            return null;
        }
        if (is_custom_exam() == false && get_recommendation().length > 3) {
            return (
                <View>
                    <Header />
                    <Cards />
                </View>
            )
        }
        return null
    }
    function QuizScore() {
        return (
            <Surface style={styles.surface}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginHorizontal: 2
                }}>
                    <Text style={[styles.message, { color: get_text_score(get_ratio_score()).color }]}>{get_text_score(get_ratio_score()).text}</Text>
                    <Animatable.Text
                        style={[styles.numbers, { color: get_text_score(get_ratio_score()).color }]}
                        animation={get_text_score(get_ratio_score()).text == 'عادي.' ? 'shake' : 'tada'}
                        iterationCount={3}>
                        {quiz.get_questions_number() - wrong_count}/{quiz.get_questions_number()}
                    </Animatable.Text>
                </View>
                <Divider style={{ margin: 4 }} />
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    padding: 10
                }}>
                    <View style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons
                            name='bullseye-arrow'
                            size={22}
                            color='#616161'
                            style={{ paddingBottom: 3 }} />
                        <Text style={styles.exam_result}>الدقة</Text>
                        <Text style={styles.exam_result}>%{get_ratio_score()}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons
                            name='timer-sand'
                            size={22}
                            color='#616161'
                            style={{ paddingBottom: 3 }} />
                        <Text style={styles.exam_result}>الوقت</Text>
                        <Text style={styles.exam_result}>{get_time()} د</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons
                            name='close'
                            size={22}
                            color='#616161'
                            style={{ paddingBottom: 3 }} />
                        <Text style={styles.exam_result}>الخطأ</Text>
                        <Text style={styles.exam_result}>{wrong_count}</Text>
                    </View>
                </View>
            </Surface>
        )
    }
    function Quotes() {
        let data = [
            'Prefixes:\n A-/ or an-/ => Without or lack of',
            'Prefixes:\n Bi- or bin- => Two',
            'Prefixes:\n Brady => Slow',
            'Prefixes:\n Dys- => Difficult, painful, uncomfortable',
            'Prefixes:\n Endo- => Within',
            'Prefixes:\n Epi- => On, over, upon',
            'Prefixes:\n Eu- => Normal',
            'Prefixes:\n Ex-, exo- => Outside, outward',
            'Prefixes:\n Hemi- => Half',
            'Prefixes:\n Hydro- => Water',
            'Prefixes:\n Hyper => Excessive, above normal',
            'Prefixes:\n Hypo- => Below normal',
            'Prefixes:\n Inter- => Between',
            'Prefixes:\n Intra- => Within',

            'Prefixes:\n Nulli- => None',
            'Prefixes:\n Pan- => All',
            'Prefixes:\n Para- => Abnormal',
            'Prefixes:\n Para- => Beside, beyond, around',
            'Prefixes:\n Per => Through',

            'Prefixes:\n Peri- => Around',
            'Prefixes:\n Polio- => Gray',
            'Prefixes:\n Poly- => Many, much',
            'Prefixes:\n Primi- => First',
            'Prefixes:\n Quadri- => Four',

            'Prefixes:\n Re- => Back',
            'Prefixes:\n Retro- => Backward, back',
            'Prefixes:\n Secundi- => Second',
            'Prefixes:\n Sub- => Below, under',
            'Prefixes:\n Trans- => Through, across, beyond',

            'Suffixes:\n -algia => Pain',
            'Suffixes:\n -apheresis =>Removal',
            'Suffixes:\n -ar, -ary => Pertaining to',
            'Suffixes:\n -ase => Enzyme',
            'Suffixes:\n -blast => Immature',

            'Suffixes:\n -capnia => Carbon dioxide',
            'Suffixes:\n -centesis => Surgical puncture with needle to aspirate fluid',
            'Suffixes:\n -chalasis => Relaxation',
            'Suffixes:\n -continence => To stop',


            'Suffixes:\n -cusis => Hearing',
            'Suffixes:\n -cyesis => Pregnancy',
            'Suffixes:\n -cytosis => Condition of cells',
            'Suffixes:\n -drome => Run, running',
            'Suffixes:\n -desis => Surgical fixation',

            'Suffixes:\n -ectasis => Stretching or expansion',
            'Suffixes:\n -ectomy => Surgical removal or excision',
            'Suffixes:\n -emia => A blood condition',
            'Suffixes:\n -flux => Flow',
            'Suffixes:\n -gen => Producing',

            'Suffixes:\n -genesis => Production',
            'Suffixes:\n -globin => Protein',
            'Suffixes:\n -globulin => Protein',
            'Suffixes:\n -gram => Picture or finished record',
            'Suffixes:\n -graph => Instrument used to record',

            'Suffixes:\n -graphy => Process of recording',
            'Suffixes:\n -iasis => Abnormal condition',
            'Suffixes:\n -ician => One who',
            'Suffixes:\n -ism => State of or condition',
            'Suffixes:\n -itis => Inflammation',

            'Suffixes:\n -lithiasis => Calculus or stone',
            'Suffixes:\n -lysis => Loosening, separating',
            'Suffixes:\n -lytic => Destruction or breakdown',
            'Suffixes:\n -malacia => Softening',
            'Suffixes:\n -megaly => Enlargement',

            'Suffixes:\n -metrist => Specialist in the measurement of',
            'Suffixes:\n -metry => Process of measuring',
            'Suffixes:\n -lytic => Destruction or breakdown',
            'Suffixes:\n -ology => Study of',
            'Suffixes:\n -oma => Tumor or mass',
        ]
        const random_between = (min, max) => Math.ceil(Math.random() * (max - min) + min);
        if (is_custom_exam()) {
            return (
                <View
                    style={{
                        margin: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexGrow: 1
                    }}>
                    <View>
                        <MaterialCommunityIcons
                            name='lightbulb-on'
                            color='#616161'
                            size={16} />
                        <Text style={{
                            fontFamily: 'Cairo-Bold',
                            color: '#616161'
                        }}>{data[random_between(0, data.length)]}</Text>
                    </View>
                </View>
            )
        }
        return null
    }
    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled={scrollEnabled}
            onContentSizeChange={onContentSizeChange}>
            <Animatable.View
                style={styles.container}
                animation="fadeIn"
                duration={2000}>
                <QuizScore />
                <QuizAnalytics />
                <AgainButton />
                <Recommendation />
                <Quotes />
            </Animatable.View >
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        padding: 5,
    },
    message: {
        fontFamily: 'Cairo-Black',
        fontSize: 35,
        color: '#4CAF50',
    },
    numbers: {
        fontFamily: 'Cairo-Black',
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
        fontFamily: 'Cairo-SemiBold',
        fontSize: 14,
        lineHeight: 20,
        color: '#616161'
    },
})