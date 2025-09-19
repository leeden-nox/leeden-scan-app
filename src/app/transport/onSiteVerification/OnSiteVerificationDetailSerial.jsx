import { useState, useEffect, useCallback, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  AxiosWithLoading,
  ErrorPrinter,
  playErrorSound,
  playSound,
  ScanListener,
  SpinLoading,
} from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import {
  Select,
  Table,
  Card,
  Space,
  Typography,
  message,
  Button,
  Modal,
  Input,
  Progress,
} from "antd";
import MobilePageShell from "../../../constants/MobilePageShell";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import UnauthorizedPage from "../../../constants/Unauthorized";
import { EditOutlined, KeyOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;
export const OnSiteVerificationDetailSerial = () => {
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const [data, setData] = useState([]);
  const { id, doNo } = useParams();
  const [isIssuedVerifiedList, setIsIssuedVerifiedList] = useState([]);
  const [isIssuedVerified, setIsIssuedVerified] = useState({});
  const [totalRecords, setTotalRecords] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const getOnSiteScheduleIDVerification = async () => {
    setIsLoading(true);
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.1-1",
        DONo: doNo,
        IsIssuedVerified: isIssuedVerified.id,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig(
          "/logistics/getOnSiteVerificationDeliveryOrderSerial",
          body
        )
      );

      setData(responseParam.data.Records.records);
      setTotalRecords(responseParam.data.TotalRecords.records[0]);
    } catch (error) {
      ErrorPrinter(error, history);
    }
    finally{
        setIsLoading(false);
    }
  };

  const fetchParamData = useCallback(async (isSending) => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.1-1",
        ParamList: "IsVerified",
      };
      let responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/common/ParameterData", body)
      );
      setIsIssuedVerifiedList(responseParam.data.IsVerified);
      setIsIssuedVerified(responseParam.data.IsVerified[0]);
      if (isSending) {
        setAuthorized(true);
      }
    } catch (error) {
      let data = ErrorPrinter(error, history);
      setAuthorized(data.authorized);
    }
  }, []);
  const confirmLeave = () => {
    history.goBack();
  };
  useEffect(() => {
    fetchParamData(true);
  }, []);
  useEffect(() => {
    if (isIssuedVerified.id !== undefined) {
      getOnSiteScheduleIDVerification();
    }
  }, [isIssuedVerified.id]);
  const handleSubmit = async (barcode) => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.1-1",
        ScheduleID: id,
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
        await getOnSiteScheduleIDVerification();
        playSound();
        return true;
      } else {
        message.error("Serial :" + barcode + " updated failed");
        playErrorSound();
        return false;
      }
    } catch (error) {
      let data = ErrorPrinter(error, history);
      //   setAuthorized(data.authorized);
      message.error("Serial :" + barcode + " updated failed");
      playErrorSound();
      return false;
    }
  };
  const getContainerTypeLabel = (type) => {
    switch (type) {
      case "C":
        return "CYL";
      case "R":
        return "M-Rack";
      case "T":
        return "T-Rack";
      default:
        return type;
    }
  };
  const columns = [
    {
      title: "Serial No",
      dataIndex: "SerialNo",
      key: "SerialNo",
    },
    {
      title: "Verified",
      dataIndex: "IsIssuedVerified",
      key: "IsIssuedVerified",
      render: (value) =>
        value ? (
          <CheckOutlined style={{ color: "green" }} />
        ) : (
          <CloseOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "Container Type",
      dataIndex: "ContainerTypeID",
      key: "ContainerTypeID",
      render: (value) => getContainerTypeLabel(value),
    },
  ];

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
        title="On Site Verification"
        onBack={confirmLeave}
        onRefresh={getOnSiteScheduleIDVerification}
        rightHeaderComponent={
          <Button
            icon={<EditOutlined style={{ color: "#fff" }} />}
            onClick={() => setShowModal(true)}
            type="default"
            style={{ backgroundColor: "#377188", border: "none" }}
          />
        }
      >
        {isLoading ? <SpinLoading /> : 
        <>
        <div style={{ padding: "16px" }}>
          <SerialNoEntryModal
            showModal={showModal}
            setShowModal={setShowModal}
            onSearch={(serial) => handleSubmit(serial)}
          />
          <SpinLoading />
          <Card
            style={{ marginBottom: 24 }}
            styles={{ padding: "16px" }}
            variant="outlined"
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {/* Progress Bar Section */}
              <div>
                <Text style={{ color: "#595959" }}>
                  Verification Progress:{" "}
                  <strong>
                    {totalRecords.TotalVerified} / {totalRecords.TotalSerial}{" "}
                    verified
                  </strong>
                </Text>
                <Progress
                  percent={
                    totalRecords.TotalSerial > 0
                      ? Math.round(
                          (totalRecords.TotalVerified /
                            totalRecords.TotalSerial) *
                            100
                        )
                      : 0
                  }
                  status={
                    totalRecords.TotalVerified === totalRecords.TotalSerial
                      ? "success"
                      : "active"
                  }
                  strokeColor="#52c41a"
                  trailColor="#d9d9d9"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </div>

              {/* Dropdown Section */}
              <Title level={5} style={{ marginBottom: 8 }}>
                Filter by Verification Status
              </Title>
              <Select
                placeholder="Select status"
                style={{ width: "100%" }}
                value={isIssuedVerified?.id}
                onChange={(id) => {
                  const selected = isIssuedVerifiedList.find(
                    (item) => item.id === id
                  );
                  setIsIssuedVerified(selected);
                }}
              >
                {isIssuedVerifiedList.map(({ id, text }) => (
                  <Select.Option key={id} value={id}>
                    {text}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Card>

          <Card
            title="Serial Verification List"
            variant="outlined"
            styles={{ padding: "16px" }}
          >
            <Table
              columns={columns}
              dataSource={data}
              rowKey="SerialNo"
              pagination={false}
              size="middle"
            />
          </Card>
        </div>
        <ScanListener onScanDetected={(barcode) => handleSubmit(barcode)} />
            </>}
      </MobilePageShell>
    );
  }
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
        <Button
          type="primary"
          onClick={handleSearch}
          style={{ backgroundColor: "#377188" }}
        >
          Search
        </Button>
      </Space>
    </Modal>
  );
};
