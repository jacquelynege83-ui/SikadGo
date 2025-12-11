import React, { useState } from 'react';
import { Alert, FlatList, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// This single-file React Native (Expo) component uses Tailwind classes (NativeWind)
// Instructions: set up a new Expo project and install nativewind (https://www.nativewind.dev/).
// Then drop this file in and import it as your main screen.

export default function SikadDashboard() {
  // Booking form state
  const [device, setDevice] = useState('Sikad-01');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [distanceKm, setDistanceKm] = useState('1.0');
  const [notes, setNotes] = useState('');

  // Drivers and assignment
  const driversInitial = [
    { id: 'd1', name: 'Jun', rating: 4.8, available: true },
    { id: 'd2', name: 'Liza', rating: 4.6, available: true },
    { id: 'd3', name: 'Ramil', rating: 4.2, available: false },
  ];
  const [drivers, setDrivers] = useState(driversInitial);
  const [assignedDriver, setAssignedDriver] = useState(null);

  // Trips & payments
  const [trips, setTrips] = useState([]);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);

  // Fare calculation settings
  const BASE_FARE = 20; // currency units
  const PER_KM = 8; // per km
  const MIN_FARE = 20;

  function calcFare(kmStr) {
    const km = Math.max(0, parseFloat(kmStr) || 0);
    const fare = Math.max(MIN_FARE, BASE_FARE + PER_KM * km);
    return fare;
  }

  function handleAssignDriver(driverId) {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;
    if (!driver.available) {
      Alert.alert('Driver not available', `${driver.name} is currently unavailable`);
      return;
    }
    setAssignedDriver(driver);
    // update availability locally
    setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, available: false } : d)));
  }

  function handleCreateBooking() {
    if (!pickup || !dropoff) {
      Alert.alert('Missing info', 'Please enter pickup and dropoff locations.');
      return;
    }
    const fare = calcFare(distanceKm);
    // create a pending trip object
    const newTrip = {
      id: `trip-${Date.now()}`,
      device,
      pickup,
      dropoff,
      distanceKm: parseFloat(distanceKm) || 0,
      fare,
      notes,
      driver: assignedDriver,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };
    setTrips((t) => [newTrip, ...t]);
    setShowPaymentPrompt(true);
    // clear form but keep assigned driver (common for quick bookings)
    setPickup('');
    setDropoff('');
    setDistanceKm('1.0');
    setNotes('');
  }

  function confirmCashPayment(tripId) {
    setTrips((prev) =>
      prev.map((tr) => (tr.id === tripId ? { ...tr, status: 'completed', paid: true, completedAt: new Date().toISOString() } : tr))
    );
    setShowPaymentPrompt(false);
    Alert.alert('Payment received', 'Cash payment recorded. Trip completed.');
  }

  function cancelTrip(tripId) {
    // release driver if assigned to this trip
    const trip = trips.find((t) => t.id === tripId);
    if (trip?.driver) {
      setDrivers((prev) => prev.map((d) => (d.id === trip.driver.id ? { ...d, available: true } : d)));
    }
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'cancelled' } : t)));
  }

  function renderDriverCard({ item }) {
    return (
      <View className="p-3 bg-white rounded-xl shadow mb-3 flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold">{item.name}</Text>
          <Text className="text-sm">Rating: {item.rating} • {item.available ? 'Available' : 'Busy'}</Text>
        </View>
        <TouchableOpacity
          className={`px-3 py-2 rounded ${item.available ? 'bg-green-500' : 'bg-gray-300'}`}
          onPress={() => handleAssignDriver(item.id)}
        >
          <Text className="text-white">Assign</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderTripItem({ item }) {
    return (
      <View className="p-3 bg-white rounded-xl shadow mb-3">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="font-bold">{item.device} • {item.status.toUpperCase()}</Text>
            <Text className="text-sm">{item.pickup} → {item.dropoff}</Text>
            <Text className="text-sm">Distance: {item.distanceKm} km</Text>
            <Text className="text-sm">Fare: ₱{item.fare.toFixed(2)}</Text>
            <Text className="text-xs text-gray-500">Booked: {new Date(item.createdAt).toLocaleString()}</Text>
            {item.driver && <Text className="text-sm mt-1">Driver: {item.driver.name}</Text>}
          </View>
          <View className="items-end">
            {item.status === 'pending_payment' && (
              <TouchableOpacity
                className="px-3 py-2 bg-yellow-500 rounded mb-2"
                onPress={() => confirmCashPayment(item.id)}
              >
                <Text className="text-white">Mark Paid (Cash)</Text>
              </TouchableOpacity>
            )}
            {item.status !== 'completed' && (
              <TouchableOpacity className="px-3 py-2 bg-red-500 rounded" onPress={() => cancelTrip(item.id)}>
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {item.status === 'completed' && item.completedAt && (
          <Text className="mt-2 text-xs text-green-700">Completed: {new Date(item.completedAt).toLocaleString()}</Text>
        )}
      </View>
    );
  }

  const availableDevices = ['Sikad-01', 'Sikad-02', 'Sikad-03'];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold mb-4">Sikad — Booking & Dashboard</Text>

        {/* Booking Form */}
        <View className="mb-4 p-4 bg-white rounded-2xl shadow">
          <Text className="text-lg font-semibold mb-2">Create Booking</Text>

          <Text className="text-sm text-gray-600">Select Device</Text>
          <View className="flex-row space-x-2 my-2">
            {availableDevices.map((d) => (
              <TouchableOpacity
                key={d}
                className={`px-3 py-2 rounded ${device === d ? 'bg-blue-600' : 'bg-gray-200'}`}
                onPress={() => setDevice(d)}
              >
                <Text className={`${device === d ? 'text-white' : 'text-black'}`}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Pickup location"
            value={pickup}
            onChangeText={setPickup}
            className="border border-gray-300 rounded p-2 mb-2"
          />
          <TextInput
            placeholder="Dropoff location"
            value={dropoff}
            onChangeText={setDropoff}
            className="border border-gray-300 rounded p-2 mb-2"
          />

          <TextInput
            placeholder="Distance (km)"
            keyboardType="numeric"
            value={distanceKm}
            onChangeText={setDistanceKm}
            className="border border-gray-300 rounded p-2 mb-2"
          />

          <TextInput
            placeholder="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            className="border border-gray-300 rounded p-2 mb-3"
          />

          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold">Estimated: ₱{calcFare(distanceKm).toFixed(2)}</Text>
            <TouchableOpacity className="px-4 py-2 bg-blue-600 rounded" onPress={handleCreateBooking}>
              <Text className="text-white">Book (Cash only)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Driver assignment */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Drivers</Text>
          <FlatList data={drivers} keyExtractor={(i) => i.id} renderItem={renderDriverCard} />

          {assignedDriver && (
            <View className="mt-3 p-3 bg-white rounded-xl shadow">
              <Text className="font-semibold">Assigned driver</Text>
              <Text>{assignedDriver.name} • Rating {assignedDriver.rating}</Text>
              <TouchableOpacity
                className="mt-2 px-3 py-2 bg-red-500 rounded"
                onPress={() => {
                  // release driver
                  setDrivers((prev) => prev.map((d) => (d.id === assignedDriver.id ? { ...d, available: true } : d)));
                  setAssignedDriver(null);
                }}
              >
                <Text className="text-white">Unassign</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Fare calculator quick tool */}
        <View className="mb-4 p-4 bg-white rounded-2xl shadow">
          <Text className="text-lg font-semibold mb-2">Fare Calculator</Text>
          <View className="flex-row justify-between items-center">
            <TextInput value={distanceKm} onChangeText={setDistanceKm} keyboardType="numeric" className="border border-gray-300 rounded p-2 w-32" />
            <Text className="font-semibold">Fare: ₱{calcFare(distanceKm).toFixed(2)}</Text>
          </View>
          <Text className="text-xs text-gray-500 mt-2">Base ₱{BASE_FARE} + ₱{PER_KM} per km. Min ₱{MIN_FARE}.</Text>
        </View>

        {/* Trip summaries */}
        <View className="mb-20">
          <Text className="text-lg font-semibold mb-2">Trips</Text>
          {trips.length === 0 ? (
            <Text className="text-gray-500">No trips yet. Create a booking above to start.</Text>
          ) : (
            <FlatList data={trips} keyExtractor={(t) => t.id} renderItem={renderTripItem} />
          )}
        </View>
      </ScrollView>

      {/* Payment prompt would be a modal in a real app; simplified here */}
      {showPaymentPrompt && trips[0] && trips[0].status === 'pending_payment' && (
        <View className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow">
          <Text className="font-semibold mb-2">Payment — Cash only</Text>
          <Text>Amount due: ₱{trips[0].fare.toFixed(2)}</Text>
          <View className="flex-row justify-end mt-3">
            <TouchableOpacity className="px-3 py-2 rounded mr-2 bg-gray-200" onPress={() => setShowPaymentPrompt(false)}>
              <Text>Later</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-3 py-2 rounded bg-green-600" onPress={() => confirmCashPayment(trips[0].id)}>
              <Text className="text-white">Received (Cash)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
