import { useEffect, useState,useRef } from "react";
import {  Table, Card, message, Row, Col, Space,Button,Modal,Input,Tag } from "antd";
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
import { RightOutlined } from "@ant-design/icons";
import { PathLink } from "../../../constants/PathLink";
import UnauthorizedPage from "../../../constants/Unauthorized";
import { EditOutlined, KeyOutlined } from "@ant-design/icons";
export const CustSiteVerificationDetail = () => {
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
        ModuleAccessID: "4.8.2-1",
        CoyID: 1,
        ScheduleID: scheduleID,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getCustSiteScheduleIDVerification", body)
      );
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
    DOStatusName, // new status field
  } = record;

  const formattedDate = RequiredDate
    ? moment(RequiredDate).format("DD-MM-YYYY")
    : "";

  const statusColorMap = {
    scheduled: "blue",
    delivered: "green",
    invoice: "gold",
  };

  const statusColor = statusColorMap[DOStatusName?.toLowerCase()] || "default";

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
      <Row align="middle" justify="space-between">
        {/* Left: DO Info */}
        <Col flex="1">
          <Space direction="vertical" size={4}>
            <Title level={5} style={{ marginBottom: 0, color: "#5d6168" }}>
              {DONo}
            </Title>
            <Tag color={statusColor} style={{ marginBottom: 4 }}>
              {DOStatusName}
            </Tag>
            <Text style={{ color: "#5d6168" }}>{formattedDate}</Text>
            <Text italic style={{ color: "#5d6168" }}>
              {AccountName}
            </Text>
            <Text style={{ whiteSpace: "pre-line", color: "#c7c7c7" }}>
              {DeliveryAddressText}
            </Text>
          </Space>
        </Col>

        {/* Right: Verification Block */}
        <Col flex="0 0 120px" style={{ textAlign: "center" }}>
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

        {/* Arrow */}
        <Col flex="0 0 10px">
          <Space direction="vertical" size={6} align="center">
            <RightOutlined style={{ fontSize: "1em", color: "#c37f7f" }} />
          </Space>
        </Col>
      </Row>
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
