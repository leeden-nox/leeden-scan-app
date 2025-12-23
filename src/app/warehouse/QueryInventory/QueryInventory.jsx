import { EnvironmentOutlined, FileOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Segmented,
  Select,
  Typography,
  Tag,
  Space,
  Input,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { APIHelper } from "../../../constants/APIHelper";
import {
  AxiosWithLoading,
  ErrorPrinter,
  ScanListener,
  SpinLoading,
  SpinLoadingByUseState,
  playSound,
} from "../../../constants/Common";
import MobilePageShell from "../../../constants/MobilePageShell";
import UnauthorizedPage from "../../../constants/Unauthorized";
const { Text } = Typography;

export const QueryInventory = () => {
  const [data, setData] = useState([]);
  const [authorized, setAuthorized] = useState(true);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [totalRecords, setTotalRecords] = useState({});
  const [warehouse, setWarehouse] = useState(null);
  const [warehouseList, setWarehouseList] = useState([]);
  const [view, setView] = useState("warehouse");
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  //api calls
  const fetchParamData = async () => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.4-1", //TODO : replace with actual ModuleAccessID
        ParamList: "Warehouse",
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/common/ParameterData", body)
      );
      setWarehouseList(responseParam.data.Warehouse.slice(1));
      setAuthorized(true);
    } catch (error) {
      console.log(error);
      let data = ErrorPrinter(error, history);
      setAuthorized(false);
    }
  };
  const handleSearch = async () => {
    if (!warehouse) {
      message.warning("Please select a warehouse");
      return;
    }
    try {
      let body = {
        ProdCode: productCode,
        ProdName: productName,
        Warehouse: warehouse,
      };
      setIsLoading(true);
      const response = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getqueryinventory", body)
      );
      console.log(response.data);
      setData(response.data);
    } catch (error) {
      console.log(error);
      ErrorPrinter(error, history);
    } finally {
      setIsLoading(false);
    }
  };
  //-----------------------------------------------------------------------------------------------------
  const bottomToggleStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "8px",
    background: "#fff",
    borderTop: "1px solid #f0f0f0",
  };

  //Scan ProductCode
  const handleSubmit = (barcode) => {
    setProductCode(barcode);
    handleSearch();
    playSound();
  };
  //-----------------------------------------------------------------------------------------

  useEffect(() => {
    fetchParamData();
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
      <MobilePageShell title="Query Inventory" onBack={() => history.push("/")}>
        {view == "warehouse" && (
          <div>
            <>
              <Card style={{ padding: "16px" }}>
                {/* Product Code */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <label style={{ fontWeight: 500, width: 100 }}>
                    Product Code
                  </label>
                  <Input
                    placeholder="Enter Product Code"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    style={{ flex: 1, width: "160px" }}
                  />
                </div>

                {/* Product Name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <label style={{ fontWeight: 500, width: 100 }}>
                    Product Name
                  </label>
                  <Input
                    placeholder="Enter Product Name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    style={{ flex: 1, width: "160px" }}
                  />
                </div>

                {/* Warehouse + Search */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontWeight: 500, width: 100 }}>
                    Warehouse
                  </label>
                  <Select
                    placeholder="Select Warehouse"
                    value={warehouse}
                    onChange={setWarehouse}
                    style={{ flex: 1, width: "160px" }}
                  >
                    {warehouseList.map((wh) => (
                      <Option key={wh.id} value={wh.id}>
                        {wh.text}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div
                  style={{ display: "flex", alignItems: "flex-end", gap: 8 }}
                >
                  <Button
                    type="primary"
                    loading={isLoading}
                    style={{
                      whiteSpace: "normal",
                      lineHeight: "20px",
                      backgroundColor: "#377188",
                    }}
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </div>
              </Card>

              <div>
                <SpinLoading />

                <Card
                  title="Search Result"
                  variant="outlined"
                  styles={{ padding: "16px" }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {data.map((record) => (
                      <ProductCard key={record.ProductCode} record={record} />
                    ))}
                  </div>
                </Card>
              </div>
              <ScanListener
                onScanDetected={(barcode) => handleSubmit(barcode)}
              />
            </>
          </div>
        )}
        {view == "location" &&           <div>
            <>
              <Card style={{ padding: "16px" }}>
                {/* Product Code */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <label style={{ fontWeight: 500, width: 100 }}>
                    Product Code
                  </label>
                  <Input
                    placeholder="Enter Product Code"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    style={{ flex: 1, width: "160px" }}
                  />
                </div>

                {/* Product Name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <label style={{ fontWeight: 500, width: 100 }}>
                    Product Name
                  </label>
                  <Input
                    placeholder="Enter Product Name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    style={{ flex: 1, width: "160px" }}
                  />
                </div>

                {/* Warehouse + Search */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontWeight: 500, width: 100 }}>
                    Warehouse
                  </label>
                  <Select
                    placeholder="Select Warehouse"
                    value={warehouse}
                    onChange={setWarehouse}
                    style={{ flex: 1, width: "160px" }}
                  >
                    {warehouseList.map((wh) => (
                      <Option key={wh.id} value={wh.id}>
                        {wh.text}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div
                  style={{ display: "flex", alignItems: "flex-end", gap: 8 }}
                >
                  <Button
                    type="primary"
                    loading={isLoading}
                    style={{
                      whiteSpace: "normal",
                      lineHeight: "20px",
                      backgroundColor: "#377188",
                    }}
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </div>
              </Card>

              <div>
                <SpinLoading />

                <Card
                  title="Search Result"
                  variant="outlined"
                  styles={{ padding: "16px" }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {data.map((record) => (
                      <ProductCard key={record.ProductCode} record={record} />
                    ))}
                  </div>
                </Card>
              </div>
              <ScanListener
                onScanDetected={(barcode) => handleSubmit(barcode)}
              />
            </>
          </div>}
        <div style={bottomToggleStyle}>
          <Segmented
            options={[
              {
                label: "By Warehouse",
                value: "warehouse",
                icon: <FileOutlined />,
              },
              {
                label: "By Location",
                value: "location",
                icon: <EnvironmentOutlined />,
              },
            ]}
            block
            value={view}
            onChange={setView}
          />
        </div>
      </MobilePageShell>
    );
  }
};

const ProductCard = (record) => {
  record = record.record;
  const trackingLabel = record.TrackedByBatch
    ? "BATCH"
    : record.TrackedBySerial
    ? "SERIAL"
    : "NON BATCHSERIAL";
  const color = {
    blueLight: "#61c1c5",
    green: "#5cb85c",
    orange: "#e67300",
  };

  const trackingColor = record.TrackedByBatch
    ? color.orange // Batch
    : record.TrackedBySerial
    ? color.blueLight // Serial
    : color.green; // Non BatchSerial

  return (
    <Card hoverable bodyStyle={{ padding: 12 }} style={{ width: "100%" }}>
      {/* Product Code */}
      <Text strong>{record.ProductCode}</Text>

      {/* Product Name */}
      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.ProductName}
        </Text>
      </div>

      {/* Bottom section */}
      <div
        style={{
          marginTop: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space size={4}>
          <Tag>{record.UOM}</Tag>
          <Tag color={trackingColor}>{trackingLabel}</Tag>
        </Space>

        <div style={{ textAlign: "right" }}>
          <Text strong>{record.OnHandQty}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            On Hand Quantity
          </Text>
        </div>
      </div>
    </Card>
  );
};
