import {
  Button,
  Card,
  Typography,
  DatePicker,
  Row,
  Col,
  Space,
  Select,
  Modal,
  Input,
  Form,
  Checkbox,
  Tooltip,
  message,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { APIHelper } from "../../../constants/APIHelper";
import {
  AxiosWithLoading,
  ErrorPrinter,
  SpinLoading,
  SpinLoadingByUseState,
  ScanListener,
  playSound,
  playErrorSound,
} from "../../../constants/Common";
import MobilePageShell from "../../../constants/MobilePageShell";
import UnauthorizedPage from "../../../constants/Unauthorized";
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
  CheckSquareOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
const { Text } = Typography;
export const ECR = () => {
  const [data, setData] = useState([]);
  const [authorized, setAuthorized] = useState(true);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs()); // default to today
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSerialNoObject, setSelectedSerialNoObject] = useState(null);
  const [ecrRemarkList, setEcrRemarkList] = useState([]);
  const [ecrStatusList, setEcrStatusList] = useState([]);
  const [driverECRFaultyReasons, setDriverECRFaultyReasons] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [totalRecords, setTotalRecords] = useState({});
  const [warehouse, setWarehouse] = useState(null);
  const [warehouseList, setWarehouseList] = useState([]);
  const [showUnverifiedOnly, setShowUnverifiedOnly] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSerialNosList, setSelectedSerialNosList] = useState([]);
  const [showConvertResultModal, setShowConvertResultModal] = useState(false);
  const [convertResults, setConvertResults] = useState([]);
  //api calls
  const initial = async () => {
    setIsLoading(true);
    fetchParamData();
    try {
      let body = {
        Date: selectedDate.format("YYYY-MM-DD"), //using today's date
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getDriverECRForConvert", body)
      );
      setData(responseParam.data.Table);
    } catch (error) {
      ErrorPrinter(error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchParamData = async () => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.4-1",
        ParamList:
          "ECRRemarkList,ECRStatusList,OwnerTypeList,Warehouse,DriverECRFaultyReasons",
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/common/ParameterData", body)
      );
      setEcrRemarkList(responseParam.data.ECRRemarkList);
      setEcrStatusList(responseParam.data.ECRStatusList);
      setWarehouseList(responseParam.data.Warehouse.slice(1));
      setDriverECRFaultyReasons(responseParam.data.DriverECRFaultyReasons);
      setAuthorized(true);
    } catch (error) {
      console.log(error);
      let data = ErrorPrinter(error, history);
      setAuthorized(false);
    }
  };
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
        SerialList: selectedSerialNos,
        Warehouse: warehouse, // 👈 include warehouse in the payload
      };

      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/convertDriverEcrToECR", body)
      );

      if (responseParam.status === 200) {
        setConvertResults(responseParam.data.Created);
        setShowConfirmModal(false);
        setShowConvertResultModal(true);
        message.success("Driver ECR converted successfully");
        setSelectedRowKeys([]);
        initial();
      } else {
        message.error("Driver ECR convert failed");
      }
    } catch (error) {
      initial();
      ErrorPrinter(error, history);
    } finally {
      setIsLoading(false);
    }
  };
  //-----------------------------------------------------------------------------------------------------
  const handleEdit = (record) => {
    setShowEditModal(true);
    setSelectedSerialNoObject({ ...record });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };
  //Scan SerialNo
  const handleSubmit = (barcode) => {
    const trimmed = barcode.trim().toUpperCase();

    // find if serial exists in data
    const record = data.find((record) => record.SerialNo.toUpperCase() === trimmed);

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
    if (showModal) {
      setShowModal(false);
    }
    // add to selection
    const newKeys = [...rowSelection.selectedRowKeys, trimmed];
    rowSelection.onChange(newKeys);

    message.success(`Serial ${trimmed} selected`);
    playSound();
  };
  //-----------------------------------------------------------------------------------------
  const handleDateChange = (date) => {
    if (!date || date.isSame(selectedDate, "day")) return;
    setSelectedDate(date);
  };
  const filteredData = showUnverifiedOnly
    ? data.filter((record) => !record.OnSiteVerified)
    : data;

  useEffect(() => {
    initial();
  }, [selectedDate]);

  if (isLoading) {
    return (
      <MobilePageShell
        title={"Convert Driver ECR"}
        onBack={() => history.push("/")}
        onRefresh={() => initial()}
      >
        <SpinLoadingByUseState loading={isLoading} />
      </MobilePageShell>
    );
  }

  if (!authorized) {
    return (
      <MobilePageShell
        title={"Convert Driver ECR"}
        onBack={() => history.push("/")}
        onRefresh={() => initial()}
      >
        <UnauthorizedPage
          title={"View Convert Driver ECR (4.8.4, 1)"}
          subTitle={"Sorry, you are not authorized to access this page."}
        />
      </MobilePageShell>
    );
  } else {
    return (
      <MobilePageShell
        title="Convert Driver ECR"
        onBack={() => history.push("/")}
        onRefresh={() => {
          initial();
        }}
        rightHeaderComponent={
          <>
            <Button
              type="text"
              icon={
                showUnverifiedOnly ? (
                  <CheckSquareOutlined />
                ) : (
                  <BorderOutlined />
                )
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
        <div style={{ padding: "12px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
            >
              Select Date
            </label>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
            />
          </div>
          <>
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
                style={{
                  whiteSpace: "normal",
                  height: "auto",
                  lineHeight: "20px",
                  width: 90, // adjust width until it wraps nicely
                }}
                onClick={() => {
                  const selectedSerialNos = data.filter((record) =>
                    rowSelection.selectedRowKeys.includes(record.SerialNo)
                  );
                  setSelectedSerialNosList(selectedSerialNos);
                  setShowConfirmModal(true);
                }}
                disabled={!rowSelection.selectedRowKeys.length}
              >
                Convert to ECR
              </Button>
            </div>
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
                onRefresh={initial}
                driverECRFaultyReasons={driverECRFaultyReasons}
              />
              <ConvertConfirmModal
                open={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConvertDriverECR}
                selectedSerialNos={selectedSerialNosList}
              />
              <ConversionResultModal
                visible={showConvertResultModal}
                onClose={() => setShowConvertResultModal(false)}
                convertResults={convertResults}
              />
              <SpinLoading />

              <Card
                title="Serial List"
                variant="outlined"
                styles={{ padding: "16px" }}
              >
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
              </Card>
            </div>
            <ScanListener onScanDetected={(barcode) => handleSubmit(barcode)} />
          </>
        </div>
      </MobilePageShell>
    );
  }
};
//Modals
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
const SerialNoEditModal = ({
  visible,
  onClose,
  selectedSerialObject,
  RemarkList,
  StatusList,
  onRefresh,
  driverECRFaultyReasons,
}) => {
  const [form] = Form.useForm();
  const [selectedRemark, setSelectedRemark] = useState(null);
  const [remarkText, setRemarkText] = useState("");
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
        FaultyReason:
          values.faultyReason === "Others"
            ? values.otherFaultyReason || ""
            : values.faultyReason || "",
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
        faultyReason: selectedSerialObject.QRRemark || null,
      });
      setSelectedRemark(selectedSerialObject.Remarks || null);
      setRemarkText(selectedSerialObject.QRRemark || null);
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
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={(changedValues) => {
          if (changedValues.remark !== undefined) {
            setSelectedRemark(changedValues.remark);
          }
          if (changedValues.faultyReason !== undefined) {
            setRemarkText(changedValues.faultyReason);
          }
        }}
      >
        <Form.Item label="Faulty?" name="remark">
          <Select placeholder="Select Remark">
            {RemarkList.map(({ id, text }) => (
              <Select.Option key={id || "no-id"} value={id}>
                {text}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {selectedRemark === "Faulty Container" && (
          <Form.Item
            label="Reason for Faulty"
            name="faultyReason"
            rules={[
              { required: true, message: "Please select a faulty reason" },
            ]}
          >
            <Select placeholder="Select Faulty Reason">
              {driverECRFaultyReasons.map(({ id, text }) => (
                <Select.Option key={id} value={text}>
                  {text}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        {remarkText === "Others" && (
          <Form.Item
            label="Please specify other reason"
            name="otherFaultyReason"
            rules={[{ required: true, message: "Please specify other reason" }]}
          >
            <Input placeholder="Specify other faulty reason" />
          </Form.Item>
        )}
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
const ConvertConfirmModal = ({
  open,
  onClose,
  onConfirm,
  selectedSerialNos,
}) => {
  //const [open, setOpen] = useState(false);
  const total = selectedSerialNos.length;
  const faulty = selectedSerialNos.filter(
    (x) => x.Remarks && x.Remarks.trim() !== ""
  ).length;
  const ok = total - faulty;
  const fullGas = selectedSerialNos.filter((x) => x.IsFullGasReturn).length;

  return (
    <>
      <Modal
        title="Confirm Cylinder Conversion"
        open={open}
        onOk={onConfirm}
        onCancel={onClose}
        okText="Confirm Conversion"
        cancelText="Cancel"
      >
        <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
          <Col xs={12} sm={12} md={12} lg={6}>
            <Space>
              <BarsOutlined style={{ color: "#1890ff" }} />
              <Text>Total: {total}</Text>
            </Space>
          </Col>

          <Col xs={12} sm={12} md={12} lg={6}>
            <Space>
              <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
              <Text>Faulty: {faulty}</Text>
            </Space>
          </Col>

          <Col xs={12} sm={12} md={12} lg={6}>
            <Space>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              <Text>OK: {ok}</Text>
            </Space>
          </Col>

          <Col xs={12} sm={12} md={12} lg={6}>
            <Space>
              <ReloadOutlined style={{ color: "#faad14" }} />
              <Text>Full Gas Return: {fullGas}</Text>
            </Space>
          </Col>
        </Row>

        <Text type="secondary">
          Please confirm that the numbers above match the scanned cylinders
          before proceeding with conversion.
        </Text>
      </Modal>
    </>
  );
};

const ConversionResultModal = ({ visible, onClose, convertResults }) => {
  if (!visible) return null;
  const [loading, setIsLoading] = useState(false);
  const { Title, Text } = Typography;
  const [data, setData] = useState([]);
  // 🧩 Static mock data — replace with API result later
  const ecrResults = [
    { ECRNo: "ECR250012-1", Status: "Closed" },
    { ECRNo: "ECR250012-3", Status: "Discrepancy" },
  ];

  const columns = [
    {
      title: "ECR No",
      dataIndex: "ECRNo",
      key: "ECRNo",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Status",
      dataIndex: "ECRStatusName",
      key: "ECRStatusName",
      render: (status) => {
        switch (status) {
          case "Closed":
            return (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Closed
              </Tag>
            );
          case "Discrepancy":
            return (
              <Tag icon={<CloseCircleOutlined />} color="error">
                Discrepancy
              </Tag>
            );
          default:
            return <Tag>{status}</Tag>;
        }
      },
    },
  ];
  const fetchResult = async () => {
    setIsLoading(true);
    try {
      let body = {
        ECR2NoList: convertResults,
      };

      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getECR2Results", body)
      );

      if (responseParam.status === 200) {
        setData(responseParam.data.Table);
      }
    } catch (error) {
      ErrorPrinter(error, history);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    //api here
    fetchResult();
  }, []);

  return (
    <>
      <Modal
        title={<Title level={4}>ECR Conversion Results</Title>}
        open={visible}
        onOk={onClose}
        onCancel={onClose}
        width={700}
        okText="Close"
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text type="secondary">
            Below is the summary of all ECRs created during this conversion:
          </Text>

          <Table
            columns={columns}
            dataSource={data}
            rowKey="ECRNo"
            pagination={false}
            size="middle"
            bordered
          />

          <Text type="secondary">
            ✅ Closed – conversion successful. ❌ Discrepancy – (please manually
            solve in operation LMS).
          </Text>
        </Space>
      </Modal>
    </>
  );
};

//------------------------------------------------------------------------------------------------------
