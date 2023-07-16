import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const width = Dimensions.get("window").width;

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketList, setTicketList] = useState([]);

  const loadTickets = async () => {
    try {
      const response = await fetch(
        "https://0477backend-production.up.railway.app/api/tickets/all"
      );
      const result = await response.json();

      if (result.success) {
        const { tickets } = result;

        const newTicketList = Object.keys(tickets).map((ticketId) => {
          const { _id, fullName, redeemed } = tickets[ticketId];
          const ticketStatus = redeemed ? "ALREADY REDEEMED ❌" : "VALID ✅";

          return {
            id: _id,
            name: fullName,
            status: ticketStatus,
            redeemed,
          };
        });

        setTicketList(newTicketList);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const redeemTicket = async (ticketId) => {
    if (!ticketId) return;
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

      if (result.success) {
        alert("Ticket redeemed succesfully!");
        return loadTickets();
      }

      alert("Error redeeming ticket!");
      return loadTickets();
    } catch (error) {
      alert("Error redeeming ticket!");
      return loadTickets();
    }
  };

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Search for tickets</Text>
      </View>
      <View style={styles.searchInputContainer}>
        <Feather
          name="search"
          size={20}
          color="#fff"
          style={styles.searchIcon}
        />
        <View style={styles.searchInput}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#C6CACD"
            color="#fff"
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <ScrollView>
        <View style={styles.ticketContainer}>
          {ticketList
            .filter((ticket) => {
              const query = searchQuery
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
              const ticketName = ticket.name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();

              return ticketName.includes(query);
            })
            .map((ticket, i) => {
              return (
                <View key={i} style={styles.ticket}>
                  <Text style={styles.ticketText}>{ticket.name} - </Text>
                  <Text style={styles.ticketText}>{ticket.status}</Text>

                  {!ticket.redeemed && (
                    <TouchableOpacity
                      style={styles.redeemButton}
                      onPress={() => {
                        redeemTicket(ticket.id);
                      }}
                    >
                      <Text style={styles.redeemButtonText}>Redeem</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 70,
    marginLeft: 10,
  },
  title: {
    fontFamily: "Montserrat-Medium",
    fontSize: 20,
    color: "#fff",
    marginLeft: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101010",
    borderRadius: 10,
    width: "95%",
    height: 40,
    marginTop: 10,
    alignSelf: "center",
  },
  searchIcon: {
    marginLeft: 10,
    marginRight: 10,
  },
  searchInput: {
    width: "92%",
    fontFamily: "Montserrat-Medium",
    fontSize: 13,
  },
  searchActivityContainer: {
    alignItems: "center",
    width: width,
  },
  ticketContainer: {
    alignSelf: "center",
    marginTop: 15,
    width: "90%",
  },
  ticket: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  ticketText: {
    fontFamily: "Montserrat-Medium",
    fontSize: 13,
    color: "#fff",
  },
  redeemButton: {
    backgroundColor: "#fff",
    borderRadius: 5,
    marginLeft: 10,
    padding: 5,
  },
  redeemButtonText: {
    fontFamily: "Montserrat-Medium",
    fontSize: 13,
    color: "#000",
  },
});

export default SearchScreen;
