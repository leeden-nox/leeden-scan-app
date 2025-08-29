import "./MobilePageShell.css"; // Assuming you have some styles for the shell
import {
  Layout,
  Button,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { PullToRefresh } from "antd-mobile";
const { Header, Content } = Layout;

const MobilePageShell = ({ title, onRefresh, onBack, rightHeaderComponent, children }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const el = document.querySelector(".d-flex.bg-white");
    if (el) {
      el.style.maxWidth = "100vw";
      el.style.overflowX = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="full-screen-override">
      <Layout style={{ height: "100vh", flexDirection: "column" }}>
        <Header
          style={{
            backgroundColor: "#377188",
            padding: "0 16px",
            height: 60,
            lineHeight: "60px",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left side: back button and title */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              style={{ fontSize: "16px", color: "#fff" }}
            />
            <span style={{ marginLeft: 16, fontWeight: 500, fontSize: 18, color: "#fff" }}>
              {title}
            </span>
          </div>

          {/* Right side: Custom action button */}
          {rightHeaderComponent && (
            <div style={{ display: "flex", alignItems: "center" }}>
              {rightHeaderComponent}
            </div>
          )}
        </Header>

        <Content
          className="hide-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: 0,
          }}
        >
          <PullToRefresh onRefresh={onRefresh} style={{ padding: "16px" }}>
            {children}
          </PullToRefresh>
        </Content>
      </Layout>
    </div>
  );
};


export default MobilePageShell;
