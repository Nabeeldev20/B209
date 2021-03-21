import * as React from 'react'
import { View, Text, StyleSheet, Linking, ToastAndroid, ScrollView, Dimensions } from 'react-native'
import { Surface, TextInput, HelperText, Badge, Button } from 'react-native-paper'
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import Hashids from 'hashids'
import Analytics from 'appcenter-analytics';
import { DateTime } from 'luxon'
import { get_act, update_act, get_cache_array, update_cache_array, save_blsm, get_mac, update_error_msgs, update_mac } from './db'
import * as Network from 'expo-network';

// TODO write to b.blsm
// TODO ask user to turn on their wifi if mac == null
// TODO show message 
export default function Activation({ navigation, route }) {
    const h = new Hashids("nabeel adnan ali nizam", 12, "abcdefghijklmnopqrstuvwxyz123456789");
    const { subject_name, code } = route.params;
    React.useEffect(() => {
        navigation.setOptions({ title: 'تفعيل بنك' + ' ' + subject_name })
    }, [subject_name]);
    const [screenHeight, setScreenHeight] = React.useState(Dimensions.get('window'));
    const { height } = Dimensions.get('window');
    const scrollEnabled = () => {
        return screenHeight > height ? true : false
    }
    const onContentSizeChange = (contentHeight) => {
        setScreenHeight(contentHeight);
    }

    const [storeCode, setStoreCode] = React.useState('');
    const [keyCode, setKeyCode] = React.useState('');
    const act_button = React.useRef(null);
    const n1 = React.useRef(null)
    const n2 = React.useRef(null)
    const n3 = React.useRef(null)

    React.useEffect(() => {
        if (n1 && n2 && n3) {
            n1.current?.fadeInRight()
            n2.current?.fadeInRight(1000)
            n3.current?.fadeInRight(1500)
        }
    }, [])

    function hasErrors() {
        if (storeCode.length > 0) return storeCode.length < 5;
        return false
    }

    function get_act_code() {
        function has_cache_code(quiz_code) {
            let data = get_cache_array()
            let output = []
            for (let i = 0; i < data.length; i++) {
                output.push(data[i].QuizCode)
            }
            if (output.includes(quiz_code)) return true
            return false
        }
        function generate_code() {
            function random_num(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            }
            return h.encode(random_num(1000000, 10000));
        }

        if (has_cache_code(code)) {
            return get_cache_array().find(item => item.QuizCode == code).HashCode
        } else {
            let new_code = {
                QuizCode: code,
                HashCode: generate_code()
            }
            update_cache_array([...get_cache_array(), new_code]);
            save_blsm()
            return new_code.HashCode
        }
    }
    function copy() {
        Clipboard.setString(`
        Telegram: @Balsam_dev || ${DateTime.now().toISODate()}
        ${storeCode}
        --
        ${get_act_code()} - ${code}
        --
        شكراً لك 
    `);
    }
    function is_input_valid_animation() {
        let d = h.decode(get_act_code())
        if (d.length > 0 && d == keyCode) {
            act_button.current?.tada();
        }
    }
    async function save() {
        //  Analytics.trackEvent('Activation', { Subject: subject_name, QuizCode: code, StoreCode: storeCode });
        try {
            let mac_address = await Network.getMacAddressAsync();
            if (mac_address != null) {
                ToastAndroid.showWithGravity(
                    mac_address,
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM
                );
            }
            ToastAndroid.showWithGravity(
                "test ;)",
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM
            );

        } catch (error) {
            update_error_msgs({ Code: 'Error fetching mac ', error })
        }
    }
    is_input_valid_animation();

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled={scrollEnabled}
            onContentSizeChange={onContentSizeChange}>
            <View style={styles.container}>
                <Text style={styles.welcome}> ثلاث خطوات بسيطة لتفعيل البنك</Text>
                <Text style={styles.text}>لكي يتم التفعيل بصورة صحيحة يجب تشغيل الـ wifi</Text>
                <Animatable.View ref={n1}>
                    <Surface style={styles.surface}>
                        <View style={styles.row}>
                            <View style={styles.badge}>
                                <Badge style={styles.badge_color} size={24} color='white'>1</Badge>
                            </View>
                            <Text style={styles.text}>أدخل كود المكتبة من فضلك:</Text>
                        </View>
                        <TextInput
                            type="flat"
                            value={storeCode}
                            dense
                            onChangeText={text => setStoreCode(text)}
                            left={<TextInput.Icon name={() => <MaterialCommunityIcons name='store' size={20} />} />}
                        />
                        <HelperText style={{ fontFamily: 'Cairo-Regular' }} type="error" visible={hasErrors()}>كود المكتبة مكوّن من 12 خانة</HelperText>
                    </Surface>

                </Animatable.View>



                <Animatable.View ref={n2} >
                    <Surface style={styles.surface}>
                        <View style={styles.row}>
                            <View style={styles.badge}>
                                <Badge style={styles.badge_color} size={24} color='white'>2</Badge>
                            </View>

                            <Text style={styles.text}>
                                انسخ كود بنك
                        <Text style={{ fontFamily: 'Cairo-Bold' }}> {subject_name} </Text>
                         من فضلك
                        {'\n'} <Text style={{ fontFamily: 'Cairo-Bold' }}> ثمَّ</Text> أرسل رسالة عن طريق
                        <View style={[styles.row, { paddingHorizontal: 5 }]}>
                                    <Text style={styles.link} onPress={() => Linking.openURL('https://t.me/Balsam_dev')}>@Balsam_dev</Text>
                                    <MaterialCommunityIcons name='telegram' size={16} />
                                </View>
                          على التلغرام لنرسل لك مفتاح التفعيل
                    </Text>

                        </View>
                        <Animatable.View
                            animation='flash'
                            delay={700}
                            style={{ width: "50%", alignSelf: 'center', padding: 5 }}>
                            <Button
                                mode='contained'
                                labelStyle={styles.button}
                                color='#B2EBF2'
                                icon='content-copy'
                                disabled={storeCode.length < 12}
                                contentStyle={{ flexDirection: 'row-reverse' }}
                                onPress={() => copy()}>نسخ الكود</Button>
                        </Animatable.View>
                    </Surface>
                </Animatable.View>


                <Animatable.View ref={n3}>
                    <Surface style={styles.surface}>
                        <View style={styles.row}>
                            <View style={styles.badge}>
                                <Badge style={styles.badge_color} size={24} color='white'>3</Badge>
                            </View>
                            <Text style={styles.text}>أدخل مفتاح التفعيل من فضلك: </Text>
                        </View>
                        <TextInput
                            mode="'outlined"
                            keyboardType='numeric'
                            value={keyCode}
                            dense
                            onChangeText={text => setKeyCode(text)}
                            left={<TextInput.Icon name={() => <MaterialCommunityIcons name='key' size={20} />} />}
                        />
                        <Animatable.View ref={act_button} style={{ paddingTop: 5 }}>
                            <Button
                                mode='contained'
                                labelStyle={styles.button}
                                color='#00C853'
                                icon='lock-open'
                                disabled={keyCode != h.decode(get_act_code())}
                                contentStyle={{ flexDirection: 'row-reverse' }}
                                onPress={() => save()}>
                                تفعيل البنك
                </Button>
                        </Animatable.View>
                    </Surface>
                </Animatable.View >
            </View >
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        padding: 5
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    button: {
        fontFamily: 'Cairo-Bold',
        letterSpacing: 0,
        height: 25
    },
    surface: {
        padding: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#D7D8D2',
        backgroundColor: 'white',
        margin: 3
    },
    badge: {
        margin: 5,
        padding: 3
    },
    badge_color: {
        backgroundColor: '#CFD8DC'
    },
    text: {
        fontFamily: 'Cairo-SemiBold',
        fontSize: 15,
        textAlign: 'left'
    },
    welcome: {
        fontFamily: 'Cairo-Bold',
        fontSize: 18,
        color: 'grey'
    },
    link: {
        paddingHorizontal: 5,
        fontFamily: 'Cairo-Bold'
    }
})