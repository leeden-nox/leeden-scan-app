import { BarcodeOutlined, EditOutlined, KeyOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { PathLink } from "../../../constants/PathLink";
import { useEffect, useState, useRef } from "react";
import {
  AxiosWithLoading,
  playErrorSound,
  playSound,
} from "../../../constants/Common";

import { APIHelper } from "../../../constants/APIHelper";

import { ErrorPrinter } from "../../../constants/Common";
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  message,
  Form,
  Select,
  Input,
  Modal,
  Row,
  Divider,
} from "antd";
import UnauthorizedPage from "../../../constants/Unauthorized";
import MobilePageShell from "../../../constants/MobilePageShell";
import { ScanListener } from "../../../constants/Common";

export const COPContainerSearch = () => {
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const [selectedSerialNo, setSelectedSerialNo] = useState("");
  const [selectedCylinder, setSelectedCylinder] = useState(null);
  const { Text } = Typography;
  const [showModal, setShowModal] = useState(false);
  const initial = async () => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.17.1-4",
        ParamList: "",
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/common/ParameterData", body),
      );
      setAuthorized(true);
    } catch (error) {
      setAuthorized(false);
      ErrorPrinter(error, history);
    }
  };

  const getCylinder = async (accountCode, serialNo) => {
    try {
      let body = {
        AccountCode: accountCode,
        SerialNo: serialNo,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/searchCOPContainer", body),
      );
      if (
        responseParam.data.Records.records &&
        responseParam.data.Records.records.length > 0
      ) {
        return responseParam.data.Records.records[0];
      } else {
        return null;
      }
    } catch (error) {
      ErrorPrinter(error, history);
    }
  };

  const handleInputSerialNo = async (data) => {
    const accountCodeSerialNo = data.split("_");
    const accountCode = accountCodeSerialNo[0];
    const serialNo = accountCodeSerialNo[1];

    const cylinder = await getCylinder(accountCode, serialNo);
    if (!cylinder) {
      message.error(`${accountCodeSerialNo} not found.`);
      setSelectedCylinder(null);
      setSelectedSerialNo("");
      playErrorSound();
    } else {
      message.success("COP cylinder loaded");
      setSelectedCylinder(cylinder);
      setSelectedSerialNo(data);
      playSound();
    }
  };
  useEffect(() => {
    initial();
  }, []);
  if (!authorized) {
    return (
      <MobilePageShell
        title={"COP Cylinder Search"}
        onBack={() => history.push("/")}
        onRefresh={() => {
          if (selectedSerialNo) handleInputSerialNo(selectedSerialNo);
        }}
      >
        <UnauthorizedPage
          title={"View Cylinder Standard (4.17.1, 4)"}
          subTitle={"Sorry, you are not authorized to access this page."}
        />
      </MobilePageShell>
    );
  } else {
    return (
      <MobilePageShell
        title="COP Cylinder Search"
        onBack={() => history.push("/")}
        onRefresh={() => {
          if (selectedSerialNo != "") handleInputSerialNo(selectedSerialNo);
        }}
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
          onSearch={(serial) => handleInputSerialNo(serial)}
        />
        {selectedCylinder ? (
          <Space
            direction="vertical"
            style={{ width: "100%", padding: "8px 12px" }}
          >
            <Card
              size="small"
              bordered={false}
              bodyStyle={{ padding: 12 }}
              style={{ borderRadius: 8, background: "#FAFAFA" }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                {/* Serial No */}
                <Row justify="space-between">
                  <Text type="secondary">Serial No</Text>
                  <Tag color="blue">{selectedCylinder.SerialNo ?? "-"}</Tag>
                </Row>

                {/* Account */}
                <Row justify="space-between">
                  <Text type="secondary">Account Code</Text>
                  <Tag>{selectedCylinder.AccountCode ?? "-"}</Tag>
                </Row>

                {/* Product */}
                <Row justify="space-between">
                  <Text type="secondary">Product Code</Text>
                  <Text>{selectedCylinder.ProdCode ?? "-"}</Text>
                </Row>

                <Row justify="space-between">
                  <Text type="secondary">Product Name</Text>
                  <Text style={{ maxWidth: 220, textAlign: "right" }}>
                    {selectedCylinder.ProdName ?? "-"}
                  </Text>
                </Row>

                {/* Gas */}
                <Divider style={{ margin: "8px 0" }} />

                <Row justify="space-between">
                  <Text type="secondary">Gas Type ID</Text>
                  <Text>{selectedCylinder.GasTypeID ?? "-"}</Text>
                </Row>

                <Row justify="space-between">
                  <Text type="secondary">Gas Type</Text>
                  <Tag color="cyan">{selectedCylinder.GasTypeName ?? "-"}</Tag>
                </Row>

                {/* Fill Info */}
                <Divider style={{ margin: "8px 0" }} />

                <Row justify="space-between">
                  <Text type="secondary">Fill Pressure</Text>
                  <Text>
                    {selectedCylinder.FillPressure != null
                      ? `${selectedCylinder.FillPressure} ${selectedCylinder.FillUnit}`
                      : "-"}
                  </Text>
                </Row>

                <Row justify="space-between">
                  <Text type="secondary">Max Fill Pressure</Text>
                  <Text>
                    {selectedCylinder.CyldMaxFillPressure != null
                      ? `${selectedCylinder.CyldMaxFillPressure}`
                      : "-"}
                  </Text>
                </Row>

                <Row justify="space-between">
                  <Text type="secondary">Cylinder Volume</Text>
                  <Text>{selectedCylinder.CyldVolume ?? "-"}</Text>
                </Row>

                <Row justify="space-between">
                  <Text type="secondary">Cylinder Standard</Text>
                  <Text>{selectedCylinder.CyldStandard ?? "-"}</Text>
                </Row>

                <Row justify="space-between">
                  <Text type="secondary">Tare Weight</Text>
                  <Text>{selectedCylinder.TareWeight ?? "-"}</Text>
                </Row>

                {/* Dates */}
                <Divider style={{ margin: "8px 0" }} />

                <Row justify="space-between">
                  <Text type="secondary">Last Test Date</Text>
                  <Text>{selectedCylinder.LastTestDate ?? "-"}</Text>
                </Row>

                <Row justify="space-between">
                  <Text type="secondary">Expiry Date</Text>
                  <Text>{selectedCylinder.ExpiryDate ?? "-"}</Text>
                </Row>
              </Space>
            </Card>
          </Space>
        ) : (
          <ScanPrompt />
        )}

        <ScanListener
          onScanDetected={(barcode) => handleInputSerialNo(barcode)}
        />
      </MobilePageShell>
    );
  }
};

const ScanPrompt = () => {
  const { Text } = Typography;
  return (
    <Card
      bordered={false}
      styles={{
        body: {
          padding: "24px 16px",
          textAlign: "center",
          background: "#FAFAFA",
        },
      }}
      style={{
        borderRadius: 8,
        marginTop: 16,
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <BarcodeOutlined style={{ fontSize: 48, color: "#377188" }} />
        <Text strong style={{ fontSize: 16 }}>
          Ready to scan a cylinder
        </Text>
        <Text type="secondary">
          Please scan the serial number to begin verification.
        </Text>
      </Space>
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
        Barcode damaged? Enter manually to search for the cylinder.
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
