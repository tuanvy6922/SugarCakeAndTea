// import React, { useEffect, useState, useRef } from 'react';
// import { View, Alert, PermissionsAndroid, Platform, TextInput, Button, TouchableOpacity, Text } from 'react-native';
// import MapView, { Marker, Polyline } from 'react-native-maps';
// import Geolocation from '@react-native-community/geolocation';
// import firestore from '@react-native-firebase/firestore';

// // Khai báo API keys
// const GEOAPIFY_API_KEY = 'be8283f0ca404169924653620c942bfa';
// const GOOGLE_MAPS_API_KEY = 'AIzaSyAwxEp8Vx8Q9_yaCHoo6zsqvxbnYHXniho';

// const StoreLocationScreen = () => {
//   const [currentPosition, setCurrentPosition] = useState(null);
//   const [storeLocations, setStoreLocations] = useState([]);
//   const [destination, setDestination] = useState(null);
//   const [routeCoordinates, setRouteCoordinates] = useState([]);
//   const [address, setAddress] = useState('');
//   const [addressSuggestions, setAddressSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const mapRef = useRef(null);

//   // Thêm hàm lấy tọa độ từ địa chỉ
//   const getCoordinatesFromAddress = async (address) => {
//     try {
//       if (!address.trim()) {
//         Alert.alert('Error', 'Vui lòng nhập địa chỉ');
//         return;
//       }

//       const response = await fetch(
//         `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}&filter=countrycode:vn&bias=countrycode:vn`
//       );
      
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
      
//       const data = await response.json();
      
//       if (data.features && data.features.length > 0) {
//         const [longitude, latitude] = data.features[0].geometry.coordinates;
//         const newPosition = { latitude, longitude };
//         setCurrentPosition(newPosition);
        
//         // Di chuyển map đến vị trí mới
//         mapRef.current?.animateToRegion({
//           ...newPosition,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         });

//         // Tìm cửa hàng gần nhất từ vị trí này
//         findNearestStore(newPosition);
//       } else {
//         Alert.alert('Error', 'Không tìm thấy địa chỉ. Vui lòng thử lại với địa chỉ khác.');
//       }
//     } catch (error) {
//       console.error('Error details:', error);
//       Alert.alert('Error', 'Không thể lấy tọa độ. Vui lòng kiểm tra kết nối mạng và thử lại.');
//     }
//   };

//   // Thêm hàm tìm cửa hàng gần nhất
//   const findNearestStore = async (position) => {
//     let nearestStore = null;
//     let shortestDistance = Infinity;
    
//     storeLocations.forEach(store => {
//       const distance = calculateDistance(
//         position.latitude,
//         position.longitude,
//         store.latitude,
//         store.longitude
//       );
      
//       console.log(`Distance to ${store.name}:`, distance, 'km');
      
//       if (distance < shortestDistance) {
//         shortestDistance = distance;
//         nearestStore = store;
//       }
//     });

//     if (nearestStore) {
//       const storeCoordinate = {
//         latitude: nearestStore.latitude,
//         longitude: nearestStore.longitude
//       };
//       setDestination(storeCoordinate);
      
//       try {
//         const route = await getRouteFromGeoapify(position, storeCoordinate);
//         setRouteCoordinates(route);
        
//         Alert.alert(
//           'Cửa hàng gần nhất',
//           `${nearestStore.name}\n${nearestStore.address}\nKhoảng cách: ${shortestDistance.toFixed(2)} km`
//         );
//       } catch (error) {
//         console.error('Error getting route:', error);
//         Alert.alert(
//           'Thông báo',
//           'Không thể hiển thị đường đi. Vui lòng thử lại.'
//         );
//       }
//     }
//   };

//   // 1. Lấy vị trí hiện tại và xử lý quyền truy cập
//   useEffect(() => {
//     const requestLocationPermission = async () => {
//       if (Platform.OS === 'android') {
//         try {
//           const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//             {
//               title: 'Yêu cầu quyền truy cập vị trí',
//               message: 'Ứng dụng cần quyền truy cập vị trí của bạn',
//               buttonNeutral: 'Hỏi lại sau',
//               buttonNegative: 'Từ chối',
//               buttonPositive: 'Đồng ý',
//             }
//           );
//           if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//             getCurrentPosition();
//           } else {
//             Alert.alert('Thông báo', 'Quyền truy cập vị trí bị từ chối');
//           }
//         } catch (err) {
//           console.warn(err);
//         }
//       } else {
//         getCurrentPosition();
//       }
//     };

//     const getCurrentPosition = () => {
//       Geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setCurrentPosition({ latitude, longitude });
//           // Di chuyển map đến vị trí hiện tại
//           mapRef.current?.animateToRegion({
//             latitude,
//             longitude,
//             latitudeDelta: 0.05,
//             longitudeDelta: 0.05,
//           });
//         },
//         (error) => {
//           console.log(error);
//           Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
//         },
//         { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
//       );
//     };

//     requestLocationPermission();
//   }, []);

//   // 2. Lấy danh sách cửa hàng từ Firestore
//   useEffect(() => {
//     const fetchStoreLocations = async () => {
//       try {
//         const snapshot = await firestore()
//           .collection('Store')
//           .get();
        
//         const locations = snapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           // Chuyển đổi string sang number cho latitude và longitude
//           latitude: parseFloat(doc.data().latitude),
//           longitude: parseFloat(doc.data().longitude)
//         }));
        
//         setStoreLocations(locations);
//       } catch (error) {
//         console.error('Error fetching store locations:', error);
//         Alert.alert('Lỗi', 'Không thể lấy danh sách cửa hàng');
//       }
//     };

//     fetchStoreLocations();
//   }, []);

//   // 3. Tính khoảng cách giữa 2 điểm
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371; // Bán kính trái đất (km)
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = 
//       Math.sin(dLat/2) * Math.sin(dLat/2) +
//       Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
//       Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     const distance = R * c;
    
//     console.log('Calculated distance:', distance, 'km'); // Log để kiểm tra
//     return distance;
//   };

//   // 4. Lấy đường đi từ Geoapify API
//   const getRouteFromGeoapify = async (start, end) => {
//     try {
//       // Tính khoảng cách trước khi gọi API
//       const distance = calculateDistance(
//         start.latitude,
//         start.longitude,
//         end.latitude,
//         end.longitude
//       );

//       console.log('Route distance:', distance, 'km'); // Log để kiểm tra

//       // Tăng giới hạn lên 1000km hoặc bỏ kiểm tra này
//       if (distance > 1000) {
//         throw new Error('Distance too far');
//       }

//       const url = `https://api.geoapify.com/v1/routing?waypoints=${start.latitude.toFixed(6)},${start.longitude.toFixed(6)}|${end.latitude.toFixed(6)},${end.longitude.toFixed(6)}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`;
      
//       console.log('API URL:', url); // Log để kiểm tra URL

//       const response = await fetch(url);
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('API Error:', errorText);
//         throw new Error(`API response error: ${response.status} ${errorText}`);
//       }
      
//       const data = await response.json();
      
//       if (data.features && data.features.length > 0) {
//         return data.features[0].geometry.coordinates[0].map(point => ({
//           latitude: point[1],
//           longitude: point[0]
//         }));
//       }
//       return [];
//     } catch (error) {
//       console.error('Error getting route:', error);
//       return [];
//     }
//   };

//   // 5. Xử lý khi click vào map
//   const handleMapPress = async (event) => {
//     const { coordinate } = event.nativeEvent;
//     setCurrentPosition(coordinate);
    
//     // Tìm cửa hàng gần nhất
//     let nearestStore = null;
//     let shortestDistance = Infinity;
    
//     storeLocations.forEach(store => {
//       const distance = calculateDistance(
//         coordinate.latitude,
//         coordinate.longitude,
//         store.latitude,
//         store.longitude
//       );
      
//       console.log('Distance to store:', distance, 'km'); // Log để kiểm tra khoảng cách
      
//       if (distance < shortestDistance) {
//         shortestDistance = distance;
//         nearestStore = store;
//       }
//     });

//     if (nearestStore) {
//       // Tăng giới hạn khoảng cách lên 1000km hoặc bỏ kiểm tra này
//       if (shortestDistance > 1000) {
//         Alert.alert(
//           'Thông báo',
//           'Khoảng cách quá xa để hiển thị đường đi. Vui lòng chọn vị trí gần hơn.'
//         );
//         return;
//       }

//       const storeCoordinate = {
//         latitude: nearestStore.latitude,
//         longitude: nearestStore.longitude
//       };
//       setDestination(storeCoordinate);
      
//       try {
//         const route = await getRouteFromGeoapify(coordinate, storeCoordinate);
//         setRouteCoordinates(route);
        
//         Alert.alert(
//           'Cửa hàng gần nhất',
//           `${nearestStore.name}\n${nearestStore.address}\nKhoảng cách: ${shortestDistance.toFixed(2)} km`
//         );
//       } catch (error) {
//         console.error('Error getting route:', error);
//         Alert.alert(
//           'Thông báo',
//           'Không thể hiển thị đường đi. Vui lòng thử lại.'
//         );
//       }
//     }
//   };

//   // Thêm hàm lấy gợi ý địa chỉ
//   const getAddressSuggestions = async (text) => {
//     try {
//       setAddress(text);
//       if (text.length < 3) { // Chỉ tìm kiếm khi có ít nhất 3 ký tự
//         setAddressSuggestions([]);
//         setShowSuggestions(false);
//         return;
//       }

//       const response = await fetch(
//         `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${GEOAPIFY_API_KEY}&lang=vi&filter=countrycode:vn&bias=countrycode:vn`
//       );
      
//       const data = await response.json();
      
//       if (data.results) {
//         setAddressSuggestions(data.results);
//         setShowSuggestions(true);
//       }
//     } catch (error) {
//       console.error('Error getting suggestions:', error);
//     }
//   };

//   // Thêm hàm xử lý khi chọn địa chỉ từ gợi ý
//   const handleSelectAddress = async (suggestion) => {
//     const { lat, lon } = suggestion;
//     const selectedPosition = {
//       latitude: lat,
//       longitude: lon
//     };
    
//     setCurrentPosition(selectedPosition);
//     setAddress(suggestion.formatted);
//     setShowSuggestions(false);
    
//     // Di chuyển map đến vị trí đã chọn
//     mapRef.current?.animateToRegion({
//       ...selectedPosition,
//       latitudeDelta: 0.05,
//       longitudeDelta: 0.05,
//     });

//     // Tìm cửa hàng gần nhất từ vị trí đã chọn
//     findNearestStore(selectedPosition);
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <View style={{ margin: 10 }}>
//         <TextInput
//           style={{
//             height: 40,
//             borderColor: 'gray',
//             borderWidth: 1,
//             paddingLeft: 8,
//             marginBottom: showSuggestions ? 0 : 10,
//             borderRadius: 5
//           }}
//           placeholder="Nhập địa chỉ"
//           value={address}
//           onChangeText={(text) => getAddressSuggestions(text)}
//         />
        
//         {/* Danh sách gợi ý địa chỉ */}
//         {showSuggestions && addressSuggestions.length > 0 && (
//           <View style={{
//             maxHeight: 200,
//             backgroundColor: 'white',
//             borderWidth: 1,
//             borderColor: 'gray',
//             marginBottom: 10,
//             borderRadius: 5
//           }}>
//             {addressSuggestions.map((suggestion, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={{
//                   padding: 10,
//                   borderBottomWidth: 1,
//                   borderBottomColor: '#eee'
//                 }}
//                 onPress={() => handleSelectAddress(suggestion)}
//               >
//                 <Text>{suggestion.formatted}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
        
//         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
//           <Button
//             title="Tìm địa chỉ"
//             onPress={() => getCoordinatesFromAddress(address)}
//           />
//           <Button
//             title="Vị trí hiện tại"
//             onPress={() => {
//               Geolocation.getCurrentPosition(
//                 async (position) => {
//                   const { latitude, longitude } = position.coords;
//                   const currentCoordinate = { latitude, longitude };
//                   setCurrentPosition(currentCoordinate);
                  
//                   // Di chuyển map đến vị trí hiện tại
//                   mapRef.current?.animateToRegion({
//                     ...currentCoordinate,
//                     latitudeDelta: 0.05,
//                     longitudeDelta: 0.05,
//                   });

//                   // Tìm cửa hàng gần nhất từ vị trí hiện tại
//                   findNearestStore(currentCoordinate);

//                   // Lấy địa chỉ từ tọa độ
//                   try {
//                     const response = await fetch(
//                       `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}&lang=vi`
//                     );
//                     const data = await response.json();
                    
//                     if (data.features && data.features.length > 0) {
//                       const addressData = data.features[0].properties;
//                       const formattedAddress = [
//                         addressData.housenumber,
//                         addressData.street,
//                         addressData.district,
//                         addressData.city,
//                         addressData.country
//                       ].filter(Boolean).join(', ');
                      
//                       setAddress(formattedAddress);
//                     }
//                   } catch (error) {
//                     console.error('Error getting address:', error);
//                   }
//                 },
//                 (error) => {
//                   console.log(error);
//                   Alert.alert('Error', 'Không thể lấy vị trí. Vui lòng thử lại.');
//                 },
//                 { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
//               );
//             }}
//           />
//         </View>
//       </View>

//       <MapView
//         ref={mapRef}
//         style={{ flex: 1 }}
//         initialRegion={{
//           latitude: 10.900948872874803,
//           longitude: 106.69607872474815,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//         showsUserLocation={true}
//         showsMyLocationButton={true}
//         onPress={handleMapPress}
//       >
//         {/* Hiển thị marker vị trí hiện tại */}
//         {currentPosition && (
//           <Marker
//             coordinate={currentPosition}
//             title="Vị trí của bạn"
//             pinColor="#FF0000"
//           />
//         )}
        
//         {/* Hiển thị các marker cửa hàng */}
//         {storeLocations.map(store => (
//           <Marker
//             key={store.id}
//             coordinate={{
//               latitude: store.latitude,
//               longitude: store.longitude
//             }}
//             title={store.name}
//             description={store.address}
//             pinColor="#00FF00"
//           />
//         ))}

//         {/* Hiển thị đường đi */}
//         {routeCoordinates.length > 0 && (
//           <Polyline
//             coordinates={routeCoordinates}
//             strokeWidth={3}
//             strokeColor="blue"
//           />
//         )}
//       </MapView>
//     </View>
//   );
// };

// export default StoreLocationScreen;
