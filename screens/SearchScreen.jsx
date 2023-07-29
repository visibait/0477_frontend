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
        "https://tickets-0477-f41cae969513.herokuapp.com/api/tickets/all"
      );
      const result = await response.json();

      if (result.success) {
        const { tickets } = result;

        const newTicketList = Object.keys(tickets).map((ticketId) => {
          const { _id, fullName, redeemed } = tickets[ticketId];
          const ticketStatus = redeemed ? "ALREADY REDEEMED ❌" : "VALID ✅";

          return {
            id: _id,
            type: "ticket",
            name: fullName,
            status: ticketStatus,
            redeemed,
          };
        });

        const listResponse = await fetch(
          "https://tickets-0477-f41cae969513.herokuapp.com/api/list/all"
        );
        const listResult = await listResponse.json();

        if (listResult.success) {
          const { users } = listResult;

          // create the final list of tickets
          const newUserList = Object.keys(users).map((userId) => {
            const { _id, fullName, paid } = users[userId];
            const listStatus = paid ? "PAID ✅" : "NOT PAID ❌";

            return {
              id: _id,
              type: "list",
              name: fullName,
              status: listStatus,
              paid,
            };
          });

          const finalList = [...newTicketList, ...newUserList];
          setTicketList(finalList);
        }
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

  const userPaid = async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(
        "https://tickets-0477-f41cae969513.herokuapp.com/api/list/paid",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        alert("User paid succesfully!");
        return loadTickets();
      }

      alert("Error paying user!");
      return loadTickets();
    } catch (error) {
      alert("Error paying user!");
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
      <ScrollView
        style={styles.ticketList}
      >
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
              if (ticket.type === "ticket") {
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
              } else {
                return (
                  <View key={i} style={styles.ticket}>
                    <Text style={styles.ticketText}>{ticket.name} - </Text>
                    <Text style={styles.ticketText}>{ticket.status}</Text>

                    {!ticket.paid && (
                      <TouchableOpacity
                        style={styles.redeemButton}
                        onPress={() => {
                          userPaid(ticket.id);
                        }}
                      >
                        <Text style={styles.redeemButtonText}>Paid</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }
            })}
        </View>
        <View style={{ height: 200 }}/>
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
