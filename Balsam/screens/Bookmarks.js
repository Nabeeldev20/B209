/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ToastAndroid,
    ScrollView,
    Dimensions,
} from 'react-native';
import {
    Divider,
    Surface,
    Headline,
    Subheading,
    Button,
    IconButton,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStackNavigator } from '@react-navigation/stack';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';

import { app_database } from './db';

export default function Bookmarks({ navigation }) {
    const Stack = createStackNavigator();
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
    const [bookmarks, set_bookmarks] = React.useState(app_database.get_bookmarks);
    const [selected_subject, set_selected_subject] = React.useState('');

    useFocusEffect(
        React.useCallback(() => {
            set_bookmarks(app_database.get_bookmarks);
        }, []),
    );
    function bookmarks_component() {
        function SubjectsButtons() {
            function get_subjects() {
                let output = [];
                for (let i = 0; i < bookmarks.length; i++) {
                    output.push(bookmarks[i].subject);
                }
                return [...new Set(output)];
            }
            if (get_subjects().length === 1) {
                return null;
            }
            return (
                <Surface
                    style={{
                        margin: 4,
                        elevation: 1,
                        padding: 3,
                        borderWidth: 1,
                        borderColor: '#d7d8d2',
                    }}>
                    <Subheading
                        style={{
                            fontFamily: 'Cairo-Bold',
                            color: '#343434',
                            padding: 5,
                        }}>
                        المقررات
          </Subheading>
                    <FlatList
                        data={get_subjects()}
                        extraData={get_subjects()}
                        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
                        renderItem={({ item }) => {
                            return (
                                <Button
                                    labelStyle={{
                                        letterSpacing: 0,
                                        fontFamily: 'Cairo-SemiBold',
                                        fontSize: 14,
                                    }}
                                    compact
                                    style={{ margin: 3 }}
                                    mode={selected_subject === item ? 'contained' : 'outlined'}
                                    onPress={() => set_selected_subject(item)}>
                                    {item}
                                </Button>
                            );
                        }}
                    />
                </Surface>
            );
        }
        function BookmarksList() {
            function get_selected_bookmarks() {
                if (selected_subject === '') {
                    return bookmarks;
                }
                return bookmarks.filter(b => b.subject === selected_subject);
            }
            return (
                <FlatList
                    data={get_selected_bookmarks()}
                    renderItem={({ item }) => {
                        return (
                            <Surface
                                style={{
                                    margin: 4,
                                    elevation: 1,
                                    padding: 5,
                                    borderWidth: 1,
                                    borderColor: '#d7d8d2',
                                }}>
                                <Headline style={styles.headline}>
                                    {item.title}
                                    {selected_subject === '' ? (
                                        <Text style={styles.text}> ({item.subject}) </Text>
                                    ) : null}
                                </Headline>
                                <Divider />
                                <View style={{ padding: 4 }}>
                                    {item.choices
                                        .filter(choice => choice !== '-')
                                        .map(choice => {
                                            return (
                                                <Text
                                                    style={[
                                                        styles.text,
                                                        {
                                                            color:
                                                                choice === item.right_answer
                                                                    ? 'green'
                                                                    : '#616161',
                                                            fontFamily:
                                                                choice === item.right_answer
                                                                    ? 'Cairo-Bold'
                                                                    : 'Cairo-SemiBold',
                                                        },
                                                    ]}
                                                    key={choice}>
                                                    {choice}
                                                </Text>
                                            );
                                        })}
                                </View>
                                {item.explanation.length > 2 ? (
                                    <View>
                                        <Divider />
                                        <Text style={styles.text}>
                                            الشرح: {'\n'} {item.explanation}
                                        </Text>
                                    </View>
                                ) : null}
                                <IconButton
                                    icon="bookmark-remove"
                                    size={24}
                                    color="#EF5350"
                                    onPress={() => remove_bookmark(item)}
                                    style={{ alignSelf: 'flex-end' }}
                                />
                            </Surface>
                        );
                    }}
                />
            );
        }
        function NoBookmarks() {
            return (
                <Animatable.View
                    animation="fadeIn"
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        width: '100%',
                    }}>
                    <MaterialCommunityIcons
                        name="bookmark-plus"
                        color="grey"
                        size={50}
                        style={{ marginLeft: 5 }}
                    />
                    <Text style={{ fontFamily: 'Cairo-Bold', color: 'grey' }}>
                        محفوظات؟ جرّب إضافتها أثناء حل الاختبار
          </Text>
                </Animatable.View>
            );
        }
        function remove_bookmark(removed_bookmark) {
            function save_to_bookmarks() {
                try {
                    app_database.save_blsm();
                } catch (error) {
                    ToastAndroid.showWithGravity(
                        'Error#009',
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM,
                    );
                }
            }
            let updated_bookmarks = [
                ...new Set(
                    bookmarks.filter(item => item.title !== removed_bookmark.title),
                ),
            ];

            set_bookmarks(updated_bookmarks);
            app_database.update_bookmarks = updated_bookmarks;
            save_to_bookmarks();
        }
        return (
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                scrollEnabled={scrollEnabled}
                onContentSizeChange={onContentSizeChange}>
                <View style={styles.container}>
                    {bookmarks.length > 0 ? (
                        <View>
                            <SubjectsButtons />
                            <BookmarksList />
                        </View>
                    ) : (
                            <NoBookmarks />
                        )}
                </View>
            </ScrollView>
        );
    }
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { height: 50 } }}>
            <Stack.Screen
                name="Bookmarks"
                component={bookmarks_component}
                options={{
                    title: 'المحفوظات',
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
    surface: {
        padding: 5,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#D7D8D2',
        margin: 3,
    },
    headline: {
        fontFamily: 'Cairo-Bold',
        fontSize: 16,
        selectable: false,
        padding: 4,
    },
    text: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 14,
        paddingVertical: 4,
        selectable: false,
        color: '#616161',
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 4,
    },
});
