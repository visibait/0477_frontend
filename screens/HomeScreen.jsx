import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  Vibration,
  View,
  Animated,
  TouchableOpacity,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

const HomeScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [sound, setSound] = useState(null);

  const animation = useRef(new Animated.Value(0)).current;
  const footerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/scan.mp3")
      );
      setSound(sound);
    };

    loadSound();

    return () => {
      // Unload the sound when the component unmounts
      sound && sound.unloadAsync();
    };
  }, []);

  const [ticketName, setTicketName] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [ticketStatusBool, setTicketStatusBool] = useState(false);
  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);

    // Play the sound and vibrate the phone
    sound && sound.replayAsync();
    Vibration.vibrate();

    const ticketId = data.replace("0477GROUP:", "");

    try {
      const response = await fetch(
        "https://tickets-0477-f41cae969513.herokuapp.com/api/tickets/redeem",
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

  if (hasPermission === null) {
    return null;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.mainContainer}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.scannerOverlayContainer}>
        <Text style={styles.scannerOverlayText}>
          {scanned ? "Scanned!" : "Scanning..."}
        </Text>

        <Text style={styles.brandingText}>0477 GROUP</Text>

        <TouchableOpacity
          style={styles.scannerOverlayButton}
          onPress={() => {
            navigation.navigate("Search");
          }}
        >
          <Feather name="search" size={20} color="#fff" />
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
};

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
    fontFamily: "SlipStream",
    letterSpacing: -3,
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

export default HomeScreen;
