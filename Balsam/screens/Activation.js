import * as React from 'react'
import { View, Text, StyleSheet, Linking } from 'react-native'
import { Surface, TextInput, HelperText, Badge, Button } from 'react-native-paper'
import * as Animatable from 'react-native-animatable';
import { useFonts, Cairo_700Bold, Cairo_600SemiBold, Cairo_400Regular, Cairo_900Black } from '@expo-google-fonts/cairo'
import { Octicons } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import Hashids from 'hashids'
import { DateTime } from 'luxon'
import { get_act, update_act } from './db'

export default function Activation({ navigation, route }) {
    const h = new Hashids("nabeel adnan ali nizam", 12, "abcdefghijklmnopqrstuvwxyz123456789");
    const { subject_name, code } = route.params;
    React.useEffect(() => {
        navigation.setOptions({ title: 'تفعيل بنك' + ' ' + subject_name })
    }, [subject_name])
    let [fontsLoaded] = useFonts({
        Cairo_700Bold,
        Cairo_600SemiBold,
        Cairo_400Regular
    });
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
    function get_ID() {
        for (let i = 0; i < get_act().length; i++) {
            if (get_act()[i].code == code) {
                return {
                    en: get_act()[i].en,
                    index: i
                }
            }
        }
    }
    function copy() {
        Clipboard.setString(`
        Balsam: @Balsam_dev || ${DateTime.now().toISODate()}
        ${storeCode}
        --
        ${get_ID().en}
        --
        شكراً لك 
    `);
    }
    function is_input_valid_animation() {
        let d = h.decode(get_ID().en)
        if (d.length > 0 && d == keyCode) {
            act_button.current?.tada();
        }
    }
    function save() {
        get_act()[get_ID().index].valid = true;
        update_act(get_act());
    }
    is_input_valid_animation();

    return (
        <View style={styles.container}>
            <Text style={styles.welcome}> ثلاث خطوات بسيطة لتفعيل البنك</Text>
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
                        left={<TextInput.Icon name={() => <Octicons name='organization' size={20} />} />}
                    />
                    <HelperText style={{ fontFamily: 'Cairo_400Regular' }} type="error" visible={hasErrors()}>كود المكتبة مكوّن من 12 خانة</HelperText>
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
                        <Text style={{ fontFamily: 'Cairo_700Bold' }}> {subject_name} </Text>
                         من فضلك
                        {'\n'} <Text style={{ fontFamily: 'Cairo_700Bold' }}> ثمَّ</Text> أرسل رسالة عن طريق
                        <View style={[styles.row, { paddingHorizontal: 5 }]}>
                                <Text style={styles.link} onPress={() => Linking.openURL('https://t.me/Balsam_dev')}>@Balsam_dev</Text>
                                <Octicons name='cross-reference' size={16} />
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
                            icon='copy'
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
                        value={keyCode}
                        dense
                        onChangeText={text => setKeyCode(text)}
                        left={<TextInput.Icon name={() => <Octicons name='key' size={20} />} />}
                    />
                    <Animatable.View ref={act_button} style={{ paddingTop: 5 }}>
                        <Button
                            mode='contained'
                            labelStyle={styles.button}
                            color='#00C853'
                            icon='lock'
                            disabled={keyCode != h.decode(get_ID().en)}
                            contentStyle={{ flexDirection: 'row-reverse' }}
                            onPress={() => save()}>
                            تفعيل البنك
                </Button>
                    </Animatable.View>
                </Surface>
            </Animatable.View >
        </View >
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
        fontFamily: 'Cairo_700Bold',
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
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 15,
        textAlign: 'left'
    },
    welcome: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 18,
        color: 'grey'
    },
    link: {
        paddingHorizontal: 5,
        fontFamily: 'Cairo_700Bold'
    }
})