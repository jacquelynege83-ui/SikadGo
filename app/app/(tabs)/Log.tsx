import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import logo from "../../assets/images/logo.png";

/* =========================
   TABLE HEADER
========================= */
const renderTableHeading = () => (
  <View className="flex-row w-full py-2 bg-slate-400 rounded-t-lg">
    <Text className="w-28 text-center text-white text-xs">Event Date</Text>
    <Text className="w-24 text-center text-white text-xs">Device</Text>
    <Text className="flex-1 text-center text-white text-xs">RFID</Text>
    <Text className="w-16 text-center text-white text-xs">Online</Text>
    <Text className="w-16 text-center text-white text-xs">Km</Text>
    <Text className="w-24 text-center text-white text-xs">Status</Text>
  </View>
);

/* =========================
   TABLE ROW
========================= */
const renderTableData = ({ item }: any) => {
  if (!item) return null;

  const eventDate = item.eventDate || item.createdAt;

  return (
    <View className="flex-row w-full py-2 border-b border-gray-100">
      <Text className="w-28 text-xs text-center">
        {new Date(eventDate).toLocaleString()}
      </Text>

      <Text className="w-24 text-xs text-center">
        {item.device?.deviceID || "-"}
      </Text>

      <Text className="flex-1 text-xs text-center">
        {item.rfidUID || "-"}
      </Text>

      <Text className="w-16 text-xs text-center">
        {item.isOnline ? "Yes" : "No"}
      </Text>

      <Text className="w-16 text-xs text-center">
        {item.distanceKm ?? 0}
      </Text>

      <Text className="w-24 text-xs text-center capitalize">
        {item.tripStatus || "-"}
      </Text>
    </View>
  );
};

/* =========================
   MAIN COMPONENT
========================= */
const ProfileTab = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [deviceIDs, setDeviceIDs] = useState<string[]>([]);
  const [selectedDeviceID, setSelectedDeviceID] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStartDateSelection, setShowStartDateSelection] = useState(false);
  const [showEndDateSelection, setShowEndDateSelection] = useState(false);
  const [data, setData] = useState<any[]>([]);

  /* =========================
     LOAD USER DEVICES
  ========================= */
  const reloadData = async () => {
    try {
      const response = await axiosInstance.get("/device/get-my-devices", {
        withCredentials: true,
      });

      if (!response.data.success) {
        Toast.show({
          type: "error",
          text1: "❌ Failed to load devices",
          text2: response.data.message,
        });
        return;
      }

      setDeviceIDs(response.data.data.map((d: any) => d.deviceID));
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "❌ Device Error",
        text2: error.message,
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    reloadData().finally(() => setIsLoading(false));
  }, []);

  /* =========================
     DATE HANDLERS
  ========================= */
  const changeStartDate = (_: any, selected?: Date) => {
    if (selected) setStartDate(selected);
    setShowStartDateSelection(false);
  };

  const changeEndDate = (_: any, selected?: Date) => {
    if (selected) setEndDate(selected);
    setShowEndDateSelection(false);
  };

  /* =========================
     SEARCH EVENTS
  ========================= */
  const searchEvents = async () => {
    setIsLoading(true);
    setData([]);

    try {
      const payload: any = {
        startDate,
        endDate,
      };

      if (selectedDeviceID) {
        payload.deviceID = selectedDeviceID;
      }

      const response = await axiosInstance.post(
        "/event/sensor-records",
        payload,
        { withCredentials: true }
      );

      if (!response.data.success) {
        Toast.show({
          type: "error",
          text1: "❌ No Records Found",
          text2: response.data.message,
        });
        return;
      }

      setData(response.data.data);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "❌ Search Error",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {isLoading && loadingOverlay()}

      {/* HEADER */}
      <View className="flex-row items-center gap-4 px-5 py-4 bg-white border-b border-gray-100">
        <Image source={logo} style={{ width: 45, height: 45 }} />
        <Text className="text-3xl font-extrabold text-green-700">Logs</Text>
      </View>

      {/* FILTER CARD */}
      <View className="mx-5 my-5 bg-white rounded-lg p-4 shadow-sm">
        {/* DEVICE PICKER */}
        <View className="flex-row items-center gap-4 mb-3">
          <Text className="text-gray-500">Device:</Text>
          <View className="flex-1 border border-gray-300 rounded-xl">
            <Picker
              selectedValue={selectedDeviceID}
              onValueChange={setSelectedDeviceID}
            >
              <Picker.Item label="All Devices" value="" />
              {deviceIDs.map((id) => (
                <Picker.Item key={id} label={id} value={id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* DATE RANGE */}
        <View className="flex-row gap-4">
          {["Start Date", "End Date"].map((label, i) => {
            const showPicker = i === 0 ? showStartDateSelection : showEndDateSelection;
            const date = i === 0 ? startDate : endDate;
            const onPress = i === 0
              ? () => setShowStartDateSelection(true)
              : () => setShowEndDateSelection(true);
            const onChange = i === 0 ? changeStartDate : changeEndDate;

            return (
              <View key={label} className="flex-1">
                <Text className="text-slate-600 mb-1">{label}</Text>
                <TouchableOpacity
                  onPress={onPress}
                  className="border border-slate-300 rounded-xl p-3 flex-row justify-between items-center"
                >
                  <Text>{date.toLocaleDateString()}</Text>
                  <MaterialIcons name="arrow-drop-down" size={24} />
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    minimumDate={i === 1 ? startDate : undefined}
                    onChange={onChange}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* SEARCH BUTTON */}
        <TouchableOpacity
          onPress={searchEvents}
          className="mt-5 bg-blue-600 py-3 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Search</Text>
        </TouchableOpacity>
      </View>

      {/* TABLE */}
      {data.length > 0 && (
        <View className="mx-2 bg-white rounded-lg shadow-sm">
          <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={renderTableHeading}
            renderItem={renderTableData}
            stickyHeaderIndices={[0]}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProfileTab;
