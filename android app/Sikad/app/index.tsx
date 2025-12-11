import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Note: this file is written as a single-file Expo-ready React Native component
// that uses NativeWind (Tailwind CSS for React Native). To run:
// 1. Create a new Expo project: `npx create-expo-app sikad-app`
// 2. Install NativeWind: `npm install nativewind`
// 3. Follow NativeWind setup (babel plugin) as documented.
// 4. Replace App.js with this file and run `npx expo start`.

export default function App() {
  // sample device list (e.g., bicycles with sidecars / potpot)
  const [devices] = useState([
    { id: 'd1', name: 'Sikad - Unit 001', status: 'available', plate: 'SKD-001' },
    { id: 'd2', name: 'Sikad - Unit 002', status: 'busy', plate: 'SKD-002' },
    { id: 'd3', name: 'Sikad - Unit 003', status: 'available', plate: 'SKD-003' },
  ]);

  // drivers sample
  const [drivers] = useState([
    { id: 'dr1', name: 'Juan Dela Cruz', phone: '09171234567' },
    { id: 'dr2', name: 'Maria Santos', phone: '09179876543' },
  ]);

  // bookings/trips
  const [trips, setTrips] = useState([]);

  // booking form state
  const [selectedDevice, setSelectedDevice] = useState(devices[0].id);
  const [selectedDriver, setSelectedDriver] = useState(drivers[0].id);
  const [customerName, setCustomerName] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [distanceKm, setDistanceKm] = useState('1'); // user-entered distance estimate
  const [durationMin, setDurationMin] = useState('10');

  // fare configuration (simple cash-only fare calculation)
  const fareConfig = { base: 15, perKm: 8, perMin: 0.5 };

  function calcFare(distance, duration) {
    const d = Number(distance) || 0;
    const t = Number(duration) || 0;
    const fare = fareConfig.base + fareConfig.perKm * d + fareConfig.perMin * t;
    // round to nearest peso
    return Math.max(Math.round(fare), fareConfig.base);
  }

  function handleCreateBooking() {
    if (!customerName || !pickup || !dropoff) {
      Alert.alert('Missing info', 'Please fill customer name, pickup and dropoff.');
      return;
    }

    const device = devices.find((d) => d.id === selectedDevice);
    const driver = drivers.find((d) => d.id === selectedDriver);
    const tripFare = calcFare(distanceKm, durationMin);

    const newTrip = {
      id: 't' + (trips.length + 1),
      customer: customerName,
      pickup,
      dropoff,
      device: { id: device.id, name: device.name },
      driver: { id: driver.id, name: driver.name },
      distanceKm: Number(distanceKm) || 0,
      durationMin: Number(durationMin) || 0,
      fare: tripFare,
      paid: false,
      createdAt: new Date().toISOString(),
    };

    setTrips([newTrip, ...trips]);

    // reset some fields
    setCustomerName('');
    setPickup('');
    setDropoff('');
    setDistanceKm('1');
    setDurationMin('10');

    Alert.alert('Booking created', `Trip created — fare ₱${tripFare}`);
  }

  function handleMarkPaid(tripId) {
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, paid: true } : t)));
    Alert.alert('Payment recorded', 'Cash payment recorded as paid.');
  }

  // UI components (kept inline for single-file convenience)
  const DeviceCard = ({ item }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold">{item.name}</Text>
          <Text className="text-sm text-gray-500">Plate: {item.plate}</Text>
        </View>
        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: item.status === 'available' ? '#dcfce7' : '#fee2e2' }}>
          <Text className="text-sm">{item.status.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );

  const DriverOption = ({ d }) => (
    <TouchableOpacity onPress={() => setSelectedDriver(d.id)} className="p-3 rounded-lg mb-2 border" style={{ borderColor: selectedDriver === d.id ? '#60a5fa' : '#e5e7eb' }}>
      <Text className="font-medium">{d.name}</Text>
      <Text className="text-sm text-gray-500">{d.phone}</Text>
    </TouchableOpacity>
  );

  const BookingForm = () => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow">
      <Text className="text-xl font-semibold mb-2">Create Booking</Text>

      <Text className="text-sm text-gray-600 mt-1">Customer name</Text>
      <TextInput value={customerName} onChangeText={setCustomerName} placeholder="Juan" className="border p-2 rounded-lg mt-1" />

      <Text className="text-sm text-gray-600 mt-2">Pickup</Text>
      <TextInput value={pickup} onChangeText={setPickup} placeholder="Barangay X" className="border p-2 rounded-lg mt-1" />

      <Text className="text-sm text-gray-600 mt-2">Dropoff</Text>
      <TextInput value={dropoff} onChangeText={setDropoff} placeholder="Market" className="border p-2 rounded-lg mt-1" />

      <View className="flex-row mt-3">
        <View className="flex-1 mr-2">
          <Text className="text-sm text-gray-600">Distance (km)</Text>
          <TextInput keyboardType="numeric" value={distanceKm} onChangeText={setDistanceKm} className="border p-2 rounded-lg mt-1" />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-600">Duration (min)</Text>
          <TextInput keyboardType="numeric" value={durationMin} onChangeText={setDurationMin} className="border p-2 rounded-lg mt-1" />
        </View>
      </View>

      <Text className="text-sm text-gray-600 mt-2">Select Device</Text>
      <View className="flex-row mt-1">
        {devices.map((d) => (
          <TouchableOpacity key={d.id} onPress={() => setSelectedDevice(d.id)} className="p-2 mr-2 rounded-lg border" style={{ borderColor: selectedDevice === d.id ? '#60a5fa' : '#e5e7eb' }}>
            <Text>{d.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm text-gray-600 mt-2">Assign Driver</Text>
      <View className="mt-1">
        {drivers.map((dr) => (
          <DriverOption key={dr.id} d={dr} />
        ))}
      </View>

      <View className="flex-row justify-between mt-4 items-center">
        <Text className="text-lg font-semibold">Fare: ₱{calcFare(distanceKm, durationMin)}</Text>
        <TouchableOpacity onPress={handleCreateBooking} className="bg-blue-500 px-4 py-2 rounded-lg">
          <Text className="text-white font-semibold">Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const TripCard = ({ trip }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow">
      <View className="flex-row justify-between items-start">
        <View style={{ flex: 1 }}>
          <Text className="text-lg font-semibold">{trip.customer}</Text>
          <Text className="text-sm text-gray-500">{trip.pickup} → {trip.dropoff}</Text>

          <View className="flex-row mt-2">
            <View className="mr-4">
              <Text className="text-xs text-gray-500">Device</Text>
              <Text className="font-medium">{trip.device.name}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">Driver</Text>
              <Text className="font-medium">{trip.driver.name}</Text>
            </View>
          </View>

          <View className="flex-row mt-3">
            <Text className="text-sm">Distance: {trip.distanceKm} km</Text>
            <Text className="text-sm ml-4">Duration: {trip.durationMin} min</Text>
          </View>
        </View>

        <View className="items-end ml-3">
          <Text className="text-lg font-bold">₱{trip.fare}</Text>
          <Text className="text-xs text-gray-500">{new Date(trip.createdAt).toLocaleString()}</Text>

          {!trip.paid ? (
            <TouchableOpacity onPress={() => handleMarkPaid(trip.id)} className="bg-green-500 px-3 py-1 rounded-lg mt-3">
              <Text className="text-white">Mark Paid (Cash)</Text>
            </TouchableOpacity>
          ) : (
            <View className="px-3 py-1 rounded-lg bg-gray-200 mt-3">
              <Text>Paid</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-100 p-4">
      <StatusBar style="auto" />
      <ScrollView>
        <Text className="text-2xl font-bold mb-3">Sikad Booking — Admin Demo</Text>

        {/* Devices */}
        <Text className="text-lg font-semibold mb-2">Devices</Text>
        <FlatList data={devices} horizontal renderItem={({ item }) => <DeviceCard item={item} />} keyExtractor={(i) => i.id} showsHorizontalScrollIndicator={false} />

        {/* Booking form */}
        <BookingForm />

        {/* Trips / summaries */}
        <Text className="text-lg font-semibold mt-2 mb-2">Trips / Summaries</Text>
        {trips.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center">
            <Text>No trips yet — create one with the booking form above.</Text>
          </View>
        ) : (
          trips.map((t) => <TripCard key={t.id} trip={t} />)
        )}

        <View className="h-40" />
      </ScrollView>
    </SafeAreaView>
  );
}
