/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    Pressable,
    ToastAndroid,
} from 'react-native';
import {
    Title,
    Surface,
    Subheading,
    IconButton,
    useTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import Analytics from 'appcenter-analytics';

import { get_bookmarks, update_bookmarks, save_file, save_blsm } from './db';

export default function Exam({ navigation, route }) {
    let { quiz, exam_time, random_questions, random_choices } = route.params;


    const { colors } = useTheme();
    const [index, setIndex] = React.useState(quiz.index);
    const [visible, setVisible] = React.useState(false);
    const [hasAnswered, setHasAnswered] = React.useState(false);
    const [wrongAnswersCount, setWrongAnswersCount] = React.useState(0);

    const title = React.useRef(null);
    const choices_animation = React.useRef(null);
    const footer_animation = React.useRef(null);
    const bookmark_button = React.useRef(null);


    React.useEffect(() => {
        navigation.addListener('beforeRemove', e => {
            if (quiz.title.includes('مخصص') === false) {
                if (index !== quiz.get_questions_number() - 1 && index !== 0) {
                    e.preventDefault();
                    ToastAndroid.showWithGravity(
                        'جاري الحفظ',
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM,
                    );
                    quiz.index = index;
                    quiz.wrong_count = wrongAnswersCount;
                    try {
                        save_file(quiz);
                    } catch (error) {
                        ToastAndroid.showWithGravity(
                            'Error#010',
                            ToastAndroid.LONG,
                            ToastAndroid.BOTTOM,
                        );
                    }
                    navigation.dispatch(e.data.action);
                }
            }
        });
    }, [index, navigation]);

    const Footer = () => {
        if (hasAnswered) {
            return (
                <Animatable.View
                    ref={footer_animation}
                    animation="fadeInUp"
                    duration={1200}>
                    <View
                        style={{
                            backgroundColor: '#fff',
                            borderWidth: 2,
                            borderColor: '#D7D8D2',
                        }}>
                        <Pressable
                            onPress={move_to_next_question}
                            android_ripple={{ color: 'rgba(0, 0, 0, .32)', borderless: false }}
                            style={{
                                padding: 15,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18 }}>
                                {index === quiz.get_questions_number() - 1
                                    ? 'عرض النتيجة'
                                    : 'السؤال التالي'}
                            </Text>
                        </Pressable>
                    </View>
                </Animatable.View>
            );
        }
        return null;
    };
    function Explanation() {
        if (visible) {
            return (
                <Animatable.View
                    animation="fadeInDown"
                    style={{
                        backgroundColor: 'white',
                        padding: 10,
                        elevation: 5,
                    }}>
                    <Text style={styles.banner_text}>
                        شرح السؤال: {'\n'}
                        {quiz.get_question(index).explanation}
                    </Text>
                </Animatable.View>
            );
        }
        return null;
    }
    function Header() {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 10,
                    paddingHorizontal: 10,
                    paddingBottom: 10,
                }}>
                <View style={styles.row}>
                    <MaterialCommunityIcons
                        name="card-text"
                        size={20}
                        color="#616161"
                        style={{ marginRight: 3 }}
                    />
                    <Text style={styles.header_text}>
                        <Text style={{ fontWeight: 'bold' }}>{index + 1}</Text>/
            {quiz.get_questions_number()}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.header_text}>
                        {quiz.get_remaining_time(index)}
                    </Text>
                    <MaterialCommunityIcons
                        name="timer-sand"
                        size={20}
                        color="#616161"
                        style={{ marginLeft: 3 }}
                    />
                </View>
            </View>
        );
    }
    function BookmarkButton() {
        if (check_is_bookmark()) {
            return (
                <Animatable.View ref={bookmark_button}>
                    <IconButton
                        icon="bookmark"
                        size={34}
                        color="grey"
                        onPress={() => add_to_bookmarks()}
                    />
                </Animatable.View>
            );
        }
        return null;
    }
    const check_answer = async choice => {
        if (!hasAnswered) {
            if (quiz.get_question(index).is_right(choice)) {
                move_to_next_question();
            } else {
                if (quiz.get_question(index).has_explanation()) {
                    setVisible(true);
                }
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setHasAnswered(true);
                setWrongAnswersCount(wrongAnswersCount + 1);
            }
        }
    };
    const move_to_next_question = () => {
        if (index === quiz.get_questions_number() - 1) {
            navigation.replace('FinishScreen', {
                quiz,
                wrong_count: wrongAnswersCount + quiz.wrong_count,
                exam_time,
                random_questions,
                random_choices,
            });
        } else {
            if (title) {
                title.current?.fadeInRight();
            }
            if (choices_animation) {
                choices_animation.current?.fadeIn();
            }
            if (bookmark_button) {
                bookmark_button.current?.fadeIn();
            }
            setIndex(index + 1);
            setHasAnswered(false);
            setVisible(false);
        }
    };
    function add_to_bookmarks() {
        let question = quiz.get_question(index);
        question.subject = quiz.subject;
        let bookmarks = get_bookmarks();
        function add_bookmark() {
            bookmarks.push(question);
            let updated_bookmarks = [...new Set(bookmarks)];
            update_bookmarks(updated_bookmarks);
        }
        function save_to_bookmarks() {
            try {
                save_blsm();
            } catch (error) {
                ToastAndroid.showWithGravity(
                    'Error#009',
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                );
            }
        }
        if (bookmark_button) {
            bookmark_button.current?.fadeOut(900);
        }
        ToastAndroid.showWithGravity(
            'تمت الإضافة للمحفوظات',
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
        );
        add_bookmark();
        save_to_bookmarks();
        Analytics.trackEvent('Bookmark', { Subject: quiz.subject });
    }


    function check_is_bookmark() {
        function get_questions_in_bookmarks() {
            let output = [];
            let data = get_bookmarks().filter(item => item.subject === quiz.subject);
            for (let i = 0; i < data.length; i++) {
                output.push(data[i].title);
            }
            return output;
        }
        if (
            get_questions_in_bookmarks().includes(quiz.get_question(index).title) ===
            false
        ) { return true; }
        return false;
    }
    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View>
                        <Explanation />
                        <Header />

                        <Animatable.Text
                            ref={title}
                            animation="fadeInRight"
                            duration={1500}
                            style={{ paddingHorizontal: 10 }}>
                            <Title style={styles.question}>
                                {quiz.get_question(index).title}
                            </Title>
                        </Animatable.Text>

                        <Animatable.View
                            ref={choices_animation}
                            animation="fadeIn"
                            duration={1500}
                            delay={250}
                            style={{ paddingTop: 3 }}>
                            <FlatList
                                data={quiz.get_question(index).choices.filter(ch => ch !== '-')}
                                extraData={quiz
                                    .get_question(index)
                                    .choices.filter(ch => ch !== '-')}
                                renderItem={({ item }) => {
                                    return (
                                        <View
                                            key={item}
                                            style={{
                                                marginVertical: 3,
                                                marginHorizontal: 5,
                                            }}>
                                            <Surface
                                                style={{
                                                    borderColor:
                                                        hasAnswered &&
                                                            quiz.get_question(index).is_right(item)
                                                            ? colors.success
                                                            : '#D7D8D2',
                                                    borderWidth:
                                                        hasAnswered &&
                                                            quiz.get_question(index).is_right(item)
                                                            ? 2
                                                            : 1,
                                                    elevation: 2,
                                                }}>
                                                <Pressable
                                                    onPress={() => check_answer(item)}
                                                    android_ripple={{
                                                        color: quiz.get_question(index).is_right(item)
                                                            ? colors.success
                                                            : colors.error,
                                                        borderless: false,
                                                    }}
                                                    style={{
                                                        alignItems: 'flex-start',
                                                        padding: 15,
                                                    }}>
                                                    <Subheading style={styles.choice}>{item}</Subheading>
                                                </Pressable>
                                            </Surface>
                                        </View>
                                    );
                                }}
                            />
                        </Animatable.View>
                    </View>

                    <View>
                        <BookmarkButton />
                        <Text
                            style={{
                                fontFamily: 'Cairo-SemiBold',
                                alignSelf: 'center',
                                color: 'grey',
                                fontSize: 11,
                                padding: 5,
                            }}>
                            بلســـم
            </Text>
                    </View>
                </View>
            </ScrollView>

            <Footer />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'space-between',
        flexGrow: 1,
    },
    question: {
        textAlign: 'justify',
        marginVertical: 2,
        fontFamily: 'Cairo-Bold',
        fontSize: 18,
        paddingHorizontal: 10,
        selectable: false,
        paddingBottom: 5,
        marginBottom: 5,
    },
    banner_text: {
        fontFamily: 'Cairo-SemiBold',
        textAlign: 'justify',
        selectable: false,
    },
    choice: {
        textAlign: 'justify',
        fontFamily: 'Cairo-SemiBold',
        fontSize: 16,
        letterSpacing: 0,
        selectable: false,
    },
    surface: {
        borderWidth: 1,
        borderColor: '#D7D8D2',
    },
    footer: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    header_text: {
        color: '#616161',
        fontSize: 16,
        fontFamily: 'Cairo-Regular',
    },
});
