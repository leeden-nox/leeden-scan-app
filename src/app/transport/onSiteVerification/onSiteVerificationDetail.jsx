import { useEffect, useState,useRef } from "react";
import {  Table, Card, message, Row, Col, Space,Button,Modal,Input,Tag,Progress } from "antd";
import { useHistory, useParams } from "react-router-dom";
import moment from "moment";
import {
  AxiosWithLoading,
  ErrorPrinter,
  playErrorSound,
  SpinLoading,
} from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import MobilePageShell from "../../../constants/MobilePageShell";
import { Typography, Divider } from "antd";
import { PathLink } from "../../../constants/PathLink";
import { playSound } from "../../../constants/Common";
import { ScanListener } from "../../../constants/Common";
import UnauthorizedPage from "../../../constants/Unauthorized";
import { EditOutlined, KeyOutlined } from "@ant-design/icons";
export const OnSiteVerificationDetail = () => {
const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const scheduleID = useParams().id.split("?")[0];
  const initial = async () => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.1-1",
        CoyID: 1,
        ScheduleID: scheduleID,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getOnSiteScheduleIDVerification", body)
      );
      setData(responseParam.data.records);
      setAuthorized(true);
    } catch (error) {
      ErrorPrinter(error);
      setAuthorized(false);
    }
  };

  const handleDetailClicked = (DONo) => {
    history.push(PathLink.onSiteVerification + "/" + scheduleID + "/" + DONo);
  };

  const handleSubmit = async (barcode) => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.1-1",
        ScheduleID: scheduleID,
        SerialNo: barcode,
        CoyID: 1,
      };

      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig(
          "/logistics/updateOnSiteVerificationDeliveryOrderSerial",
          body
        )
      );

      if (responseParam.status === 200) {
        message.success("Serial :" + barcode + " updated successfully");
        await initial();
        playSound();
        return true;
      } else {
        message.error("Serial :" + barcode + " updated failed");

        return false;
      }
    } catch (error) {
      playErrorSound();
      message.error("Serial :" + barcode + " updated failed");
      return false;
    }
  };

  const columns = [
    {
      title: "DO",
      dataIndex: "DONo",
      render: (_, record) => (
        <DeliveryCard record={record} onClick={handleDetailClicked}/>
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
        title={"On Site Verification"}
        onBack={() => history.push("/")}
        onRefresh={initial}
      >
        <UnauthorizedPage
          title={"View On Site Verification Detail (4.8.1, 1)"}
          subTitle={"Sorry, you are not authorized to access this page."}
        />
      </MobilePageShell>
    );
  } else {
    return (
      <MobilePageShell
        title={"On Site Verification"}
        onBack={confirmLeave}
        onRefresh={() => initial()}
        rightHeaderComponent={
          <Button
            icon={<EditOutlined style={{ color: "#fff" }} />}
            onClick={() => setShowModal(true)}
            type="default"
            style={{ backgroundColor: "#377188", border: "none" }}
          />
        }
      >
        <SerialNoEntryModal
          showModal={showModal}
          setShowModal={setShowModal}
          onSearch={(serial) => handleSubmit(serial)}
        />
        <>
          <SpinLoading />
          <Table
          rowKey={(record) => record.DONo}
            dataSource={data}
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
        <ScanListener onScanDetected={(barcode) => handleSubmit(barcode)} />
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
  const percentVerified = TotalSerial > 0
    ? Math.round((verifiedCount / TotalSerial) * 100)
    : 0;

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
            <Text italic style={{ color: "#5d6168" }}>{AccountName}</Text>
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
                  CYL: <span style={{ color: "#c37f7f" }}>{TotalUnverifiedCyl}</span>
                </Text>
                <Text italic style={{ color: "#edc6c4" }}>
                  M-Rack: <span style={{ color: "#c37f7f" }}>{TotalUnverifiedRack}</span>
                </Text>
                <Text italic style={{ color: "#edc6c4" }}>
                  T-Rack: <span style={{ color: "#c37f7f" }}>{TotalUnverifiedTransportRack}</span>
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
          <strong>{verifiedCount} / {TotalSerial} serials verified</strong>
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



const SerialNoEntryModal = ({ showModal, setShowModal, onSearch }) => {
  const [serialNo, setSerialNo] = useState("");
  const inputRef = useRef(null);
  const { Text } = Typography;
  useEffect(() => {
    if (showModal) {
      setSerialNo("");
      setTimeout(() => inputRef.current?.focus(), 150); // focus for mobile
    }
  }, [showModal]);

  const handleSearch = () => {
    const value = serialNo.trim();
    if (value) {
      onSearch(value); // 🔍 pass to parent for processing
      setShowModal(false);
    }
  };

  return (
    <Modal
      open={showModal}
      footer={null}
      centered
      closable={false}
      maskClosable={false}
      width="100%"
      style={{
        maxWidth: "100vw",
        padding: "32px 16px",
        textAlign: "center",
      }}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        },
      }}
    >
      <KeyOutlined style={{ fontSize: 48, color: "#377188" }} />
      <Text strong>Enter Serial Number</Text>
      <Text type="secondary">
        Barcode damaged? Enter manually to verify for the cylinder.
      </Text>

      <Input
        ref={inputRef}
        value={serialNo}
        onChange={(e) => setSerialNo(e.target.value)}
        onPressEnter={handleSearch}
        placeholder="Type Serial Number"
        style={{ textAlign: "center", maxWidth: 320 }}
      />

      <Space>
        <Button onClick={() => setShowModal(false)}>Cancel</Button>
        <Button type="primary" onClick={handleSearch} style={{ backgroundColor: "#377188" }}>
          Search
        </Button>
      </Space>
    </Modal>
  );
};
