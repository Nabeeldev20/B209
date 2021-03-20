import 'react-native-gesture-handler';
import React from 'react';
import { I18nManager, PermissionsAndroid, NativeModules, View, Text, StyleSheet } from 'react-native';
import { DefaultTheme, Provider as PaperProvider, Button } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DateTime } from 'luxon';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import CryptoJS from 'crypto-js';
import { FileSystem } from 'react-native-file-access';
import { useFonts } from 'expo-font';
import * as Animatable from 'react-native-animatable';

import Home from './screens/Home'
import SubjectStack from './screens/SubjectStack'
import CustomExam from './screens/CustomExam'
import CustomDrawer from './screens/CustomDrawer'
import { get_database, update_database, update_error_msgs } from './screens/db'


const { Storage } = NativeModules;


export default function App() {
  const Drawer = createDrawerNavigator()
  I18nManager.forceRTL(true)
  const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: '#616161',
      accent: '#1DE9B6',
      success: '#00C853',
      error: '#E53935',
      warning: '#FFCA28',
      info: '#2f7ac1'
    },
  };
  let [fontsLoaded] = useFonts({
    'Cairo_Bold': require('./assets/fonts/Cairo-Bold.ttf'),
    'Cairo_SemiBold': require('./assets/fonts/Cairo-SemiBold.ttf'),
  });
  const [loading, setLoading] = React.useState(true);
  const [shouldAskForPermissions, setShouldAskForPermissions] = React.useState(false)
  async function ask_for_permission() {
    try {
      const has_premissons = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE]);
      update_error_msgs({ Code: 'asking for permission', has_premissons })
      if (has_premissons['android.permission.READ_EXTERNAL_STORAGE'] == 'granted') {
        setShouldAskForPermissions(false)
      } else {
        setShouldAskForPermissions(true)
      }
    } catch (error) {
      update_error_msgs({ Code: 'asking for premission', error })
    }
  }




  React.useEffect(() => {
    function decode_file(file) {
      let bytes = CryptoJS.AES.decrypt(file, "nabeeladnanalinizam_20900!@#()");
      return bytes.toString(CryptoJS.enc.Utf8);
    }
    function set_last_time(file) {
      if (file.last_time == null) {
        file.last_time = DateTime.now().toISODate();
      }
    }
    function add_methods(file) {
      file.update_answered_wrong = function update_answered_wrong(new_data) {
        this.answered_wrong.push(new_data)
      }
      file.get_answered_wrong = function get_answered_wrong() {
        return this.answered_wrong
      }
      file.update_average_time = function update_average_time(new_time) {
        this.average_time.push(new_time)
      }
      file.get_average_time = function get_average_time() {
        if (this.average_time.length >= 1) {
          let math = Math.ceil(this.average_time.reduce((a, b) => a + b) / this.average_time.length);
          let time = (math / 60).toFixed(2).toString().split('');
          if (time.length == 4) {
            time.unshift('0')
            time[2] = ':'
            return time.join('')
          }
          time[2] = ':'
          return time.join('')
        }
        return 0
      }
      file.update_average_accuracy = function update_average_accuracy(new_score) {
        this.average_accuracy.push(new_score)
      }
      file.get_average_accuracy = function get_average_accuracy() {
        if (this.average_accuracy.length >= 1) {
          return Math.ceil(this.average_accuracy.reduce((a, b) => a + b) / this.average_accuracy.length)
        }
        return 0
      }
      file.is_paid = function is_paid() {
        return this.paid ? true : false
      }
      file.get_question = function get_question(index) {
        return this.questions[index]
      }
      file.get_estimated_time = function get_estimated_time() {
        let time = ((this.questions.length * this.estimated_time_for_question) / 60).toFixed(2).toString().split('');
        if (time.length == 4) {
          time.unshift('0')
          time[2] = ':'
          return time.join('')
        }
        time[2] = ':'
        return time.join('')
      }
      file.get_remaining_time = function get_remaining_time(index) {
        let time = (((this.questions.length - index) * this.estimated_time_for_question) / 60).toFixed(2).toString().split('');
        if (time.length == 4) {
          time.unshift('0')
          time[2] = ':'
          return time.join('')
        }
        time[2] = ':'
        return time.join('')
      }
      file.set_estimated_time_per_question = function set_estimated_time_per_question(time) {
        this.estimated_time_for_question = time
      }
      file.get_questions_number = function get_questions_number() {
        return this.questions.length
      }
      file.is_cycle = function is_cycle() {
        return this.cycle_university.length > 3 ? true : false;
      }
      file.get_shuffled_questions = function get_shuffled_questions(onlyQuestions = true, onlyChoices = true) {
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

      for (let i = 0; i < file.questions.length; i++) {
        const question = file.questions[i];
        question.set_explanation = function set_explanation(data) {
          this.explanation = data
        }
        question.set_answered_wrong = function set_answered_wrong(number) {
          this.answered_wrong += number
        }
        question.is_right = function is_right(d) {
          return d == this.right_answer ? true : false
        }
        question.has_explanation = function has_explanation() {
          return this.explanation.length > 3 ? true : false
        }
      }
    }
    async function get_data() {
      try {
        let paths = await Storage.get_files_paths();
        for (let i = 0; i < paths.length; i++) {
          try {
            let file = await FileSystem.readFile(paths[i]);
            let decoded_file = decode_file(file);

            if (decoded_file.length > 10) {
              let file_output = JSON.parse(decoded_file);
              file_output.path = paths[i];
              set_last_time(file_output);
              add_methods(file_output);
              update_database(file_output);
              update_error_msgs({ Code: 'File_output', file_output })
              update_error_msgs({ Code: 'database length', databaseLength: get_database().length })
            }
          } catch (error) {
            update_error_msgs({ Code: 'FileSystem.readFile', error })
          }
        }
      } catch (error) {
        update_error_msgs({ Code: 'Storage.get_files_paths', error })
      }
    }
    async function check_permission() {
      try {
        let check_permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        if (check_permission) {
          get_data();
          setLoading(false);
        } else {
          setShouldAskForPermissions(true)
        }
      } catch (error) {
        update_error_msgs({ Code: 'check permission code', error })
      }
    }
    check_permission()
  }, [shouldAskForPermissions])

  if (fontsLoaded) {
    if (loading) {
      if (shouldAskForPermissions == false) {
        return (
          <Animatable.View animation='flash' iterationCount='infinite' duration={3500} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
            <MaterialCommunityIcons name='folder-sync' size={35} color='grey' />
            <Text style={[styles.headline, { color: 'grey' }]} >جاري التحميل</Text>
          </Animatable.View>
        )
      } else {
        return (
          <View style={styles.container}>
            <Animatable.Text animation='fadeInRight' style={styles.welcome}>مرحباً يا بلسم!</Animatable.Text>
            <Animatable.Text animation='fadeInRight' delay={450} style={styles.headline}>تطبيق حل أسئلة صمم خصيصاً ليكون بلسماً لمشاكلك.</Animatable.Text>
            <Animatable.View animation='fadeIn' delay={700} style={{ paddingTop: 10 }}>
              <MaterialCommunityIcons name='lightbulb' size={20} color="grey" style={{ alignSelf: 'flex-start' }} />
              <Text style={styles.text}> ملفات اختبارات بلسم بلاحقة
          <Text style={{ fontWeight: 'bold', fontFamily: 'Cairo_700Bold', marginHorizontal: 10 }}>
                  quiz.
          </Text>{'\n'}
    يمكنك تحميل الملفات من قناتنا على التلغرام
    <MaterialCommunityIcons style={{ paddingHorizontal: 3 }} name='telegram' size={16} color='grey' /> <Text style={{ paddingLeft: 5 }}>@Balsam_app</Text>    {'\n'}
    تتم قراءة الملفات تلقائياً من مجلد التنزيلات
          <MaterialCommunityIcons style={{ paddingHorizontal: 5 }} name='folder-download' size={16} color='grey' /> {'\n'}

              </Text>
            </Animatable.View>
            <Animatable.View animation='fadeInUp' delay={1000}>
              <Button style={{ padding: 5 }} labelStyle={styles.button} color='#313131' onPress={() => ask_for_permission()}>الحصول على صلاحية الوصول للذاكرة</Button>
            </Animatable.View>
          </View>
        )
      }
    } else {
      return (
        <PaperProvider
          theme={theme}
          settings={{
            icon: props => <MaterialCommunityIcons {...props} />,
          }}>
          <NavigationContainer>
            <Drawer.Navigator
              initialRouteName="Home"
              drawerContent={(props) => <CustomDrawer {...props} />}
              drawerType='slide'
              drawerContentOptions={{
                activeTintColor: '#e91e63',
                itemStyle: { marginVertical: 3, padding: 0 },
              }}
            >
              <Drawer.Screen name="Home" component={Home} options={{ title: 'الرئيسة' }} />
              <Drawer.Screen name="SubjectStack" component={SubjectStack} />
              <Drawer.Screen name="CustomExam" component={CustomExam} />
            </Drawer.Navigator>
          </NavigationContainer>
        </PaperProvider>
      );
    }
  } else {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>

      </View>
    )
  }



}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    marginBottom: '2%'

  },
  welcome: {
    fontFamily: 'Cairo_Bold',
    fontSize: 35,
    padding: 10,
    paddingBottom: 3
  },
  headline: {
    fontFamily: 'Cairo_Bold',
    fontSize: 21,
    paddingBottom: 20
  },
  text: {
    fontFamily: 'Cairo_SemiBold',
    color: 'grey'
  },
  button: {
    letterSpacing: 0,
    fontFamily: 'Cairo_Bold'
  }
})