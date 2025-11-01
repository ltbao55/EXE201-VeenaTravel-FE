import React from "react";
import LeftSidebar from "../components/LeftSidebar";
import Profile from "../components/Profile";
import "../styles/ChatPage.css";

const ProfilePage: React.FC = () => {
  return (
    <div className="chat-page">
      <div className="chat-container">
        <LeftSidebar activeItem="profile" />
        <Profile />
      </div>
    </div>
  );
};

export default ProfilePage;
