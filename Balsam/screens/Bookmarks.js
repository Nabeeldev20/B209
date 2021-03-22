import * as React from 'react'
import { View, Text, StyleSheet, FlatList, Button } from 'react-native'
import { Divider, Surface, Headline, IconButton } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

import { get_bookmarks, update_bookmarks, save_blsm } from './db'


export default function Bookmarks({ navigation, route }) {
    let { subject_name } = route.params;

    React.useEffect(() => {
        navigation.setOptions({ title: 'محفوظات' + ' ' + subject_name })
    }, [subject_name])

    const [bookmarksData, setBookmarksData] = React.useState(get_bookmarks().filter(bookmark => bookmark.subject == subject_name))

    const QuestionExplanation = (item) => {
        if (item.question.has_explanation()) {
            return (
                <View>
                    <Divider />
                    <View style={styles.row}>
                        <MaterialCommunityIcons style={{ marginRight: 4 }} name='comment-question' color='grey' size={20} />
                        <Text style={styles.text}>{item.question.explanation}</Text>
                    </View>
                </View>
            )
        }
        return null
    }
    const remove_Bookmark = (item) => {
        setBookmarksData(bookmarksData.filter(bookmark => bookmark.question.title != item.question.title))
        update_bookmarks(bookmarksData.filter(bookmark => bookmark.question.title != item.question.title));
        save_blsm()
    }
    const empty_state = () => {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: '25%' }}>
                <MaterialCommunityIcons name='bookmark-plus' size={40} color='grey' />
                <Text style={styles.text}>جرّب إضافة سؤال للمحفوظات أثناء الحل</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={bookmarksData}
                extraData={bookmarksData}
                ListEmptyComponent={empty_state}
                keyExtractor={(item) => item.question.title}
                renderItem={({ item, index }) => (
                    <Animatable.View animation="fadeInRight" delay={index * 350} duration={1500}>
                        <Surface style={styles.surface}>
                            <View style={styles.row} >
                                <MaterialCommunityIcons style={{ marginRight: 4 }} name='comment-question' color='grey' size={20} />
                                <Headline style={styles.headline}>{item.question.title}
                                    <Text style={styles.text}>({item.subject})</Text></Headline>
                            </View>
                            <Divider />
                            {item.question.choices.filter(choice => choice != '-').map(choice => {
                                return (
                                    <Text
                                        style={[styles.text, { color: item.question.is_right(choice) ? 'green' : 'grey' }]}
                                        key={choice}
                                    >{choice}</Text>
                                )
                            })}
                            {QuestionExplanation(item)}
                            <IconButton
                                icon='bookmark-remove'
                                size={24}
                                color='grey'
                                onPress={() => remove_Bookmark(item)}
                                style={{ alignSelf: 'flex-end' }}
                            />
                        </Surface>
                    </Animatable.View>
                )}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        padding: 5,
    },
    surface: {
        padding: 5,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#D7D8D2',
        margin: 3
    },
    headline: {
        fontFamily: 'Cairo-Bold',
        fontSize: 16,
        selectable: false,
        padding: 3,
        textAlign: 'flex-start'
    },
    text: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 14,
        selectable: false,
        padding: 3,
        paddingHorizontal: 5,
        marginHorizontal: 5,
        color: 'grey'
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 4
    }
})