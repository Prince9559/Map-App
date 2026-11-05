
import React, { useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function SearchScreen({ navigation, route }) {
    const [searchText, setSearchText] = useState(
        route?.params?.searchText || ""
    );

    const categories = [
        { title: "Restaurants", icon: "restaurant-outline", color: "#FFF0E6" },
        { title: "Hotels", icon: "bed-outline", color: "#EDE9FE" },
        { title: "Hospitals", icon: "medkit-outline", color: "#FCE7F3" },
        { title: "Shopping", icon: "cart-outline", color: "#DBEAFE" },
        { title: "ATMs", icon: "cash-outline", color: "#DCFCE7" },
        { title: "Gas Stations", icon: "car-outline", color: "#FEF3C7" },
    ];

    const handleSearch = () => {
        if (!searchText.trim()) {
            return;
        }

        // Actual Places API integration will be added next.
        navigation.navigate("PlaceDetails", {
            searchText: searchText.trim(),
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.heading}>Discover Places</Text>
                    <Text style={styles.subtitle}>
                        Find places around the world
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => setSearchText("")}
                >
                    <Ionicons
                        name="refresh-outline"
                        size={21}
                        color="#2563EB"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
                <Ionicons name="search" size={22} color="#2563EB" />

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search places, cities, addresses..."
                    placeholderTextColor="#94A3B8"
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />

                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText("")}>
                        <Ionicons
                            name="close-circle"
                            size={20}
                            color="#94A3B8"
                        />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Explore Categories</Text>

                <View style={styles.categoryGrid}>
                    {categories.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.categoryCard}
                            onPress={() => {
                                setSearchText(item.title);
                            }}
                        >
                            <View
                                style={[
                                    styles.categoryIcon,
                                    { backgroundColor: item.color },
                                ]}
                            >
                                <Ionicons
                                    name={item.icon}
                                    size={25}
                                    color="#2563EB"
                                />
                            </View>

                            <Text style={styles.categoryTitle}>
                                {item.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Popular Searches</Text>

                {[
                    "Restaurants near me",
                    "Hotels in Varanasi",
                    "Hospitals near me",
                    "Coffee shops",
                ].map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.popularItem}
                        onPress={() => setSearchText(item)}
                    >
                        <View style={styles.popularIcon}>
                            <Ionicons
                                name="time-outline"
                                size={19}
                                color="#64748B"
                            />
                        </View>

                        <Text style={styles.popularText}>{item}</Text>

                        <Ionicons
                            name="arrow-up-outline"
                            size={18}
                            color="#94A3B8"
                        />
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                >
                    <Ionicons name="search" size={19} color="#FFFFFF" />
                    <Text style={styles.searchButtonText}>
                        Search Places
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingTop: 52,
        paddingHorizontal: 20,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 22,
    },

    heading: {
        fontSize: 24,
        fontWeight: "800",
        color: "#0F172A",
    },

    subtitle: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 5,
    },

    historyButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
    },

    searchBox: {
        height: 58,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 27,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
    },

    searchInput: {
        flex: 1,
        marginLeft: 11,
        color: "#0F172A",
        fontSize: 13,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 15,
        marginTop: 5,
    },

    categoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 28,
    },

    categoryCard: {
        width: "31%",
        backgroundColor: "#FFFFFF",
        borderRadius: 17,
        paddingVertical: 17,
        alignItems: "center",
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 6,
    },

    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 9,
    },

    categoryTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: "#334155",
    },

    popularItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 13,
        borderRadius: 14,
        marginBottom: 9,
    },

    popularIcon: {
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },

    popularText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 13,
        color: "#334155",
        fontWeight: "600",
    },

    searchButton: {
        height: 53,
        backgroundColor: "#2563EB",
        borderRadius: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 9,
        marginTop: 15,
        marginBottom: 30,
    },

    searchButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
});
