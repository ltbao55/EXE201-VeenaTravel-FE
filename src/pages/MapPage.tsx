import React from "react";
import Navigation from "../components/common/Navigation";

const MapPage: React.FC = () => {
  return (
    <div className="map-page">
      <Navigation />

      <div className="container">
        <div className="page-header">
          <h1>Lịch trình du lịch</h1>
          <p>Quản lý và theo dõi hành trình của bạn</p>
        </div>

        <div className="itinerary-content">
          <div className="coming-soon">
            <i className="fas fa-map-marked-alt"></i>
            <h2>Tính năng đang phát triển</h2>
            <p>
              Trang lịch trình sẽ sớm có mặt với đầy đủ tính năng quản lý hành
              trình du lịch của bạn.
            </p>
            <div className="features-preview">
              <div className="feature-item">
                <i className="fas fa-route"></i>
                <h3>Lập lịch trình</h3>
                <p>Tạo và quản lý lịch trình chi tiết cho chuyến đi</p>
              </div>
              <div className="feature-item">
                <i className="fas fa-map-pin"></i>
                <h3>Đánh dấu địa điểm</h3>
                <p>Lưu và tổ chức các địa điểm yêu thích</p>
              </div>
              <div className="feature-item">
                <i className="fas fa-share-alt"></i>
                <h3>Chia sẻ lịch trình</h3>
                <p>Chia sẻ kế hoạch với bạn bè và gia đình</p>
              </div>
              <div className="feature-item">
                <i className="fas fa-clock"></i>
                <h3>Theo dõi thời gian</h3>
                <p>Quản lý thời gian và nhắc nhở cho từng hoạt động</p>
              </div>
            </div>
            <button className="btn btn-primary">Quay lại Chat</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
