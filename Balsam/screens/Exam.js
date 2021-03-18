import * as React from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList } from 'react-native'
import { Title, TouchableRipple, Surface, Subheading, IconButton, useTheme } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { get_bookmarks, update_bookmarks, get_database, save_file } from './db'

let database = get_database();

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
                <Animatable.View ref={footer_animation} animation="fadeInUp" duration={1500}>
                    <TouchableRipple
                        onPress={move_to_next_question}
                        rippleColor="rgba(0, 0, 0, .32)"
                        style={{ width: '100%' }}
                    >
                        <Surface style={[styles.footer, styles.surface, { padding: 15, alignItems: 'center', width: '100%' }]}>
                            <Text style={{ fontFamily: 'Cairo_700Bold', fontSize: 18 }}>
                                {index == quiz.get_questions_number() - 1 ? 'عرض النتيجة' : 'السؤال التالي'}
                            </Text>
                        </Surface>
                    </TouchableRipple>
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
        if (index == quiz.get_questions_number() - 1) {
            navigation.replace('FinishScreen', { quiz, wrong_count: wrongAnswersCount, exam_time })
        }
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
    const add_to_bookmarks = (bookmark) => {
        if (inBookmark) {
            update_bookmarks(get_bookmarks().filter(bookmark => bookmark.question.title != bookmark.question.title))
            setInBookmark(false)
        } else {
            update_bookmarks([...get_bookmarks(), bookmark]);
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
                        quiz.index = index;
                        save_file(quiz);
                    }
                })
            }, [index])

        }
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
                    <Animatable.View animation="fadeInDown" style={{
                        backgroundColor: 'white',
                        padding: 10,
                        elevation: 3
                    }}>

                        <Text style={styles.banner_text}>{quiz.get_question(index).explanation}</Text>
                    </Animatable.View> : null}


                <View style={[styles.row, { justifyContent: 'space-between', marginTop: 10, marginHorizontal: 10 }]}>
                    <View style={styles.row}>
                        <MaterialCommunityIcons style={{ marginRight: 3 }} name='card-text' size={16} color='grey' />

                        <Text style={styles.header_text}>
                            {index + 1}
                        :
                        {quiz.get_questions_number()}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.header_text}>{quiz.get_remaining_time(index)}</Text>
                        <MaterialCommunityIcons style={{ marginLeft: 3 }} name='timer-sand' size={16} color='grey' />
                    </View>
                </View>
                <Animatable.Text ref={title} animation="fadeInRight" duration={1500} style={{ paddingHorizontal: 5 }}>
                    <Title style={styles.question}>{quiz.get_question(index).title}</Title>
                </Animatable.Text>

                <Animatable.View style={{ marginTop: 3 }} ref={choices_animation} animation="fadeIn" duration={1500} delay={250}>
                    <FlatList
                        data={quiz.get_question(index).choices.filter(ch => ch != '-')}
                        extraData={quiz.get_question(index).choices.filter(ch => ch != '-')}
                        renderItem={({ item }) => {
                            return (
                                <TouchableRipple
                                    key={item}
                                    rippleColor={quiz.get_question(index).is_right(item) ? colors.success : colors.error}
                                    onPress={() => check_answer(item)}
                                    style={{ marginVertical: 3, marginHorizontal: 5 }}
                                >
                                    <Surface
                                        style={[styles.surface, { backgroundColor: hasAnswered && quiz.get_question(index).is_right(item) ? colors.success : 'white' }]}>
                                        <Subheading style={styles.choice} >
                                            {item}
                                        </Subheading>
                                    </Surface>
                                </TouchableRipple>
                            )
                        }}
                    />
                </Animatable.View>

            </View>

            <View>
                <View style={{ flexDirection: 'row', width: '55%', justifyContent: quiz.title.includes('مخصص') ? 'flex-end' : 'space-between' }}>
                    {!quiz.title.includes('مخصص') ?
                        <IconButton
                            icon={inBookmark ? 'bookmark' : 'bookmark-slash'}
                            color={inBookmark ? 'gold' : 'grey'}
                            size={30}
                            onPress={() => add_to_bookmarks({
                                question: quiz.get_question(index),
                                explanation: quiz.get_question(index).explanation,
                                subject: quiz.subject
                            })}
                            style={{ justifyContent: 'flex-start' }}
                        /> : null}
                    <Text style={styles.branding}>بلســـم</Text>
                </View>
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
        padding: 5,
        marginLeft: 3,
        letterSpacing: 0,
        selectable: false
    },
    surface: {
        padding: 5,
        elevation: 1,
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
    branding: {
        fontFamily: 'Cairo_600SemiBold',
        alignSelf: 'center',
        justifyContent: 'center',
        color: 'grey',
        fontSize: 12
    },
    header_text: {
        color: 'grey',
        fontSize: 16,
        fontFamily: 'Cairo_400Regular'
    }
})