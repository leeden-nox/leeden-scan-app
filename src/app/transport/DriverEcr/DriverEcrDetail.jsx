import {
  BarsOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  KeyOutlined,
  WarningOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Result,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  Tag,
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
import SignaturePadJpeg from "../../../constants/SignaturePadJpeg";
import UnauthorizedPage from "../../../constants/Unauthorized";
import SignaturePreviewModal from "../../../constants/SignaturePreviewModal";
import dayjs from "dayjs";
const { Text, Title } = Typography;
export const DriverECRDetail = () => {
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
  const [selectedSerialNoObject, setSelectedSerialNoObject] = useState(null);
  const [visibleSignatureModal, setVisibleSignatureModal] = useState(false);
  const [driverECRFaultyReasons, setDriverECRFaultyReasons] = useState([]);
  const [physicalECRNo, setPhysicalECRNo] = useState("");
  const getDriverECRDetailSerial = async () => {
    setIsLoading(true);
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.3-1",
        ECRNo: id,
        IsIssuedVerified: isIssuedVerified.id,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getDriverECRDetailSerial", body)
      );
      setData(responseParam.data.Records.records);
      if(responseParam.data.Records.records.length > 0){
        setPhysicalECRNo(responseParam.data.Records.records[0].PhysicalECRNo || "");
      }
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
        ModuleAccessID: "4.8.3-1",
        ParamList:
          "ECRRemarkList,ECRStatusList,OwnerTypeList,DriverECRFaultyReasons",
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/common/ParameterData", body)
      );
      setEcrRemarkList(responseParam.data.ECRRemarkList);
      setEcrStatusList(responseParam.data.ECRStatusList);
      setOwnerTypeList(responseParam.data.OwnerTypeList);
      setDriverECRFaultyReasons(responseParam.data.DriverECRFaultyReasons);
      setAuthorized(true);
    } catch (error) {
      let data = ErrorPrinter(error, history);
      setAuthorized(data.authorized);
    }
  };

  const handleDelete = async (serialNo) => {
    setIsLoading(true);
    try {
      let body = {
        ECRNo: id,
        SerialNo: serialNo,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/deleteDriverECRDetailSerial", body)
      );

      if (responseParam.status === 200) {
        message.success("Serial :" + serialNo + " deleted successfully");
        await getDriverECRDetailSerial();
        return;
      } else {
        message.error("Serial :" + serialNo + " deleted failed");
        return;
      }
    } catch (error) {
      message.error("Serial :" + serialNo + " deleted failed");
      ErrorPrinter(error, history);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (barcode) => {
    setIsLoading(true);
    try {
      let body = {
        ECRNo: id,
        SerialNo: barcode,
      };

      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/insertDriverECRDetailSerial", body)
      );

      if (responseParam.status === 200) {
        message.success("Serial :" + barcode + " updated successfully");
        await getDriverECRDetailSerial();
        playSound();
        return;
      } else {
        message.error("Serial :" + barcode + " updated failed");
        playErrorSound();
        return;
      }
    } catch (error) {
      ErrorPrinter(error, history);
      message.error("Serial :" + barcode + " updated failed");
      playErrorSound();
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmLeave = () => {
    history.goBack();
  };

  const handleEdit = (record) => {
    setShowEditModal(true);
    setSelectedSerialNoObject({ ...record, ECRNo: id });
  };

  const handleAssignPhysicalECRNo = async (value) => {
    setIsLoading(true);
    try {
      let body = {
        ECRNo: id,
        PhysicalECRNo: value,
      };

      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/setPhysicalECRNoByECRNo", body)
      );

      if (responseParam.status === 200) {
        message.success("Physical ECR No :" + value + " updated successfully");
        await getDriverECRDetailSerial();
        playSound();
        return;
      } else {
        message.error("Physical ECR No :" + value + " updated failed");
        playErrorSound();
        return;
      }
    } catch (error) {
      ErrorPrinter(error, history);
      message.error("Physical ECR No :" + value + " updated failed");
      playErrorSound();
      return;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getDriverECRDetailSerial();
    fetchParamData();
  }, []);

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
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
              onClick={() => handleDelete(record.SerialNo)}
            />
          </Tooltip>
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
      <MobilePageShell title={"Driver ECR"} onBack={() => history.goBack()}>
        <SpinLoadingByUseState loading={isLoading} />
      </MobilePageShell>
    );
  }
  if (data.length > 0 && data[0].SignatureImageBlob != null) {
    return (
      <MobilePageShell title={"Driver ECR"} onBack={() => history.goBack()}>
<>
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
      padding: "2rem",
    }}
  >
    <div
      style={{
        backgroundColor: "#f6ffed",
        border: "1px solid #b7eb8f",
        borderRadius: 12,
        padding: "2rem",
        maxWidth: 600,
        width: "100%",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <CheckCircleOutlined style={{ fontSize: "2em", color: "#52c41a" }} />

      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Title level={4} style={{ margin: 0, color: "#389e0d" }}>
          Driver ECR Signed
        </Title>

        <Text style={{ color: "#595959" }}>
          This Driver ECR was Signed on{" "}
          <strong>{dayjs(data[0].SignatureDate).format("DD-MM-YY HH:mm")}</strong>.
        </Text>

        <Tag color="green">Signed</Tag>

        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="middle"
            style={{
              backgroundColor: "#389e0d",
              borderColor: "#389e0d",
            }}
            onClick={() => setVisibleSignatureModal(true)}
          >
            View Signature
          </Button>
        </Space>

        {/* ✅ New Section: Physical ECR No Input */}
        <Space>
          <Input
            placeholder="Enter Physical ECR No"
            value={physicalECRNo}
            onChange={(e) => setPhysicalECRNo(e.target.value)}
          />

        </Space>
        <Space>
                    <Button
            type="primary"
            onClick={() => handleAssignPhysicalECRNo(physicalECRNo)}
          >
            Assign Physical ECR No
          </Button>
        </Space>
      </Space>
    </div>

    <SignaturePreviewModal
      visible={visibleSignatureModal}
      setVisible={setVisibleSignatureModal}
      base64String={data[0].SignatureImageBlob}
    />
  </div>
</>

      </MobilePageShell>
    );
  }

  if (!authorized) {
    return (
      <MobilePageShell title={"Driver ECR"} onBack={() => history.push("/")}>
        <UnauthorizedPage
          title={"View Driver ECR Detail (4.8.3, 1)"}
          subTitle={"Sorry, you are not authorized to access this page."}
        />
      </MobilePageShell>
    );
  } else {
    return (
      <MobilePageShell
        title="Driver ECR"
        onBack={confirmLeave}
        onRefresh={getDriverECRDetailSerial}
        rightHeaderComponent={
          <>
            <SignDriverECRButton
              ECRNo={id}
              onRefresh={getDriverECRDetailSerial}
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
                driverECRFaultyReasons={driverECRFaultyReasons}
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
      setRemarkText(selectedSerialObject.QRRemark || null)
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
            rules={[
              { required: true, message: "Please specify other reason" },
            ]}
          >
            <Input placeholder="Specify other faulty reason" />
          </Form.Item>
        )

        }
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

const SignDriverECRButton = ({ ECRNo, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const signDO = async (Signature) => {
    setIsModalOpen(false);
    try {
      let body = {
        ECRNo: ECRNo,
        Signature: Signature,
      };
      await AxiosWithLoading(APIHelper.postConfig("/logistics/eSignECR", body));
      onRefresh();
      setIsModalOpen(false);
      message.success("ECR Signed successfully");
    } catch (error) {
      ErrorPrinter(error);
    }
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => setIsModalOpen(true)}
        icon={<CheckCircleOutlined style={{ color: "#fff" }} />}
        style={{ backgroundColor: "#377188", border: "none" }}
      />
      <SignaturePadJpeg
        visible={isModalOpen}
        setVisible={setIsModalOpen}
        modalTitle={`E-Sign for ECR #${ECRNo}`}
        onSubmit={(jpegDataUrl) => {
          signDO(jpegDataUrl);
        }}
      />
    </>
  );
};
