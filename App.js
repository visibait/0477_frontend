import React, { useCallback } from "react";
import { View, StyleSheet, LogBox } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./screens/HomeScreen";
import SearchScreen from "./screens/SearchScreen";

LogBox.ignoreLogs(["Sending `onAnimatedValueUpdate` with no listeners registered.",]);

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
const StackTheme = {
  dark: true,
  colors: {
    primary: "#080808",
    background: "#080808",
    card: "#080808",
    text: "#fff",
    border: "#080808",
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
    "SlipStream": require("./assets/fonts/Slipstream.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer theme={StackTheme}>
      <View style={styles.appContainer} onLayout={onLayoutRootView}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
