import {
  DeleteOutlined,
  PlusOutlined,
  PrinterOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  Row,
  Space,
  Tag,
  Typography,
  message
} from "antd";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { APIHelper } from "../../../constants/APIHelper";
import {
  AxiosWithLoading,
  ErrorPrinter,
  ScanListener,
  SpinLoadingByUseState,
  playSound
} from "../../../constants/Common";
import MobilePageShell from "../../../constants/MobilePageShell";
import UnauthorizedPage from "../../../constants/Unauthorized";
import { useBrowserPrint } from "../../hooks/useBrowserPrint";
const { Title, Text } = Typography;

export const QueryInventoryDetail = () => {
  const [supplierCode, setSupplierCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authorized, setAuthorized] = useState(true);
  const history = useHistory();
  const [data, setData] = useState([]);
  const { warehouse, prodCode } = useParams();
  const [productDetails, setProductDetails] = useState({});
  const [supplierCodes, setSupplierCodes] = useState([]);
  const { selectedPrinter, print } = useBrowserPrint();
  const initial = async () => {
    setIsLoading(true);
    try {
      let body = {
        ProdCode: prodCode,
        Warehouse: warehouse,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getinventoryDetail", body)
      );

      setData(responseParam.data);
      setProductDetails(responseParam.data.productDetails[0] || {});
      setSupplierCodes(responseParam.data.SupplierCodes || []);
      setAuthorized(true);
    } catch (error) {
      console.log(error);
      let data = ErrorPrinter(error, history);
      setAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initial();
  }, []);

  if (isLoading) {
    return (
      <MobilePageShell
        title={"Query Inventory"}
        onBack={() => history.push("/")}
      >
        <SpinLoadingByUseState loading={isLoading} />
      </MobilePageShell>
    );
  }

  const InsertSupplierCode = async (ProdCode, SupplierCode) => {
    try {
      let body = {
        ProdCode: ProdCode,
        SupplierCode: SupplierCode,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/insertProductMapping", body)
      );
    } catch (error) {
      console.log(error);
      let data = ErrorPrinter(error, history);
    }
  };
  const DeleteSupplierCode = async (ProdCode, SupplierCode) => {
    try {
      let body = {
        ProdCode: ProdCode,
        SupplierCode: SupplierCode,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/deleteProductMapping", body)
      );
    } catch (error) {
      console.log(error);
      let data = ErrorPrinter(error, history);
    }
  };

  const handleSupplerCodeAddButtonClick = () => {
    InsertSupplierCode(prodCode, supplierCode);
    playSound();
    initial();
    setSupplierCode("");
  };
  const handleSupplierCodeScan = (barcode) => {
    InsertSupplierCode(prodCode, barcode);
    playSound();
    initial();
  };

  const handlePrintProductLabelClick = async () => {
    try {
      //find the correct label code
      const labelCode = data.barcodeLabel.find(
        (label) => label.LabelName === "Product"
      )?.LabelCode;
      const replacements = buildReplacements(data.productDetails[0]);
      const finalLabel = applyReplacements(labelCode, replacements);
      console.log("Final Label: ", finalLabel);
      if (!selectedPrinter) {
        message.error("No printer selected");
        return;
      }
      print(finalLabel);
    } catch (error) {
      console.log("Print Error: ", error);
      ErrorPrinter(error, history);
    }
  };
  //product label replacements
  function buildReplacements(item) {
    return {
      ProductName: item.ProdName || "",
      ProdCode: item.ProdCode || "",
      UOM: item.UOM || "",
      CustomLabel: "",
    };
  }

  function applyReplacements(label, replacements) {
    let output = label;

    for (const [key, value] of Object.entries(replacements)) {
      const pattern = new RegExp(key, "g");
      output = output.replace(pattern, value);
    }

    return output;
  }

  if (!authorized) {
    return (
      <MobilePageShell
        title={"Query Inventory"}
        onBack={() => history.push("/")}
      >
        <UnauthorizedPage
          title={"View Query Inventory nextScan FunctionID (58)"}
          subTitle={"Sorry, you are not authorized to access this page."}
        />
      </MobilePageShell>
    );
  } else {
    return (
      <MobilePageShell
        title={"Query Inventory"}
        onBack={() => history.goBack()}
        onRefresh={() => initial()}
      >
        <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
          {/* Product Summary */}
          <Card
            bordered={false}
            style={{ background: "#f5f5f5", marginBottom: 16 }}
          >
            <Row justify="space-between">
              <Col>
                <Title level={5} style={{ margin: 0 }}>
                  {warehouse}
                </Title>
              </Col>
              <Col>
                <Text strong>{productDetails.ProdCode}</Text>
              </Col>
            </Row>

            <Text type="secondary">{productDetails.ProdName}</Text>
          </Card>

          {/* Product Printing */}
          <Title level={5}>Product Printing</Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row align="middle" justify="space-between">
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    shape="circle"
                    onClick={handlePrintProductLabelClick}
                  />
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Product Mapping */}
          <Title level={5}>Product Mapping</Title>

          <Card size="small" style={{ marginBottom: 24 }}>
            {/* Add New Supplier Code */}
            <Row gutter={8} align="middle">
              <Col flex="auto">
                <Text strong>Supplier Code</Text>

                <Space.Compact style={{ width: "100%", marginTop: 4 }}>
                  <Input
                    value={supplierCode}
                    onChange={(e) => setSupplierCode(e.target.value)}
                    placeholder="Enter supplier code"
                    onPressEnter={handleSupplerCodeAddButtonClick}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleSupplerCodeAddButtonClick}
                  />
                </Space.Compact>
              </Col>
            </Row>
            {/* Existing Supplier Codes */}
            {supplierCodes.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary">Existing Supplier Codes</Text>

                <Space
                  direction="vertical"
                  style={{ width: "100%", marginTop: 8 }}
                >
                  {supplierCodes.map((item) => (
                    <div
                      key={item.SupplierCode}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#fafafa",
                        padding: "6px 10px",
                        borderRadius: 6,
                      }}
                    >
                      <Tag style={{ margin: 0 }}>{item.SupplierCode}</Tag>

                      <DeleteOutlined
                        onClick={() => {
                          DeleteSupplierCode(prodCode, item.SupplierCode);
                          initial();
                        }}
                        style={{ color: "#ff4d4f", cursor: "pointer" }}
                      />
                    </div>
                  ))}
                </Space>
              </div>
            )}
          </Card>

          {/* Available Batch / Serial */}
          <Title level={5}>Available Batch / Serial</Title>
          {data.batch && data.batch.SAPItem_Available_Batch.length > 0 ? (
            data.batch.SAPItem_Available_Batch.map((batchItem) => (
              <BatchInfoCard
                key={batchItem.BatchNumber}
                batchItem={batchItem}
              />
            ))
          ) : data.serial && data.serial.SAPItem_Available_Serial.length > 0 ? (
            data.serial.SAPItem_Available_Serial.map((serialItem) => (
              <SerialInfoCard key={serialItem.Serial} serialItem={serialItem} />
            ))
          ) : (
            <Card
              style={{
                background: "#fadb14",
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              No available batch or serial in W02.
            </Card>
          )}
          {/* <BatchInfoCard/> */}
        </div>
        <ScanListener
          onScanDetected={(barcode) => {
            handleSupplierCodeScan(barcode);
          }}
        />
      </MobilePageShell>
    );
  }
};

const BatchInfoCard = (batchItem) => {
  batchItem = batchItem.batchItem;
  return (
    <Card size="small" style={{ width: "100%" }} bodyStyle={{ padding: 8 }}>
      {/* Top Row */}
      <Row gutter={8}>
        <Col span={8} style={{ textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Bin
          </Text>
          <div style={{ fontSize: 13 }}>
            {" "}
            {batchItem.SAPItem_Available_Batch_Bin
              ? batchItem.SAPItem_Available_Batch_Bin
              : "-"}
          </div>
        </Col>

        <Col span={8} style={{ textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Batch No
          </Text>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {batchItem.BatchNumber ? batchItem.BatchNumber : "-"}
          </div>
        </Col>

        <Col span={8} style={{ textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Quantity
          </Text>
          <div style={{ fontSize: 13 }}>
            {" "}
            {batchItem.Quantity ? batchItem.Quantity : "-"}
          </div>
        </Col>
      </Row>

      {/* Bottom Section */}
      <Card
        size="small"
        bordered={false}
        style={{
          marginTop: 8,
          background: "#f5f5f5",
          borderRadius: 6,
        }}
        bodyStyle={{ padding: 8 }}
      >
        <Descriptions
          column={1}
          size="small"
          labelStyle={{ fontSize: 12 }}
          contentStyle={{ fontSize: 12 }}
        >
          <Descriptions.Item label="Manufacturing Date">
            {batchItem.ManufacturingDate ? batchItem.ManufacturingDate : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Expiry Date">
            {batchItem.ExpiryDate ? batchItem.ExpiryDate : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Admission Date">
            {batchItem.AdmissionDate ? batchItem.AdmissionDate : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Card>
  );
};

const SerialInfoCard = (serialItem) => {
  serialItem = serialItem.serialItem;
  return (
    <Card size="small" style={{ width: "100%" }} bodyStyle={{ padding: 8 }}>
      {/* Top Row */}
      {/* Top Row (2 columns) */}
      <Row gutter={8}>
        <Col span={12} style={{ textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Bin
          </Text>
          <div style={{ fontSize: 13 }}>
            {serialItem.SAPItem_Available_Serial
              ? serialItem.SAPItem_Available_Serial_Bin
              : "-"}
          </div>
        </Col>

        <Col span={12} style={{ textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Serial
          </Text>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {serialItem.Serial ? serialItem.Serial : "-"}
          </div>
        </Col>
      </Row>

      {/* Bottom Section */}
      <Card
        size="small"
        bordered={false}
        style={{
          marginTop: 8,
          background: "#f5f5f5",
          borderRadius: 6,
        }}
        bodyStyle={{ padding: 8 }}
      >
        <Descriptions
          column={1}
          size="small"
          labelStyle={{ fontSize: 12 }}
          contentStyle={{ fontSize: 12 }}
        >
          <Descriptions.Item label="Manufacturing Date">
            {serialItem.ManufacturingDate ? serialItem.ManufacturingDate : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Expiry Date">
            {serialItem.ExpiryDate ? serialItem.ExpiryDate : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Admission Date">
            {serialItem.AdmissionDate ? serialItem.AdmissionDate : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Card>
  );
};
