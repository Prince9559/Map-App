
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import SavedPlacesScreen from "../screens/SavedPlacesScreen";
import RoadTripScreen from "../screens/RoadTripScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const tabIcons = {
    Home: "map",
    Search: "search",
    Saved: "bookmark",
    Trips: "car-sport",
    Profile: "person",
};

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,

                tabBarIcon: ({ focused, color, size }) => (
                    <Ionicons
                        name={
                            focused
                                ? tabIcons[route.name]
                                : `${tabIcons[route.name]}-outline`
                        }
                        size={size}
                        color={color}
                    />
                ),

                tabBarActiveTintColor: "#2563EB",
                tabBarInactiveTintColor: "#8B93A7",

                tabBarStyle: {
                    height: 68,
                    paddingTop: 8,
                    paddingBottom: 8,
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: 0,
                    elevation: 15,
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                },

                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: "Explore" }}
            />

            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{ title: "Search" }}
            />

            <Tab.Screen
                name="Saved"
                component={SavedPlacesScreen}
                options={{ title: "Saved" }}
            />

            <Tab.Screen
                name="Trips"
                component={RoadTripScreen}
                options={{ title: "Road Trips" }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: "Profile" }}
            />
        </Tab.Navigator>
    );
}
