import 'react-native-gesture-handler';
import React from 'react';
import { I18nManager, PermissionsAndroid, NativeModules } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DateTime } from 'luxon';
import Hashids from 'hashids';
import Octicons from 'react-native-vector-icons/Octicons';
import CryptoJS from 'crypto-js';
import { FileSystem } from 'react-native-file-access';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Home from './screens/Home'
import SubjectStack from './screens/SubjectStack'
import CustomExam from './screens/CustomExam'
import CustomDrawer from './screens/CustomDrawer'
import { update_bookmarks, get_database, update_database, update_act, get_act } from './screens/db'


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
  const h = new Hashids("nabeel adnan ali nizam", 12, "abcdefghijklmnopqrstuvwxyz123456789");
  const [loading, setLoading] = React.useState(true);

  function ask_for_permission() {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE)
  }
  async function check_for_permission() {
    const statue = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    return statue;
  }



  if (check_for_permission()) {
    React.useEffect(() => {
      function decode_file(file) {
        let bytes = CryptoJS.AES.decrypt(file, 'nabeeladnanalinizam_20900!@#()');
        return bytes.toString(CryptoJS.enc.Utf8);
      }
      function set_last_time(file) {
        if (file.last_time == null) {
          file.last_time = DateTime.now().toISODate();
        }
      }
      function handle_paid(file) {
        let codes = []
        get_act().forEach(item => {
          codes = [...codes, item.code]
        })
        if (codes.includes(file.code) == false) {
          update_act([...get_act(), {
            code: file.code,
            en: h.encode(Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000),
            valid: false
          }])
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

                if (file_output.is_paid()) {
                  handle_paid(file_output)
                }
                update_database([...get_database(), file_output])
              }
            } catch (error) {
            }
          }
        } catch (error) {

        }
      }
      async function get_async_storage() {
        try {
          values = await AsyncStorage.multiGet(['@act', '@bookmarks']);
          if (values != null) {
            update_act(JSON.parse(decode_file(values[0][1])));
            update_bookmarks(JSON.parse(decode_file(values[1][1])))
          } else {
            const act = ["@act", CryptoJS.AES.encrypt(JSON.stringify([]), 'nabeeladnanalinizam_20900!@#()').toString()]
            const bookmarks = ["@bookmarks", CryptoJS.AES.encrypt(JSON.stringify([]), 'nabeeladnanalinizam_20900!@#()').toString()]
            try {
              await AsyncStorage.multiSet([act, bookmarks])
            } catch (e) {
            }
          }
        } catch (error) {
        }
      }

      get_async_storage();
      get_data();
      setLoading(false);
    }, [])
  }



  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>loading</Text>
        <Text onPress={() => ask_for_permission()}>ask for PERMISSIONS</Text>
      </View>
    )
  } else {
    return (
      <PaperProvider
        theme={theme}
        settings={{
          icon: props => <Octicons {...props} />,
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
