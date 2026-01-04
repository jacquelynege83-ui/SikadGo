import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";

const MetricCard = ({ title, value, unit, iconName, color }) => (
  <View className="w-1/2 p-2">
    <View className={`flex-row items-center p-3 rounded-xl border border-gray-100 ${color}`}>
      <MaterialCommunityIcons name={iconName} size={22} color="#374151" />
      <View className="ml-3">
        <Text className="text-base font-bold text-gray-800">
          {value ?? "--"} {unit}
        </Text>
        <Text className="text-xs text-gray-500">{title}</Text>
      </View>
    </View>
  </View>
);

const DeviceCard = ({ device, pressEventHandler }) => {
  const statusColor =
    device.tripStatus === "ongoing"
      ? "bg-yellow-50"
      : device.tripStatus === "completed"
      ? "bg-green-50"
      : "bg-gray-50";

  return (
    <TouchableOpacity
      className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-md border border-gray-100 active:bg-gray-50"
      onPress={() => pressEventHandler(device)}
      activeOpacity={0.8}
    >
      {/* HEADER */}
      <View className="flex-row justify-between items-start pb-3 mb-3 border-b border-gray-100">
        <View>
          <Text className="text-xl font-extrabold text-gray-900">
            {device.deviceID}
          </Text>
          <Text className="text-xs text-gray-500">
            RFID: {device.rfidUID}
          </Text>
        </View>

        <Octicons
          name="dot-fill"
          size={26}
          color={device.isOnline ? "green" : "red"}
        />
      </View>

      {/* METRICS */}
      <View className="flex-row flex-wrap -m-2">
        <MetricCard
          title="Trip Status"
          value={device.tripStatus}
          unit=""
          iconName="map-marker-path"
          color={statusColor}
        />

        <MetricCard
          title="Distance"
          value={device.distanceKm}
          unit="km"
          iconName="speedometer"
          color="bg-blue-50"
        />

        <MetricCard
          title="Trip Start"
          value={device.tripStartDistance}
          unit="km"
          iconName="play-circle-outline"
          color="bg-indigo-50"
        />

        <MetricCard
          title="Trip End"
          value={device.tripEndDistance}
          unit="km"
          iconName="stop-circle-outline"
          color="bg-rose-50"
        />
      </View>

      {/* FOOTER */}
      <View className="mt-3 pt-2 border-t border-gray-100">
        <Text className="text-xs text-gray-500">
          Last update: {new Date(device.lastUpdate).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default DeviceCard;
