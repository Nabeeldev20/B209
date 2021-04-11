import 'react-native-gesture-handler';
import React from 'react';
import { I18nManager, StyleSheet, } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import HomeStack from './screens/HomeStack';
import CustomExam from './screens/CustomExam';
import CustomDrawer from './screens/CustomDrawer';
import Subject from './screens/Subject';
import Bookmarks from './screens/Bookmarks';






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

  return (
    <PaperProvider
      theme={theme}
      settings={{
        icon: props => <MaterialCommunityIcons {...props} />,
      }}>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawer {...props} />}
          drawerType='slide'
          drawerContentOptions={{
            activeTintColor: '#e91e63',
            itemStyle: { marginVertical: 3, padding: 0 },
          }}>

          <Drawer.Screen name="Home" component={HomeStack} />
          <Drawer.Screen name="CustomExam" component={CustomExam} />
          <Drawer.Screen name="Bookmarks" component={Bookmarks} />
          <Drawer.Screen name="Subject" component={Subject} />


        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
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
    fontFamily: 'Cairo-Bold',
    fontSize: 35,
    padding: 10,
    paddingBottom: 3
  },
  headline: {
    fontFamily: 'Cairo-Bold',
    fontSize: 21,
    paddingBottom: 20
  },
  text: {
    fontFamily: 'Cairo-SemiBold',
    color: 'grey'
  },
  button: {
    letterSpacing: 0,
    fontFamily: 'Cairo-Bold'
  }
})