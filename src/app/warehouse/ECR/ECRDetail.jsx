import {
  BarsOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  KeyOutlined,
  WarningOutlined,
  BorderOutlined,
  CheckSquareOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  Result,
  Checkbox,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { APIHelper } from "../../../constants/APIHelper";
import {
  AxiosWithLoading,
  ErrorPrinter,
  playErrorSound,
  playSound,
  ScanListener,
  SpinLoading,
  SpinLoadingByUseState,
} from "../../../constants/Common";
import MobilePageShell from "../../../constants/MobilePageShell";
import UnauthorizedPage from "../../../constants/Unauthorized";
const { Text } = Typography;
export const ECRDetail = () => {
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const [data, setData] = useState([]);
  const { id } = useParams();
  const [isIssuedVerified, setIsIssuedVerified] = useState({});
  const [totalRecords, setTotalRecords] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [ecrRemarkList, setEcrRemarkList] = useState([]);
  const [ecrStatusList, setEcrStatusList] = useState([]);
  const [ownerTypeList, setOwnerTypeList] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedSerialNoObject, setSelectedSerialNoObject] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [warehouseList, setWarehouseList] = useState([]);
  const [showUnverifiedOnly, setShowUnverifiedOnly] = useState(false);

  const getDriverECRDetailSerial = async () => {
    setIsLoading(true);
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.4-1",
        ECRNo: id,
        IsIssuedVerified: isIssuedVerified.id,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getDriverECRDetailSerial", body)
      );
      setData(responseParam.data.Records.records);
      setTotalRecords(responseParam.data.TotalRecords.records[0]);
    } catch (error) {
      ErrorPrinter(error, history);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchParamData = async () => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.4-1",
        ParamList: "ECRRemarkList,ECRStatusList,OwnerTypeList,Warehouse",
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/common/ParameterData", body)
      );
      setEcrRemarkList(responseParam.data.ECRRemarkList);
      setEcrStatusList(responseParam.data.ECRStatusList);
      setOwnerTypeList(responseParam.data.OwnerTypeList);
      setWarehouseList(responseParam.data.Warehouse.slice(1));

      setAuthorized(true);
    } catch (error) {
      let data = ErrorPrinter(error, history);
      setAuthorized(false);
    }
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

const handleSubmit = (barcode) => {
  const trimmed = barcode.trim();

  // find if serial exists in data
  const record = data.find((record) => record.SerialNo === trimmed);

  if (!record) {
    message.error(`Serial ${trimmed} not found`);
    playErrorSound();
    return;
  }
  // check if already converted (IsOnSiteVerified is true)
  if (record.OnSiteVerified) {
    message.error(`Serial ${trimmed} is already converted`);
    playErrorSound();
    return;
  }

  // if serial found, check if already selected
  const alreadySelected = rowSelection.selectedRowKeys.includes(trimmed);
  if (alreadySelected) {
    message.info(`Serial ${trimmed} already selected`);
    playSound();
    return;
  }

  // add to selection
  const newKeys = [...rowSelection.selectedRowKeys, trimmed];
  rowSelection.onChange(newKeys);

  message.success(`Serial ${trimmed} selected`);
  playSound();
};


  const confirmLeave = () => {
    history.goBack();
  };

  const handleEdit = (record) => {
    setShowEditModal(true);
    setSelectedSerialNoObject({ ...record, ECRNo: id });
  };

  useEffect(() => {
    getDriverECRDetailSerial();
    fetchParamData();
  }, []);

const handleConvertDriverECR = async () => {
  if (!warehouse) {
    message.warning("Please select a warehouse first");
    return;
  }

  setIsLoading(true);
  try {
    const selectedSerialNos = data
      .filter((record) =>
        rowSelection.selectedRowKeys.includes(record.SerialNo)
      )
      .map((record) => record.SerialNo);

    let body = {
      ECR3No: id,
      SerialNos: selectedSerialNos,
      Warehouse: warehouse, // 👈 include warehouse in the payload
    };

    const responseParam = await AxiosWithLoading(
      APIHelper.postConfig("/logistics/convertDriverEcrToECR", body)
    );

    if (responseParam.status === 200) {
      message.success("Driver ECR converted successfully");
      setSelectedRowKeys([]);
      getDriverECRDetailSerial();
    } else {
      message.error("Driver ECR convert failed");
    }
  } catch (error) {
    getDriverECRDetailSerial();
    ErrorPrinter(error, history);
  } finally {
    setIsLoading(false);
  }
};
  const filteredData = showUnverifiedOnly
  ? data.filter((record) => !record.OnSiteVerified)
  : data;

  const columns = [
    {
      title: "Serial No",
      dataIndex: "SerialNo",
      key: "SerialNo",
    },
    {
      title: "Empty",
      dataIndex: "IsFullGasReturn",
      key: "IsFullGasReturn",
      render: (value) =>
        value ? (
          <Tooltip title="Full">
            <CloseCircleOutlined style={{ color: "red", fontSize: 16 }} />
          </Tooltip>
        ) : (
          <Tooltip title="Empty">
            <CheckCircleOutlined style={{ color: "green", fontSize: 16 }} />
          </Tooltip>
        ),
    },
    {
      title: "Faulty",
      dataIndex: "Remarks",
      key: "Remarks",
      render: (value) =>
        value === "Faulty Container" ? (
          <Tooltip title="Faulty">
            <WarningOutlined style={{ color: "red" }} />
          </Tooltip>
        ) : (
          <Tooltip title="OK">
            <CheckCircleFilled style={{ color: "green" }} />
          </Tooltip>
        ),
    },
    {
      title: "Verified",
      dataIndex: "OnSiteVerified",
      key: "OnSiteVerified",
      render: (value) =>
        !value ? (
          <Tooltip title="Full">
            <CloseCircleOutlined style={{ color: "red", fontSize: 16 }} />
          </Tooltip>
        ) : (
          <Tooltip title="Empty">
            <CheckCircleOutlined style={{ color: "green", fontSize: 16 }} />
          </Tooltip>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <MobilePageShell
        title={"Convert Driver ECR"}
        onBack={() => history.goBack()}
      >
        <SpinLoadingByUseState loading={isLoading} />
      </MobilePageShell>
    );
  }
  if (data.length > 0 && data[0].ECRStatusID == "C") {
    return (
      <MobilePageShell title={"Driver ECR"} onBack={() => history.goBack()}>
        <Result
          status="success"
          title="Driver ECR Processed"
          subTitle="The document has been successfully processed by the store."
          extra={[
            <Button type="primary" key="home" onClick={() => history.goBack()}>
              Back to Home
            </Button>,
          ]}
        />
      </MobilePageShell>
    );
  }
  if (data.length > 0 && data[0].ECRStatusID == "D") {
    return (
      <MobilePageShell title={"Driver ECR"} onBack={() => history.goBack()}>
        <Result
          status="error"
          title="Requires Manual Solve"
          subTitle="Please use Operation LMS to solve."
          extra={[
            <Button type="primary" key="home" onClick={() => history.goBack()}>
              Back to Home
            </Button>,
          ]}
        />
      </MobilePageShell>
    );
  }

  if (!authorized) {
    return (
      <MobilePageShell
        title={"Convert Driver ECR"}
        onBack={() => history.push("/")}
      >
        <UnauthorizedPage
          title={"View Convert Driver ECR Detail (4.8.3, 1)"}
          subTitle={"Sorry, you are not authorized to access this page."}
        />
      </MobilePageShell>
    );
  } else {
    return (
      <MobilePageShell
        title="Convert Driver ECR"
        onBack={confirmLeave}
        onRefresh={getDriverECRDetailSerial}
        rightHeaderComponent={
          <>
          <Button
            type="text"
            icon={
              showUnverifiedOnly ? <CheckSquareOutlined /> : <BorderOutlined />
            }
            title="Toggle Completed DO Filter"
            onClick={() => setShowUnverifiedOnly(!showUnverifiedOnly)}
            style={{
              float: "right",
              color: "#fff",
              backgroundColor: showUnverifiedOnly ? "#377188" : "transparent",
              border: "none",
            }}
          />
          <Button
            icon={<EditOutlined style={{ color: "#fff" }} />}
            onClick={() => setShowModal(true)}
            type="default"
            style={{ backgroundColor: "#377188", border: "none" }}
          />
          </>
        }
      >
        {isLoading ? (
          <SpinLoading />
        ) : (
          <>
            <div style={{ padding: "16px" }}>
              <SerialNoEntryModal
                showModal={showModal}
                setShowModal={setShowModal}
                onSearch={(serial) => handleSubmit(serial)}
              />
              <SerialNoEditModal
                visible={showEditModal}
                onClose={() => {
                  setShowEditModal(false);
                  setSelectedSerialNoObject(null);
                }}
                selectedSerialObject={selectedSerialNoObject}
                RemarkList={ecrRemarkList}
                StatusList={ecrStatusList}
                onRefresh={getDriverECRDetailSerial}
              />
              <SpinLoading />

              <Card
                title="Serial List"
                variant="outlined"
                styles={{ padding: "16px" }}
              >
                <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
                  <Col span={8}>
                    <Space>
                      <BarsOutlined style={{ color: "#1890ff" }} />
                      <Text>Total: {totalRecords.Total}</Text>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space>
                      <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                      <Text>Faulty: {totalRecords.NoOfFaulty}</Text>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      <Text>OK: {totalRecords.NoOfNonFaulty}</Text>
                    </Space>
                  </Col>
                </Row>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {filteredData.map((record) => {
                    const isSelected = rowSelection.selectedRowKeys.includes(
                      record.SerialNo
                    );

                    return (
                      <Card
                        key={record.SerialNo}
                        size="small"
                        onClick={() => {
                          // only allow selection toggle through scan, not tapping the card
                          if (isSelected) {
                            // allow deselect on tap
                            const newKeys = rowSelection.selectedRowKeys.filter(
                              (k) => k !== record.SerialNo
                            );
                            rowSelection.onChange(newKeys);
                          }
                        }}
                        style={{
                          border: isSelected
                            ? "2px solid #1890ff"
                            : "1px solid #f0f0f0",
                          borderRadius: 12,
                          cursor: isSelected ? "pointer" : "default",
                          transition: "border 0.2s ease",
                        }}
                      >
                        {/* Header: Serial No + Gas Type + Checkbox */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              Serial No: {record.SerialNo}
                            </div>
                            <div style={{ color: "#888", fontSize: 13 }}>
                              Gas Type: {record.GasTypeName || "—"}
                            </div>
                          </div>

                          <Checkbox
                            checked={isSelected}
                            disabled={!isSelected} // disable if not selected
                            onChange={(e) => {
                              e.stopPropagation();
                              if (!e.target.checked) {
                                // allow only uncheck
                                const newKeys =
                                  rowSelection.selectedRowKeys.filter(
                                    (k) => k !== record.SerialNo
                                  );
                                rowSelection.onChange(newKeys);
                              }
                            }}
                          />
                        </div>

                        {/* Empty */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "2px 0",
                          }}
                        >
                          <span>
                            <b>Empty:</b>
                          </span>
                          {record.IsFullGasReturn ? (
                            <Tooltip title="Full">
                              <CloseCircleOutlined style={{ color: "red" }} />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Empty">
                              <CheckCircleOutlined style={{ color: "green" }} />
                            </Tooltip>
                          )}
                        </div>

                        {/* Faulty */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "2px 0",
                          }}
                        >
                          <span>
                            <b>Faulty:</b>
                          </span>
                          {record.Remarks === "Faulty Container" ? (
                            <Tooltip title="Faulty">
                              <WarningOutlined style={{ color: "red" }} />
                            </Tooltip>
                          ) : (
                            <Tooltip title="OK">
                              <CheckCircleFilled style={{ color: "green" }} />
                            </Tooltip>
                          )}
                        </div>

                        {/* Converted */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "2px 0",
                          }}
                        >
                          <span>
                            <b>Converted:</b>
                          </span>
                          {record.OnSiteVerified ? (
                            <Tooltip title="Converted">
                              <CheckCircleOutlined style={{ color: "green" }} />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Not Converted">
                              <CloseCircleOutlined style={{ color: "red" }} />
                            </Tooltip>
                          )}
                        </div>

                        {/* Edit Button */}
                        <div style={{ marginTop: 8, textAlign: "right" }}>
                          <Tooltip title="Edit">
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(record);
                              }}
                            />
                          </Tooltip>
                        </div>
                      </Card>
                    );
                  })}
                </div>

<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
<Select
  placeholder="Select Warehouse"
  value={warehouse}
  onChange={setWarehouse}
  style={{ width: 160 }}
>
  {warehouseList.map((wh) => (
    <Option key={wh.id} value={wh.id}>
      {wh.text}
    </Option>
  ))}
</Select>

  <Button
    type="primary"
    loading={isLoading}
    onClick={handleConvertDriverECR}
    disabled={!rowSelection.selectedRowKeys.length}
  >
    Convert to ECR2
  </Button>
</div>
              </Card>
            </div>
            <ScanListener onScanDetected={(barcode) => handleSubmit(barcode)} />
          </>
        )}
      </MobilePageShell>
    );
  }
};

const SerialNoEditModal = ({
  visible,
  onClose,
  selectedSerialObject,
  RemarkList,
  StatusList,
  onRefresh,
}) => {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    console.log(values);
    console.log(selectedSerialObject);
    onClose();
    try {
      const body = {
        ECRNo: selectedSerialObject.ECRNo,
        SerialNo: selectedSerialObject.SerialNo,
        IsFullGasReturn: values.status == "1" ? true : false,
        Remarks: values.remark,
      };
      console.log(body);

      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/modifyDriverECRDetail", body)
      );
      if (responseParam.status === 200) {
        message.success(
          "Serial :" + selectedSerialObject.SerialNo + " updated successfully"
        );
        onRefresh();
        return;
      } else {
        message.error(
          "Serial :" + selectedSerialObject.SerialNo + " updated failed"
        );
        return;
      }
    } catch (error) {
      ErrorPrinter(error, history);
      message.error(
        "Serial :" + selectedSerialObject.SerialNo + " updated failed"
      );
    }
    form.resetFields();
  };
  useEffect(() => {
    if (visible && selectedSerialObject) {
      form.setFieldsValue({
        remark: selectedSerialObject.Remarks || "",
        status: selectedSerialObject.IsFullGasReturn ? "1" : "0",
      });
    }
  }, [visible, selectedSerialObject, form]);

  return (
    <Modal
      title={`Edit Serial No: ${selectedSerialObject?.SerialNo}`}
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Faulty?" name="remark">
          <Select placeholder="Select Remark">
            {RemarkList.map(({ id, text }) => (
              <Select.Option key={id || "no-id"} value={id}>
                {text}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Cylinder Status"
          name="status"
          rules={[{ required: true, message: "Please select a status" }]}
        >
          <Select placeholder="Select Status">
            {StatusList.map(({ id, text }) => (
              <Select.Option key={id} value={id}>
                {text}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
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
