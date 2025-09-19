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
} from "antd";
import MobilePageShell from "../../../constants/MobilePageShell";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import UnauthorizedPage from "../../../constants/Unauthorized";
import { EditOutlined, KeyOutlined,CheckCircleOutlined } from "@ant-design/icons";
const { Title } = Typography;
import dayjs from "dayjs";
export const CustSiteVerificationDetailSerial = () => {
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const [data, setData] = useState([]);
  const { id, doNo } = useParams();
  const [isIssuedVerifiedList, setIsIssuedVerifiedList] = useState([]);
  const [isIssuedVerified, setIsIssuedVerified] = useState({});
  const [DOData, setDOData] = useState({});
  const getOnSiteScheduleIDVerification = async () => {
    getDOData();
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.2-1",
        DONo: doNo,
        IsIssuedVerified: isIssuedVerified.id,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig(
          "/logistics/getCustSiteVerificationDeliveryOrderSerial",
          body
        )
      );
      setData(responseParam.data.records);
    } catch (error) {
      ErrorPrinter(error, history);
    }
  };
  const getDOData = async () => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.2-1",
        DONo: doNo,
      };

      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getDeliveryOrderByDONo", body)
      );
      setDOData(responseParam.data.records[0]);
    } catch (error) {
      ErrorPrinter(error, history);
    }
  };

  const fetchParamData = useCallback(async (isSending) => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.2-1",
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
        ModuleAccessID: "4.8.2-1",
        DONo: doNo,
        SerialNo: barcode,
        CoyID: 1,
      };
      console.log(body);

      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig(
          "/logistics/updateCustSiteVerificationDeliveryOrderSerial",
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

  const handleMarkDelivered = async () => {
    console.log('testing')
    try {
      const body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.2-1",
        DONo: doNo,
        CreatedDate: DOData.CreatedDate,
        ModifiedDate: DOData.ModifiedDate,
        DeliveredDate: dayjs().format("DD/MM/YYYY HH:mm")
      };

      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig(
          "/logistics/updateCustSiteVerificationMarkDeliveredDO",
          body
        )
      );

      if (responseParam.status === 200) {
        message.success("Marked as Delivered successfully");
      } else {
        message.error("Mark Delivered failed");
      }
    } catch (error) {
        console.log(error)
      message.error("Mark Delivered failed");
    }
  };

  if (!authorized) {
    return (
      <MobilePageShell
        title={"Cust site Verification"}
        onBack={() => history.push("/")}
        onRefresh={initial}
      >
        <UnauthorizedPage
          title={"View Cust site Verification Detail (4.8.1, 1)"}
          subTitle={"Sorry, you are not authorized to access this page."}
        />
      </MobilePageShell>
    );
  } else {
    return (
      <MobilePageShell
        title="Cust site Verification"
        onBack={confirmLeave}
        onRefresh={getOnSiteScheduleIDVerification}
        rightHeaderComponent={
          <>
            <ConfirmDeliveryButton handleMarkDelivered={handleMarkDelivered} />
            <Button
              icon={<EditOutlined style={{ color: "#fff" }} />}
              onClick={() => setShowModal(true)}
              type="default"
              style={{ backgroundColor: "#377188", border: "none" }}
            />
          </>
        }
      >
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

const ConfirmDeliveryButton = ({ handleMarkDelivered }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);
  const handleConfirm = async () => {
    setIsModalOpen(false);
    await handleMarkDelivered(); // uses today's date
  };

  return (
    <>
      <Button type="primary" onClick={showModal} icon={<CheckCircleOutlined style={{ color: "#fff" }} />} style={{ backgroundColor: "#377188", border: "none" }}/>



      <Modal
        title="Confirm Delivery"
        open={isModalOpen}
        onOk={handleConfirm}
        onCancel={handleCancel}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Do you want to confirm delivery?</p>
        <p style={{ color: "red", fontWeight: 500 }}>
          This action is not reversible.
        </p>
      </Modal>
    </>
  );
};
