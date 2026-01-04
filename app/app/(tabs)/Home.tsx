import { BackHandler, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import loadingOverlay from "../components/LoadingOverlay";
import logo from "../../assets/images/logo.png";

const RiderHome = () => {
  const [summary, setSummary] = useState({
    status: "OFFLINE",
    rfid: "Not Detected",
    tripsToday: 0,
    earnings: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(0);

  /* =====================
     SAFE INIT (NO API)
  ===================== */
  useEffect(() => {
    setIsLoading(true);

    // SAFE DEFAULT VALUES
    setSummary({
      status: "OFFLINE",
      rfid: "Not Detected",
      tripsToday: 0,
      earnings: 0,
    });

    setIsLoading(false);
  }, []);

  /* =====================
     DISABLE BACK BUTTON
  ===================== */
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );
      return () => subscription.remove();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {isLoading && loadingOverlay()}

      {/* HEADER */}
      <View className="flex flex-row items-center gap-5 px-5 py-4 bg-white shadow-sm border-b border-gray-100 pt-10">
        <Image source={logo} style={{ width: 45, height: 45 }} />
        <Text className="text-3xl font-extrabold text-green-700">
          Home
        </Text>
      </View>

      <ScrollView>
        {/* SUMMARY CARD */}
        <View
          className="mx-5 my-5 bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        >
          <Text className="text-2xl font-bold text-gray-700 mb-4">
            Rider Summary
          </Text>

          {/* STATUS */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="account-check"
                size={22}
                color="#16A34A"
              />
              <Text className="text-lg font-semibold text-gray-700">
                Status:
              </Text>
            </View>
            <Text className="text-lg font-bold text-red-600">
              {summary.status}
            </Text>
          </View>

          {/* RFID */}
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="nfc"
                size={22}
                color="#16A34A"
              />
              <Text className="text-lg font-semibold text-gray-700">
                RFID:
              </Text>
            </View>
            <Text className="text-lg font-bold text-red-600">
              {summary.rfid}
            </Text>
          </View>

          {/* STATS */}
          <View className="flex-row">
            <StatCard
              icon="map-marker-path"
              label="Trips Today"
              value={summary.tripsToday}
            />
            <StatCard
              icon="cash"
              label="Earnings"
              value={`₱${summary.earnings}`}
            />
          </View>

          {/* INFO */}
          <View className="mt-5 bg-green-50 border border-green-200 rounded-lg p-4">
            <Text className="text-green-700 font-semibold">
              Ready to accept passengers
            </Text>
            <Text className="text-gray-600 text-sm mt-1">
              Make sure your RFID is active and stay online to receive bookings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* =====================
   STAT CARD
===================== */
const StatCard = ({ icon, label, value }) => (
  <View className="w-1/2 p-2">
    <View className="bg-gray-50 border border-gray-200 rounded-lg p-4 items-center">
      <MaterialCommunityIcons
        name={icon}
        size={28}
        color="#16A34A"
      />
      <Text className="text-xl font-bold text-gray-800 mt-2">
        {value}
      </Text>
      <Text className="text-xs text-gray-500">
        {label}
      </Text>
    </View>
  </View>
);

export default RiderHome;
