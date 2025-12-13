import React, { JSX, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axiosInstance from "../axiosConfig.js";

/**
 * Sikad USER Dashboard
 * Your Ride, Your Way
 */

type TripStatus = "pending_payment" | "completed" | "cancelled";

type Trip = {
  id: string;
  device: string;
  pickup: string;
  dropoff: string;
  fare: number;
  status: TripStatus;
  createdAt: string;
};

type Device = {
  id: string;
  name: string;
};

type PaymentModalState = {
  visible: boolean;
  trip: Trip | null;
};

export default function SikadUserDashboard(): JSX.Element {
  /* =======================
     DEVICE DATA (API)
  ======================= */
  const [data, setData] = useState<Device[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axiosInstance.get("/device/get");

        if (!response.data?.success) {
          console.log(response.data?.message);
          setData([]);
        } else {
          setData(response.data.data);
        }
      } catch (error: any) {
        console.error("Data retrieval error:", error?.message);
      }
    };

    fetchDevices();
  }, []); // ✅ IMPORTANT: dependency array

  const BASE_FARE = 10;

  /* =======================
     BOOKING FORM
  ======================= */
  const [device, setDevice] = useState("Sikad-01");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [notes, setNotes] = useState("");

  /* =======================
     TRIPS
  ======================= */
  const [trips, setTrips] = useState<Trip[]>([]);
  const [paymentModal, setPaymentModal] =
    useState<PaymentModalState>({ visible: false, trip: null });

  const createBooking = () => {
    if (!pickup || !dropoff) {
      Alert.alert("Missing information", "Please fill pickup and dropoff");
      return;
    }

    const trip: Trip = {
      id: `trip-${Date.now()}`,
      device,
      pickup,
      dropoff,
      fare: BASE_FARE,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
    };

    setTrips((prev) => [trip, ...prev]);
    setPaymentModal({ visible: true, trip });

    setPickup("");
    setDropoff("");
    setNotes("");
  };

  const markPaid = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, status: "completed" } : t
      )
    );
    setPaymentModal({ visible: false, trip: null });
    Alert.alert("Payment received", "₱10 cash payment recorded");
  };

  const cancelTrip = (id: string) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "cancelled" } : t
      )
    );
  };

  const devices = ["Sikad-01"]; // static for now

  const TripCard = ({ item }: { item: Trip }) => (
    <View className="bg-white rounded-2xl p-4 shadow mb-3">
      <Text className="font-bold">
        {item.device} • {item.status.toUpperCase()}
      </Text>
      <Text className="text-sm text-gray-600 mt-1">
        {item.pickup} → {item.dropoff}
      </Text>
      <Text className="font-semibold mt-1">
        Fare: ₱{item.fare}.00
      </Text>

      {item.status === "pending_payment" && (
        <View className="flex-row mt-3">
          <TouchableOpacity
            onPress={() =>
              setPaymentModal({ visible: true, trip: item })
            }
            className="bg-green-600 px-4 py-2 rounded-full mr-2"
          >
            <Text className="text-white">Pay Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => cancelTrip(item.id)}
            className="bg-red-500 px-4 py-2 rounded-full"
          >
            <Text className="text-white">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-green-100">
      <ScrollView className="p-4">
        <Text className="text-2xl font-extrabold">SikadGo</Text>
        <Text className="text-sm text-gray-700 mb-4">
          Your Ride, Your Way
        </Text>

        {/* Booking */}
        <View className="bg-white rounded-3xl p-3 shadow mb-4">
          <Text className="text-lg font-extrabold mb-3">
            Book a Ride
          </Text>

          <View className="flex-row mb-3">
            {devices.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDevice(d)}
                className={`px-3 py-2 rounded-full mr-2 ${
                  device === d ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <Text className={device === d ? "text-white" : "text-black"}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Pickup location"
            value={pickup}
            onChangeText={setPickup}
            className="bg-gray-100 p-4 rounded-xl mb-2"
          />

          <TextInput
            placeholder="Dropoff location"
            value={dropoff}
            onChangeText={setDropoff}
            className="bg-gray-100 p-4 rounded-xl mb-3"
          />

          <Text className="font-bold mb-2">
            Fare: ₱10.00 (Fixed)
          </Text>

          <TouchableOpacity
            onPress={createBooking}
            className="bg-green-600 px-4 py-3 rounded-2xl"
          >
            <Text className="text-white text-center font-semibold">
              Book Ride
            </Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            className="bg-gray-100 p-3 rounded-xl mt-3"
          />
        </View>

        {/* Trips */}
        <Text className="text-lg font-semibold mb-2">
          My Trips
        </Text>

        {trips.length === 0 ? (
          <Text className="text-gray-500">No trips yet</Text>
        ) : (
          <FlatList
            data={trips}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => <TripCard item={item} />}
          />
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Payment Modal */}
      <Modal visible={paymentModal.visible} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <View className="bg-white p-6 rounded-t-3xl">
            {paymentModal.trip && (
              <>
                <Text className="text-xl font-bold">Cash Payment</Text>
                <Text className="text-2xl font-extrabold mt-3">
                  ₱10.00
                </Text>

                <View className="flex-row justify-end mt-4">
                  <TouchableOpacity
                    onPress={() =>
                      setPaymentModal({ visible: false, trip: null })
                    }
                    className="px-4 py-2 bg-gray-200 rounded mr-2"
                  >
                    <Text>Later</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      markPaid(paymentModal.trip!.id)
                    }
                    className="px-4 py-2 bg-green-600 rounded"
                  >
                    <Text className="text-white">Paid</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
