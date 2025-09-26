import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, KeyOutlined,WarningOutlined,CheckCircleFilled,BarsOutlined,ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  Row,Col,
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
        APIHelper.postConfig("/logistics/getDriverECR2DetailSerial", body)
      );
      setData(responseParam.data.Records.records);
      setTotalRecords(responseParam.data.TotalRecords.records[0]);
      console.log(responseParam.data.TotalRecords.records[0]);
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
        ParamList: "ECRRemarkList,ECRStatusList,OwnerTypeList",
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/common/ParameterData", body)
      );
      setEcrRemarkList(responseParam.data.ECRRemarkList);
      setEcrStatusList(responseParam.data.ECRStatusList);
      setOwnerTypeList(responseParam.data.OwnerTypeList);
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
      console.log(body);
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/deleteDriverECR2DetailSerial", body)
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
        APIHelper.postConfig("/logistics/insertDriverECR2DetailSerial", body)
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
        <CloseCircleOutlined style={{ color: 'red', fontSize: 16 }} />
      </Tooltip>
    ) : (
      <Tooltip title="Empty">
        <CheckCircleOutlined style={{ color: 'green', fontSize: 16 }} />
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
      <WarningOutlined style={{ color: 'red' }} />
    </Tooltip>
  ) : (
    <Tooltip title="OK">
      <CheckCircleFilled style={{ color: 'green' }} />
    </Tooltip>
  )
},
{
  title: "Action",
  key: "action",
  render: (_, record) => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Tooltip title="Delete">
        <Button
          type="text"
          icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
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
}
  ];

  if (isLoading) {
    return (
      <MobilePageShell title={"Driver ECR"} onBack={() => history.push("/")}>
        <SpinLoadingByUseState loading={isLoading} />
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
          <Button
            icon={<EditOutlined style={{ color: "#fff" }} />}
            onClick={() => setShowModal(true)}
            type="default"
            style={{ backgroundColor: "#377188", border: "none" }}
          />
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
        <BarsOutlined style={{ color: '#1890ff' }} />
        <Text>Total: {totalRecords.Total}</Text>
      </Space>
    </Col>
    <Col span={8}>
      <Space>
        <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
        <Text>Faulty: {totalRecords.NoOfFaulty}</Text>
      </Space>
    </Col>
    <Col span={8}>
      <Space>
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
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
        APIHelper.postConfig("/logistics/modifyDriverECR2Detail", body)
      );
      if (responseParam.status === 200) {
        message.success(
          "Serial :" + selectedSerialObject.SerialNo + " updated successfully"
        );
        onRefresh();
        return;
      }
      else {
        message.error(
          "Serial :" + selectedSerialObject.SerialNo + " updated failed"
        );
        return;
      }
    } catch (error) {
      ErrorPrinter(error, history);
      message.error("Serial :" + selectedSerialObject.SerialNo + " updated failed");
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
        <Form.Item
          label="Faulty?"
          name="remark"
        >
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
