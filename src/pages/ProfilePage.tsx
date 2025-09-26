import React from "react";
import LeftSidebar from "../components/LeftSidebar";
import ChatMap from "../components/ChatMap";
import Profile from "../components/Profile";
import "../styles/ChatPage.css";

const ProfilePage: React.FC = () => {
  // Define favorite destinations for the profile map
  const favoriteDestinations = [
    {
      name: "Nhà thờ Đức Bà Sài Gòn",
      lat: 10.7797,
      lng: 106.699,
      description: "Địa điểm yêu thích - Kiến trúc Gothic tuyệt đẹp",
      type: "waypoint" as const,
    },
    {
      name: "Chợ Bến Thành",
      lat: 10.772,
      lng: 106.698,
      description: "Đã ghé thăm - Trải nghiệm mua sắm tuyệt vời",
      type: "waypoint" as const,
    },
    {
      name: "Đà Lạt",
      lat: 11.9404,
      lng: 108.4583,
      description: "Muốn đến - Thành phố ngàn hoa mộng mơ",
      type: "destination" as const,
    },
  ];

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Left Sidebar Navigation */}
        <LeftSidebar activeItem="profile" />

        {/* Profile Section - replaces chat-sidebar */}
        <Profile />

        {/* Map Container */}
        <div className="map-container">
          <ChatMap destinations={favoriteDestinations} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
