// src/context/ShiftExchangeContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const ShiftExchangeContext = createContext();

export const ShiftExchangeProvider = ({ children }) => {
  const [yourShifts, setYourShifts] = useState([]);
  const [allAvailableShifts, setAllAvailableShifts] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, this would come from API
  const mockYourShifts = [
    { id: 1, date: "2025-10-15", time: "08:00 AM - 12:00 PM", location: "Icenter 3", ownerId: "user1" },
    { id: 2, date: "2025-10-17", time: "08:00 AM - 12:00 PM", location: "Icenter 1", ownerId: "user1" }
  ];

  const mockAllAvailableShifts = [
    { id: 1, date: "2025-10-15", time: "08:00 AM - 12:00 PM", location: "Icenter 3", ownerId: "user1", ownerName: "You" },
    { id: 2, date: "2025-10-17", time: "08:00 AM - 12:00 PM", location: "Icenter 1", ownerId: "user1", ownerName: "You" },
    { id: 3, date: "2025-10-15", time: "12:00 PM - 04:00 PM", location: "Icenter 3", ownerId: "user2", ownerName: "Alice Johnson" },
    { id: 4, date: "2025-10-17", time: "04:00 PM - 10:00 PM", location: "Icenter 1", ownerId: "user3", ownerName: "Bob Williams" },
    { id: 5, date: "2025-10-22", time: "08:00 AM - 04:00 PM", location: "Main Campus", ownerId: "user4", ownerName: "Charlie Brown" }
  ];

  const mockAllRequests = [
    {
      id: 1,
      requesterId: "user2",
      requesterName: "Alice Johnson",
      yourShift: { id: 1, date: "2025-10-15", time: "08:00 AM - 12:00 PM", location: "Icenter 3", ownerId: "user1" },
      targetShift: { id: 3, date: "2025-10-15", time: "12:00 PM - 04:00 PM", location: "Icenter 3", ownerId: "user2" },
      message: "Can we swap because of a doctor appointment?",
      status: "Pending",
      createdAt: "2025-10-14T10:30:00Z"
    }
  ];

  useEffect(() => {
    // Load initial data
    setYourShifts(mockYourShifts);
    setAllAvailableShifts(mockAllAvailableShifts);
    setAllRequests(mockAllRequests);
    setReceivedRequests(mockAllRequests.filter(req => req.yourShift?.ownerId === "user1"));
    setSentRequests(mockAllRequests.filter(req => req.requesterId === "user1"));
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // In real app: fetch from API
      // const response = await api.get('/shift-exchange/requests');
      // setAllRequests(response.data.all);
      // setReceivedRequests(response.data.received);
      // setSentRequests(response.data.sent);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendShiftExchangeRequest = async (requestData) => {
    setLoading(true);
    try {
      // In real app: POST to API
      // const response = await api.post('/shift-exchange/requests', requestData);
      
      // Mock response
      const newRequest = {
        id: Date.now(),
        ...requestData,
        requesterId: "user1",
        requesterName: "You",
        status: "Pending",
        createdAt: new Date().toISOString()
      };
      
      setAllRequests(prev => [...prev, newRequest]);
      setSentRequests(prev => [...prev, newRequest]);
      
      // In real app, you'd also trigger real-time notifications here
      // socket.emit('new-shift-request', newRequest);
      
    } catch (error) {
      throw new Error('Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, action) => {
    setLoading(true);
    try {
      // In real app: PUT/PATCH to API
      // await api.put(`/shift-exchange/requests/${requestId}`, { action });
      
      // Update local state
      const updatedRequests = allRequests.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'approve' ? 'Accepted' : 'Rejected' }
          : req
      );
      
      setAllRequests(updatedRequests);
      setReceivedRequests(updatedRequests.filter(req => req.yourShift?.ownerId === "user1"));
      
      // In real app, notify the requester
      // socket.emit('request-response', { requestId, action, responderId: "user1" });
      
    } catch (error) {
      throw new Error('Failed to respond to request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShiftExchangeContext.Provider
      value={{
        yourShifts,
        allAvailableShifts,
        sentRequests,
        receivedRequests,
        allRequests,
        loading,
        sendShiftExchangeRequest,
        respondToRequest,
        loadRequests
      }}
    >
      {children}
    </ShiftExchangeContext.Provider>
  );
};

export default ShiftExchangeContext;