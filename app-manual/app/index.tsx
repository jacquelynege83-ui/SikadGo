import React, { JSX, useState } from "react";
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

/**
 * Sikad Dashboard - TypeScript + NativeWind-ready
 * Save as SikadDashboard.tsx
 */

type Driver = {
  id: string;
  name: string;
  rating: number;
  available: boolean;
};

type TripStatus = "pending_payment" | "completed" | "cancelled";

type Trip = {
  id: string;
  device: string;
  pickup: string;
  dropoff: string;
  distance: number;
  fare: number;
  driver: Driver | null;
  status: TripStatus;
  createdAt: string;
  paid?: boolean;
  completedAt?: string;
};

type PaymentModalState = {
  visible: boolean;
  trip: Trip | null;
};

export default function SikadDashboard(): JSX.Element {
  // Booking form
  const [device, setDevice] = useState<string>("Sikad-01");
  const [pickup, setPickup] = useState<string>("");
  const [dropoff, setDropoff] = useState<string>("");
  const [distanceKm, setDistanceKm] = useState<string>("1.2");
  const [notes, setNotes] = useState<string>("");

  // Drivers
  const [drivers, setDrivers] = useState<Driver[]>([
    { id: "d1", name: "Jun", rating: 4.9, available: true },
    { id: "d2", name: "Liza", rating: 4.7, available: true },
    { id: "d3", name: "Ramil", rating: 4.4, available: false },
  ]);
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);

  // Trips
  const [trips, setTrips] = useState<Trip[]>([]);
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({ visible: false, trip: null });

  // Fare settings
  const BASE = 10;
  const PER_KM = 8;
  const MIN = 10;

  const calcFare = (kmStr: string): number => {
    const km = Math.max(0, parseFloat(kmStr) || 0);
    return Math.max(MIN, BASE + PER_KM * km);
  };

  const handleAssign = (id: string): void => {
    const d = drivers.find((x) => x.id === id);
    if (!d) return;
    if (!d.available) {
      Alert.alert("Driver not available", `${d.name} is currently busy`);
      return;
    }
    setAssignedDriver(d);
    setDrivers((prev) => prev.map((x) => (x.id === id ? { ...x, available: false } : x)));
  };

  const handleUnassign = (): void => {
    if (!assignedDriver) return;
    setDrivers((prev) => prev.map((x) => (x.id === assignedDriver.id ? { ...x, available: true } : x)));
    setAssignedDriver(null);
  };

  const createBooking = (): void => {
    if (!pickup.trim() || !dropoff.trim()) {
      Alert.alert("Incomplete", "Please fill in pickup and dropoff");
      return;
    }
    const fare = calcFare(distanceKm);
    const trip: Trip = {
      id: `trip-${Date.now()}`,
      device,
      pickup,
      dropoff,
      distance: parseFloat(distanceKm) || 0,
      fare,
      driver: assignedDriver,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
    };
    setTrips((prev) => [trip, ...prev]);
    setPaymentModal({ visible: true, trip });
    // reset but keep assigned driver for quick-booking
    setPickup("");
    setDropoff("");
    setDistanceKm("1.2");
    setNotes("");
  };

  const markPaid = (tripId: string): void => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: "completed", paid: true, completedAt: new Date().toISOString() } : t))
    );
    setPaymentModal({ visible: false, trip: null });
    Alert.alert("Payment recorded", "Cash payment recorded — trip completed.");
  };

  const cancelTrip = (id: string): void => {
    const trip = trips.find((t) => t.id === id);
    if (trip?.driver) {
      setDrivers((prev) => prev.map((d) => (d.id === trip.driver!.id ? { ...d, available: true } : d)));
    }
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, status: "cancelled" } : t)));
  };

  const devices = ["Sikad-01", "Sikad-02", "Sikad-03"];

  // Renderers typed explicitly
  const DriverCard = ({ item }: { item: Driver }) => (
    <View className="flex-row items-center justify-between bg-white rounded-2xl p-3 shadow-lg mb-3">
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 items-center justify-center mr-3">
          <Text className="text-white font-bold text-lg">{item.name[0]}</Text>
        </View>
        <View>
          <Text className="font-semibold">{item.name}</Text>
          <Text className="text-xs text-gray-500">Rating {item.rating.toFixed(1)} • {item.available ? "Available" : "Busy"}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleAssign(item.id)}
        className={`${item.available ? "bg-green-600" : "bg-gray-300"} px-4 py-2 rounded-full`}
      >
        <Text className="text-white">Assign</Text>
      </TouchableOpacity>
    </View>
  );

  const TripCard = ({ item }: { item: Trip }) => (
    <View className="bg-white rounded-2xl p-4 shadow-lg mb-3">
      <View className="flex-row justify-between">
        <View>
          <Text className="font-bold">
            {item.device} • {item.status === "pending_payment" ? "Pending" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">{item.pickup} → {item.dropoff}</Text>
          <Text className="text-sm text-gray-600">{item.distance} km • ₱{item.fare.toFixed(2)}</Text>
          {item.driver && <Text className="text-sm text-gray-600 mt-1">Driver: {item.driver.name}</Text>}
        </View>
        <View className="items-end">
          {item.status === "pending_payment" && (
            <TouchableOpacity onPress={() => setPaymentModal({ visible: true, trip: item })} className="px-3 py-2 bg-yellow-500 rounded-full mb-2">
              <Text className="text-white">Collect Cash</Text>
            </TouchableOpacity>
          )}
          {item.status !== "completed" && item.status !== "cancelled" && (
            <TouchableOpacity onPress={() => cancelTrip(item.id)} className="px-3 py-2 bg-red-500 rounded-full">
              <Text className="text-white">Cancel</Text>
            </TouchableOpacity>
          )}
          {item.status === "completed" && <Text className="text-xs text-green-700 mt-2">Completed</Text>}
        </View>
      </View>
      <Text className="text-xs text-gray-400 mt-3">Booked: {new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-extrabold">Sikad</Text>
            <Text className="text-sm text-gray-500">Quick bookings, cash payments, and driver management</Text>
          </View>
          <View className="bg-white p-3 rounded-xl shadow">
            <Text className="font-semibold">Active Devices</Text>
            <Text className="text-sm text-gray-500">{devices.length}</Text>
          </View>
        </View>

        {/* Booking Card */}
        <View className="bg-gradient-to-r from-white to-gray-100 rounded-3xl p-4 shadow-md mb-4">
          <Text className="text-lg font-semibold mb-3">Create Booking</Text>

          <View className="flex-row space-x-2 mb-3">
            {devices.map((d) => (
              <TouchableOpacity key={d} onPress={() => setDevice(d)} className={`px-3 py-2 rounded-full ${device === d ? "bg-indigo-600" : "bg-white"} shadow-sm`}>
                <Text className={`${device === d ? "text-white" : "text-gray-700"}`}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput value={pickup} onChangeText={setPickup} placeholder="Pickup (e.g. Barangay Hall)" className="bg-white p-3 rounded-xl mb-3 border border-gray-200" />
          <TextInput value={dropoff} onChangeText={setDropoff} placeholder="Dropoff (e.g. Market)" className="bg-white p-3 rounded-xl mb-3 border border-gray-200" />

          <View className="flex-row items-center space-x-3">
            <TextInput value={distanceKm} onChangeText={setDistanceKm} keyboardType="numeric" className="bg-white p-3 rounded-xl border border-gray-200 w-28" />
            <Text className="font-semibold text-lg">Est: ₱{calcFare(distanceKm).toFixed(2)}</Text>
            <TouchableOpacity onPress={createBooking} className="ml-auto bg-indigo-600 px-4 py-3 rounded-2xl shadow">
              <Text className="text-white font-semibold">Book (Cash)</Text>
            </TouchableOpacity>
          </View>

          <TextInput value={notes} onChangeText={setNotes} placeholder="Notes (optional)" className="bg-white p-3 rounded-xl mt-3 border border-gray-200" />

          {assignedDriver && (
            <View className="mt-3 p-3 bg-white rounded-xl shadow-sm flex-row items-center justify-between">
              <View>
                <Text className="font-semibold">Assigned: {assignedDriver.name}</Text>
                <Text className="text-xs text-gray-500">Tap Unassign to change</Text>
              </View>
              <TouchableOpacity onPress={handleUnassign} className="px-3 py-2 bg-red-500 rounded-full">
                <Text className="text-white">Unassign</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Drivers List */}
        <Text className="text-lg font-semibold mb-3">Drivers</Text>
        <FlatList data={drivers} keyExtractor={(i) => i.id} renderItem={({ item }) => <DriverCard item={item} />} />

        {/* Fare quick */}
        <View className="mt-4 bg-white p-4 rounded-2xl shadow-md">
          <Text className="font-semibold">Fare Calculator</Text>
          <View className="flex-row items-center mt-3">
            <TextInput value={distanceKm} onChangeText={setDistanceKm} keyboardType="numeric" className="bg-gray-100 p-3 rounded-xl w-28" />
            <Text className="ml-4 font-semibold">₱{calcFare(distanceKm).toFixed(2)}</Text>
          </View>
          <Text className="text-xs text-gray-400 mt-2">Base ₱{BASE} + ₱{PER_KM}/km • Min ₱{MIN}</Text>
        </View>

        {/* Trips */}
        <Text className="text-lg font-semibold mt-6 mb-3">Trips</Text>
        {trips.length === 0 ? (
          <View className="bg-white p-6 rounded-2xl shadow items-center">
            <Text className="text-gray-500">No trips yet — create a booking to start</Text>
          </View>
        ) : (
          <FlatList data={trips} keyExtractor={(t) => t.id} renderItem={({ item }) => <TripCard item={item} />} />
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Payment Modal (simple) */}
      <Modal visible={paymentModal.visible} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <View className="bg-white p-6 rounded-t-3xl shadow-lg">
            <Text className="text-xl font-bold mb-2">Collect Payment (Cash)</Text>
            {paymentModal.trip && (
              <>
                <Text className="text-sm text-gray-600">{paymentModal.trip.pickup} → {paymentModal.trip.dropoff}</Text>
                <Text className="text-2xl font-extrabold mt-3">₱{paymentModal.trip.fare.toFixed(2)}</Text>
                <View className="flex-row justify-end mt-4">
                  <TouchableOpacity onPress={() => setPaymentModal({ visible: false, trip: null })} className="px-4 py-2 rounded mr-2 bg-gray-200">
                    <Text>Later</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => markPaid(paymentModal.trip!.id)} className="px-4 py-2 rounded bg-green-600">
                    <Text className="text-white">Received (Cash)</Text>
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
