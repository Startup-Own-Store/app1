// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   FlatList,
//   Platform,
//   StatusBar,
// } from 'react-native';

// // FIX: If you see an error on the line below, it's likely because the type
// // definitions for react-native-vector-icons are not installed.
// // Run this command in your terminal to fix it:
// // npm install @types/react-native-vector-icons --save-dev
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// const currentOrders = [
//   { id: '1', name: 'Liam Carteraqw', orderId: '123456', time: '10:30 AM', status: 'Accepted', items: 2, price: '$25.50' },
//     { id: '2', name: 'Olivia Bennett', orderId: '789012', time: '11:15 AM', status: 'Preparing', items: 3, price: '$32.75' },
//     { id: '3', name: 'Noah Thompson', orderId: '345678', time: '12:00 PM', status: 'Ready for Pickup', items: 1, price: '$15.99' },
//     { id: '4', name: 'Ava Harper', orderId: '901234', time: '12:45 PM', status: 'Out for Delivery', items: 4, price: '$45.20' },
// ];

// const OrdersScreen = () => {

//     const renderOrderItem = ({ item }: { item: typeof currentOrders[0] }) => (
//         <TouchableOpacity style={styles.orderItemContainer}>
//             <View style={styles.orderDetails}>
//                 <Text style={styles.customerName}>{item.name}</Text>
//                 <Text style={styles.orderInfo}>Order #{item.orderId} · {item.time} · {item.status}</Text>
//                 <Text style={styles.orderInfo}>{item.items} items · {item.price}</Text>
//             </View>
//             <MaterialIcons name="chevron-right" size={28} color="#191410" />
//         </TouchableOpacity>
//     );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity>
//             <MaterialIcons name="arrow-back" size={24} color="#191410" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Orders</Text>
//           <View style={{ width: 24 }} />
//         </View>

//         <FlatList
//             data={currentOrders}
//             renderItem={renderOrderItem}
//             keyExtractor={item => item.id}
//             showsVerticalScrollIndicator={false}
//             ItemSeparatorComponent={() => <View style={styles.separator} />}
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fbfaf9',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   container: {
//     flex: 1,
//   },
//   // Header
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e3dbd4',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#191410',
//     fontFamily: "'Work Sans', sans-serif",
//   },
//   // Order List Item
//   orderItemContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     backgroundColor: '#fbfaf9',
//   },
//   orderDetails: {
//     flex: 1,
//     gap: 4,
//   },
//   customerName: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#191410',
//     fontFamily: "'Work Sans', sans-serif",
//   },
//   orderInfo: {
//     fontSize: 14,
//     color: '#8b725b',
//     fontFamily: "'Work Sans', sans-serif",
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#e3dbd4',
//     marginLeft: 16,
//   },
// });

// export default OrdersScreen;




import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons'; // Assuming Expo for icons

// Mock navigation prop type for demonstration
// In a real app, this would come from your navigation library
type VendorHomeScreenProps = {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
};

// Main component for the Vendor Home Screen
const VendorHomeScreen: React.FC<VendorHomeScreenProps> = ({ navigation }) => {
  // State to manage if the shop is open or closed
  const [isShopOpen, setIsShopOpen] = useState(false);
  // State to hold a new incoming order object
  const [newOrder, setNewOrder] = useState<any | null>(null);
  // State to hold a list of accepted, in-progress orders
  const [currentOrders, setCurrentOrders] = useState<any[]>([]);
  // State for dashboard metrics
  const [todaysEarnings, setTodaysEarnings] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);

  // Effect to simulate receiving a new order when the shop is open
  useEffect(() => {
    if (isShopOpen && !newOrder && currentOrders.length < 3) { // Cap at 3 for demo
      const timer = setTimeout(() => {
        // Mock order data
        const mockOrder = {
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          items: "2x Cappuccino, 1x Croissant",
          total: 12.50,
        };
        setNewOrder(mockOrder);
      }, 5000); // New order arrives after 5 seconds

      return () => clearTimeout(timer); // Cleanup timer on component unmount or state change
    }
  }, [isShopOpen, newOrder, currentOrders]);


  // Toggles the shop's open/closed status
  const handleToggleShopStatus = () => {
    setIsShopOpen((previousState) => {
      const newState = !previousState;
      if (!newState) {
        setNewOrder(null); // Clear any pending new order when closing the shop
      }
      return newState;
    });
  };

  // Handles accepting a new order
  const handleAcceptOrder = () => {
    if (newOrder) {
      // Add to current orders list to be processed
      setCurrentOrders((prevOrders) => [newOrder, ...prevOrders]);
      // Clear the new order notification
      setNewOrder(null);
    }
  };

  // Handles rejecting a new order
  const handleRejectOrder = () => {
    setNewOrder(null); // Simply clear the new order
  };

  // Handles completing an order from the current list
  const handleCompleteOrder = (orderToComplete: any) => {
    // Update dashboard stats with the completed order's details
    setTodaysEarnings((prevEarnings) => prevEarnings + orderToComplete.total);
    setCompletedOrdersCount((prevCount) => prevCount + 1);

    // Remove the order from the current (in-progress) orders list
    setCurrentOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderToComplete.id)
    );
  };


  // Placeholder for navigating to order details screen
  const handleViewDetails = (orderId: string) => {
    console.log("Navigating to details for order:", orderId);
    // navigation.navigate('OrderDetails', { orderId: orderId });
  };

  // Reusable component for bottom navigation items
  const BottomNavItem = ({ iconName, label, onPress }: { iconName: keyof typeof MaterialIcons.glyphMap, label: string, onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.navItem}>
      <MaterialIcons name={iconName} size={24} color={"#9b7049"} />
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Component to render the new dashboard summary
  const Dashboard = () => (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardCard}>
        <Text style={styles.dashboardValue}>${todaysEarnings.toFixed(2)}</Text>
        <Text style={styles.dashboardLabel}>Today's Earnings</Text>
      </View>
      <View style={styles.dashboardCard}>
        <Text style={styles.dashboardValue}>{completedOrdersCount}</Text>
        <Text style={styles.dashboardLabel}>Completed Orders</Text>
      </View>
    </View>
  );

  // Component to render the new order notification card
  const NewOrderNotification = () => (
    newOrder && (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>New Order Received!</Text>
        <Text style={styles.cardText}>Order ID: {newOrder.id}</Text>
        <Text style={styles.cardText}>Items: {newOrder.items}</Text>
        <Text style={styles.cardText}>Total: ${newOrder.total.toFixed(2)}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={handleAcceptOrder}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={handleRejectOrder}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  );

  // Component to render the list of current orders
  const CurrentOrdersList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>Current Orders</Text>
      {currentOrders.length > 0 ? (
        currentOrders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.cardTextBold}>Order ID: {order.id}</Text>
            <Text style={styles.cardText}>Items: {order.items}</Text>
            <View style={styles.orderActionsContainer}>
                <TouchableOpacity style={styles.detailsButton} onPress={() => handleViewDetails(order.id)}>
                    <Text style={styles.detailsButtonText}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.completeButton]} onPress={() => handleCompleteOrder(order)}>
                    <Text style={styles.buttonText}>Complete</Text>
                </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noOrdersText}>No active orders right now.</Text>
      )}
    </View>
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <MaterialIcons name="arrow-back" size={24} color="#1c140c" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>The Coffee House</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView>
            {/* Shop Status Toggle */}
            <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Shop is {isShopOpen ? "Open" : "Closed"}</Text>
                <Switch
                    trackColor={{ false: "#f4ede8", true: "#d3bdaF" }}
                    thumbColor={isShopOpen ? "#9b7049" : "#f4f3f4"}
                    ios_backgroundColor="#f4ede8"
                    onValueChange={handleToggleShopStatus}
                    value={isShopOpen}
                />
            </View>
            <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                    {isShopOpen
                    ? "You are currently open and can receive new orders."
                    : "Your shop is closed. Toggle on to start accepting orders."}
                </Text>
            </View>

            {/* Dashboard Section */}
            <Dashboard />

            {/* Main Content Area */}
            <View style={styles.mainContent}>
                {isShopOpen && <NewOrderNotification />}
                <CurrentOrdersList />
            </View>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fcf9f7",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4ede8',
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c140c",
  },
  headerSpacer: {
    width: 24,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4ede8',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: "#1c140c",
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4ede8',
  },
  descriptionText: {
    color: "#575757",
    fontSize: 14,
  },
  dashboardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#faf6f3',
    borderBottomWidth: 1,
    borderBottomColor: '#f4ede8',
  },
  dashboardCard: {
    alignItems: 'center',
    flex: 1,
  },
  dashboardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c140c',
  },
  dashboardLabel: {
    fontSize: 14,
    color: '#575757',
    marginTop: 4,
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f4ede8'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#9b7049',
  },
  cardText: {
    fontSize: 14,
    color: '#575757',
    marginBottom: 4,
  },
  cardTextBold: {
      fontSize: 14,
      color: '#1c140c',
      fontWeight: '600',
      marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#28a745',
    marginRight: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    marginLeft: 8,
  },
  completeButton: {
      backgroundColor: '#007bff',
      paddingHorizontal: 16,
      marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
      marginTop: 16,
  },
  listTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1c140c',
      marginBottom: 12,
  },
  orderActionsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 16,
  },
  detailsButton: {
      backgroundColor: '#6c757d',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
  },
  detailsButtonText: {
      color: '#fff',
      fontWeight: '500',
  },
  noOrdersText: {
      textAlign: 'center',
      color: '#888',
      marginTop: 20,
      fontSize: 16,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f4ede8",
    backgroundColor: "#fcf9f7",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    color: "#9b7049",
  },
});

export default VendorHomeScreen;