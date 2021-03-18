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
    'Changa_Bold': require('./assets/fonts/Changa-Bold.ttf'),
    'Changa_SemiBold': require('./assets/fonts/Changa-SemiBold.ttf'),
  });
  const [loading, setLoading] = React.useState(true);
  const [hasPermissons, setHasPermissons] = React.useState(false)
  async function ask_for_permission() {
    try {
      const has_premissons = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE]);
      update_error_msgs({ Code: 'asking for permission', has_premissons })
      if (has_premissons.android.permission.READ_EXTERNAL_STORAGE == 'granted') {
        setHasPermissons(true)
      } else {
        setHasPermissons(false)
      }
    } catch (error) {
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
    async function get_data() {
      try {
        let paths = await Storage.get_files_paths();
        for (let i = 0; i < paths.length; i++) {
          try {
            let file = await FileSystem.readFile(paths[i]);
            let decoded_file = decode_file(file);

            if (decoded_file.length > 0) {
              let file_output = JSON.parse(decoded_file);
              file_output.path = paths[i];
              set_last_time(file_output);
              update_database([...get_database(), file_output])
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
    ask_for_permission()
    if (hasPermissons) {
      get_data();
      setLoading(false);
    }
  }, [hasPermissons])




  if (loading) {
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
          <Button style={{ padding: 5 }} labelStyle={styles.button} color='#313131' onPress={ask_for_permission}>الحصول على صلاحية الوصول للذاكرة</Button>
        </Animatable.View>
      </View>
    )
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
    fontFamily: 'Changa_Bold',
    fontSize: 35,
    padding: 10,
    paddingBottom: 3
  },
  headline: {
    fontFamily: 'Changa_Bold',
    fontSize: 21,
    paddingBottom: 20
  },
  text: {
    fontFamily: 'Changa_SemiBold',
    color: 'grey'
  },
  button: {
    letterSpacing: 0,
    fontFamily: 'Changa_Bold'
  }
})