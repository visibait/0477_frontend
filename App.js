import { useState, useCallback, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as SplashScreen from "expo-splash-screen";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [fontsLoaded] = useFonts({
    Montserrat: require("./assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Light": require("./assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
  });

  const animation = useRef(new Animated.Value(0)).current;
  const footerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const [ticketName, setTicketName] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [ticketStatusBool, setTicketStatusBool] = useState(false);
  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    const ticketId = data.replace("0477GROUP:", "");

    try {
      const response = await fetch(
        "https://0477backend-production.up.railway.app/api/tickets/redeem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticketId: ticketId,
          }),
        }
      );
      const result = await response.json();
      animation.setValue(400);

      if (result.success) {
        const { fullName, ticketType } = result;

        setTicketName(fullName);
        setTicketType(ticketType);
        setTicketStatus("VALIDATED ✅");
        setTicketStatusBool(true);
        Animated.timing(footerAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        setTicketName("");
        setTicketType("");
        setTicketStatus(`INVALID TCKT ❌ - ${result.message}`);
        setTicketStatusBool(false);
      }

      Animated.timing(footerAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.log("error: ", error);
    }
  };

  useEffect(() => {
    animateLine();
  }, []);

  const animateLine = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || hasPermission === null) {
    return null; // Return null or a loading indicator while the fonts are being loaded or permission is being requested
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.mainContainer} onLayout={onLayoutRootView}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.scannerOverlayContainer}>
        <Text style={styles.scannerOverlayText}>
          {scanned ? "Scanned!" : "Scanning..."}
        </Text>

        <Text style={styles.brandingText}>#0477GROUP</Text>

        <TouchableOpacity
          style={styles.scannerOverlayButton}
          onPress={() => {}}
        >
          <Feather name="search" size={25} color="#fff" />
        </TouchableOpacity>

        <View style={styles.scannerOverlay}>
          <View style={styles.topLeftCorner} />
          <View style={styles.topRightCorner} />
          <View style={styles.bottomLeftCorner} />
          <View style={styles.bottomRightCorner} />
          <Animated.View
            style={[
              styles.scannerAnimatedLine,
              {
                transform: [
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 400],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.scannerOverlayFooterContainer,
            {
              transform: [
                {
                  translateY: footerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [95, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.scannerOverlayFooter}>
            <View>
              {ticketStatusBool ? (
                <Text style={styles.scannerOverlayTicketStatus}>
                  {ticketStatus}
                </Text>
              ) : (
                <Text style={styles.scannerOverlayTicketStatusInvalid}>
                  {ticketStatus}
                </Text>
              )}
              <Text style={styles.scannerOverlayTicketEventName}>
                {ticketType}
              </Text>
              <Text style={styles.scannerOverlayTicketName}>{ticketName}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkIconContainer,
                ticketStatusBool
                  ? styles.checkIconContainerValid
                  : styles.checkIconContainerInvalid,
              ]}
              onPress={() => {
                setScanned(false);
                animateLine();
                Animated.timing(footerAnimation, {
                  toValue: 0,
                  duration: 500,
                  useNativeDriver: true,
                }).start();
              }}
            >
              {ticketStatusBool ? (
                <Ionicons name="checkmark-sharp" size={25} color="#fff" />
              ) : (
                <Ionicons name="close-sharp" size={25} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scannerOverlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerOverlayText: {
    position: "absolute",
    color: "#fff",
    fontSize: 30,
    fontFamily: "Montserrat-SemiBold",
    top: 150,
  },
  brandingText: {
    position: "absolute",
    color: "#fff",
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    top: 60,
  },
  scannerOverlayButton: {
    position: "absolute",
    top: 60,
    right: 15,
  },
  scannerOverlay: {
    width: 300,
    height: 400,
    alignSelf: "center",
    borderRadius: 25,
    overflow: "hidden",
  },
  topLeftCorner: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#FFFFFF",
    borderTopLeftRadius: 50,
  },
  topRightCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: "#FFFFFF",
    borderTopRightRadius: 50,
  },
  bottomLeftCorner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#FFFFFF",
    borderBottomLeftRadius: 50,
  },
  bottomRightCorner: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: "#FFFFFF",
    borderBottomRightRadius: 50,
  },
  scannerAnimatedLine: {
    position: "absolute",
    left: 0,
    width: 300,
    height: 2,
    backgroundColor: "#FFFFFF",
  },
  scannerOverlayFooterContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 95,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  scannerOverlayFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  scannerOverlayTicketStatus: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#000",
  },
  scannerOverlayTicketStatusInvalid: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#000",
    marginTop: 25,
  },
  scannerOverlayTicketEventName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: "#000",
  },
  scannerOverlayTicketName: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: "#000",
  },
  checkIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIconContainerValid: {
    backgroundColor: "#00C853",
  },
  checkIconContainerInvalid: {
    backgroundColor: "#D50000",
  },
});
