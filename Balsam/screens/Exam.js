import * as React from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, Pressable } from 'react-native'
import { Title, Surface, Subheading, IconButton, useTheme } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { get_bookmarks, update_bookmarks, save_file } from './db'



export default function Exam({ navigation, route }) {
    let { quiz, exam_time } = route.params;
    React.useEffect(() => {
        navigation.setOptions({ title: quiz.title })
    }, [quiz.title])

    const [screenHeight, setScreenHeight] = React.useState(Dimensions.get('window'));
    const { height } = Dimensions.get('window');
    const scrollEnabled = () => {
        return screenHeight > height ? true : false
    }
    const onContentSizeChange = (contentHeight) => {
        setScreenHeight(contentHeight);
    };

    const { colors } = useTheme();
    const [index, setIndex] = React.useState(quiz.index);
    const [visible, setVisible] = React.useState(false);
    const [hasAnswered, setHasAnswered] = React.useState(false);
    const [wrongAnswersCount, setWrongAnswersCount] = React.useState(0)
    const [inBookmark, setInBookmark] = React.useState(get_bookmarks().filter(bookmark => bookmark.subject == quiz.subject).length >= 1);

    const title = React.useRef(null);
    const choices_animation = React.useRef(null);
    const footer_animation = React.useRef(null);

    const Footer = () => {
        if (hasAnswered) {
            return (
                <Animatable.View
                    ref={footer_animation}
                    animation="fadeInUp"
                    duration={1500}>
                    <View style={{
                        backgroundColor: '#fff',
                        borderWidth: 2,
                        borderColor: '#D7D8D2'
                    }}>
                        <Pressable
                            onPress={move_to_next_question}
                            android_ripple={{ color: 'rgba(0, 0, 0, .32)', borderless: false }}
                            style={{
                                padding: 15,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <Text style={{ fontFamily: 'Cairo_700Bold', fontSize: 18 }}>
                                {index == quiz.get_questions_number() - 1 ? 'عرض النتيجة' : 'السؤال التالي'}
                            </Text>
                        </Pressable>
                    </View>
                </Animatable.View>
            )
        }
        return null
    }
    const check_answer = async (choice) => {
        if (!hasAnswered) {
            if (quiz.get_question(index).is_right(choice)) {
                move_to_next_question()
            } else {
                if (quiz.get_question(index).has_explanation()) {
                    show_banner()
                }
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setHasAnswered(true);
                setWrongAnswersCount(wrongAnswersCount + 1)
            }
        }
    }
    const move_to_next_question = () => {
        if (index == (quiz.get_questions_number() - 1)) {
            navigation.replace('FinishScreen', { quiz, wrong_count: wrongAnswersCount, exam_time })
        } else {
            if (title) {
                title.current?.fadeInRight()
            }
            if (choices_animation) {
                choices_animation.current?.fadeIn()
            }
            setIndex(index + 1);
            setHasAnswered(false);
            setVisible(false);
        }
    }
    const add_to_bookmarks = (bookmark_q) => {
        if (inBookmark) {
            update_bookmarks(get_bookmarks().filter(bookmark => bookmark.question.title != bookmark_q.question.title))
            setInBookmark(false)
        } else {
            update_bookmarks([...get_bookmarks(), bookmark_q]);
            setInBookmark(true)
        }
    }
    function show_banner() {
        setVisible(true)
    }
    function update_index() {
        if (!quiz.title.includes('مخصص')) {
            React.useEffect(() => {
                navigation.addListener('beforeRemove', (e) => {
                    if (index !== quiz.get_questions_number() - 1) {
                        e.preventDefault();
                        quiz.index = index;
                        save_file(quiz);
                        navigation.dispatch(e.data.action)
                    }
                })
            }, [index])

        }
    }
    function is_custom_exam() {
        return quiz.title.includes('مخصص') ? true : false
    }
    update_index();

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollview}
            scrollEnabled={scrollEnabled}
            onContentSizeChange={onContentSizeChange}
        >
            <View style={styles.container}>
                {visible ?
                    <Animatable.View
                        animation="fadeInDown"
                        style={{
                            backgroundColor: 'white',
                            padding: 10,
                            elevation: 5
                        }}>
                        <Text style={styles.banner_text}>{quiz.get_question(index).explanation}</Text>
                    </Animatable.View> : null}


                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 10,
                        paddingHorizontal: 10,
                        paddingBottom: 15
                    }}>
                    <View style={styles.row}>
                        <MaterialCommunityIcons
                            name='card-text'
                            size={20}
                            color='grey'
                            style={{ marginRight: 3 }} />
                        <Text style={styles.header_text}>
                            <Text style={{ fontWeight: 'bold' }}>{index + 1}</Text>
                              /
                             {quiz.get_questions_number()}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.header_text}>{quiz.get_remaining_time(index)}</Text>
                        <MaterialCommunityIcons
                            name='timer-sand'
                            size={20}
                            color='grey'
                            style={{ marginLeft: 3 }} />
                    </View>
                </View>



                <Animatable.Text
                    ref={title}
                    animation="fadeInRight"
                    duration={1500}
                    style={{ paddingHorizontal: 10 }}>
                    <Title style={styles.question}>{quiz.get_question(index).title}</Title>
                </Animatable.Text>

                <Animatable.View
                    ref={choices_animation}
                    animation="fadeIn"
                    duration={1500}
                    delay={250}
                    style={{ paddingTop: 3 }}>
                    <FlatList
                        data={quiz.get_question(index).choices.filter(ch => ch != '-')}
                        extraData={quiz.get_question(index).choices.filter(ch => ch != '-')}
                        renderItem={({ item }) => {
                            return (
                                <View
                                    key={item}
                                    style={{
                                        marginVertical: 3,
                                        marginHorizontal: 5,
                                    }}>
                                    <Surface style={{
                                        backgroundColor: hasAnswered && quiz.get_question(index).is_right(item) ? colors.success : 'white',
                                        borderWidth: 1,
                                        borderColor: '#D7D8D2',
                                        elevation: 2,
                                    }}>
                                        <Pressable
                                            onPress={() => check_answer(item)}
                                            android_ripple={{ color: quiz.get_question(index).is_right(item) ? colors.success : colors.error, borderless: false }}
                                            style={{
                                                alignItems: 'center',
                                                padding: 15
                                            }}>
                                            <Subheading style={styles.choice} >
                                                {item}
                                            </Subheading>
                                        </Pressable>
                                    </Surface>
                                </View>
                            )
                        }}
                    />
                </Animatable.View>

            </View>

            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%'
                }}>
                {is_custom_exam() ?
                    <IconButton
                        icon={inBookmark ? 'bookmark' : 'bookmark-off'}
                        size={34}
                        color={inBookmark ? 'gold' : 'grey'}
                        style={{
                            alignSelf: 'flex-start',
                            position: 'absolute',
                            paddingLeft: 20
                        }}
                        onPress={() => add_to_bookmarks({
                            question: quiz.get_question(index),
                            explanation: quiz.get_question(index).explanation,
                            subject: quiz.subject
                        })} /> : null}

                <Text style={{
                    fontFamily: 'Cairo_600SemiBold',
                    alignSelf: 'center',
                    color: 'grey',
                    fontSize: 11
                }}>بلســـم</Text>
                <Footer />
            </View>
        </ScrollView >
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    question: {
        textAlign: 'justify',
        marginVertical: 2,
        fontFamily: 'Cairo_700Bold',
        fontSize: 18,
        paddingHorizontal: 10,
        selectable: false,
        paddingBottom: 5,
        marginBottom: 5
    },
    banner_text: {
        fontFamily: 'Cairo_600SemiBold',
        textAlign: 'justify',
        selectable: false
    },
    choice: {
        textAlign: 'justify',
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 17,
        letterSpacing: 0,
        selectable: false
    },
    surface: {
        borderWidth: 1,
        borderColor: '#D7D8D2'
    },
    footer: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'flex-start'
    },
    scrollview: {
        flexGrow: 1,
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    header_text: {
        color: 'grey',
        fontSize: 16,
        fontFamily: 'Cairo_400Regular'
    }
})