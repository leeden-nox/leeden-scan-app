import { useEffect, useState, useRef } from "react";
import {
  Table,
  Card,
  message,
  Row,
  Col,
  Space,
  Button,
  Modal,
  Input,
  Tag,
  Progress,
  Tooltip,
  Switch,
} from "antd";
import { useHistory, useParams } from "react-router-dom";
import moment from "moment";
import {
  AxiosWithLoading,
  ErrorPrinter,
  SpinLoading,
} from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import MobilePageShell from "../../../constants/MobilePageShell";
import { Typography, Divider } from "antd";
import { PathLink } from "../../../constants/PathLink";
import UnauthorizedPage from "../../../constants/Unauthorized";
import { BorderOutlined, CheckSquareOutlined } from "@ant-design/icons";
export const CustSiteVerificationDetail = () => {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const scheduleID = useParams().id.split("?")[0];
  const [showOnlyUnverified, setShowOnlyUnverified] = useState(false);
  const initial = async () => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.2-1",
        CoyID: 1,
        ScheduleID: scheduleID,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig(
          "/logistics/getCustSiteScheduleIDVerification",
          body
        )
      );
      console.log(responseParam.data.records);
      setData(responseParam.data.records);
      setAuthorized(true);
    } catch (error) {
      ErrorPrinter(error);
      setAuthorized(false);
    }
  };

  const handleDetailClicked = (DONo) => {
    history.push(PathLink.custSiteVerification + "/" + scheduleID + "/" + DONo);
  };

  const filteredData = showOnlyUnverified
    ? data.filter((item) => item.DOStatusName != "Completed")
    : data;

  const columns = [
    {
      title: "DO",
      dataIndex: "DONo",
      render: (_, record) => (
        <DeliveryCard record={record} onClick={handleDetailClicked} />
      ),
    },
  ];
  const confirmLeave = () => {
    history.goBack();
  };
  useEffect(() => {
    initial();
  }, [currentPage, pageSize]);
  if (!authorized) {
    return (
      <MobilePageShell
        title={"Cust Site Verification"}
        onBack={() => history.push("/")}
        onRefresh={initial}
      >
        <UnauthorizedPage
          title={"View Cust Site Verification Detail (4.8.2, 1)"}
          subTitle={"Sorry, you are not authorized to access this page."}
        />
      </MobilePageShell>
    );
  } else {
    return (
      <MobilePageShell
        title={"Cust Site Verification"}
        onBack={confirmLeave}
        onRefresh={() => initial()}
        rightHeaderComponent={
          <Button
            type="text"
            icon={
              showOnlyUnverified ? <CheckSquareOutlined /> : <BorderOutlined />
            }
            title="Toggle Completed DO Filter"
            onClick={() => setShowOnlyUnverified(!showOnlyUnverified)}
            style={{
              float: "right",
              color: "#fff",
              backgroundColor: showOnlyUnverified ? "#377188" : "transparent",
              border: "none",
            }}
          />
        }
      >
        <>
          <SpinLoading />
          <Table
            rowKey={(record) => record.DONo}
            dataSource={filteredData}
            columns={columns}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showSizeChanger: true,
              onChange: (page, newPageSize) => {
                setCurrentPage(page);
                setPageSize(newPageSize);
              },
            }}
          />
        </>
      </MobilePageShell>
    );
  }
};

const { Title, Text } = Typography;

const DeliveryCard = ({ record, onClick }) => {
  const {
    DONo,
    RequiredDate,
    AccountName,
    DeliveryAddressText,
    TotalUnverifiedSerial,
    TotalUnverifiedCyl,
    TotalUnverifiedRack,
    TotalUnverifiedTransportRack,
    IsCOPSerial,
    DOStatusName,
    TotalSerial,
  } = record;

  const formattedDate = RequiredDate
    ? moment(RequiredDate).format("DD-MM-YYYY")
    : "";

  const statusColorMap = {
    pending: "blue",
    completed: "green",
  };

  const statusColor = statusColorMap[DOStatusName?.toLowerCase()] || "default";

  const verifiedCount = TotalSerial - TotalUnverifiedSerial;
  const percentVerified =
    TotalSerial > 0 ? Math.round((verifiedCount / TotalSerial) * 100) : 0;

  return (
    <Card
      hoverable
      onClick={() => onClick(DONo)}
      variant="outlined"
      styles={{ body: { padding: "1rem", backgroundColor: "#fdfdfd" } }}
      style={{
        boxShadow: "0 1px 4px rgba(31, 38, 135, 0.1)",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      <Row gutter={[16, 16]}>
        {/* Left Section */}
        <Col span={16}>
          <Space direction="vertical" size={4}>
            <Title level={5} style={{ marginBottom: 0, color: "#5d6168" }}>
              {DONo}
            </Title>
            <Tag color={statusColor}>{DOStatusName}</Tag>
            <Text style={{ color: "#5d6168" }}>{formattedDate}</Text>
            <Text italic style={{ color: "#5d6168" }}>
              {AccountName}
            </Text>
            <Text style={{ whiteSpace: "pre-line", color: "#c7c7c7" }}>
              {DeliveryAddressText}
            </Text>
          </Space>
        </Col>

        {/* Right Section */}
        <Col span={8} style={{ textAlign: "center" }}>
          <Space direction="vertical" size={6} align="center">
            <Text strong style={{ color: "#c37f7f", fontSize: "1.6em" }}>
              {TotalUnverifiedSerial}
            </Text>
            <Text italic style={{ color: "#edc6c4", fontSize: "0.9em" }}>
              Total Unverified
            </Text>

            {!IsCOPSerial ? (
              <>
                <Text italic style={{ color: "#edc6c4" }}>
                  CYL:{" "}
                  <span style={{ color: "#c37f7f" }}>{TotalUnverifiedCyl}</span>
                </Text>
                <Text italic style={{ color: "#edc6c4" }}>
                  M-Rack:{" "}
                  <span style={{ color: "#c37f7f" }}>
                    {TotalUnverifiedRack}
                  </span>
                </Text>
                <Text italic style={{ color: "#edc6c4" }}>
                  T-Rack:{" "}
                  <span style={{ color: "#c37f7f" }}>
                    {TotalUnverifiedTransportRack}
                  </span>
                </Text>
              </>
            ) : (
              <Text italic style={{ color: "#edc6c4", fontWeight: "bold" }}>
                <span style={{ color: "#c37f7f" }}>COP Serial</span>
              </Text>
            )}
          </Space>
        </Col>
      </Row>

      {/* Progress Bar Section */}
      <div style={{ marginTop: 16 }}>
        <Text style={{ color: "#595959" }}>
          Verification Progress:{" "}
          <strong>
            {verifiedCount} / {TotalSerial} serials verified
          </strong>
        </Text>
        <Progress
          percent={percentVerified}
          status={percentVerified === 100 ? "success" : "active"}
          strokeColor="#52c41a"
          trailColor="#d9d9d9"
          showInfo={false}
          style={{ marginTop: 8 }}
        />
      </div>
    </Card>
  );
};
