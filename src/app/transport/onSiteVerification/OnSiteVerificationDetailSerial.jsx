import { useState, useEffect, useCallback } from "react";
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
import { Select, Table, Card, Space, Typography, message } from "antd";
import MobilePageShell from "../../../constants/MobilePageShell";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import UnauthorizedPage from "../../../constants/Unauthorized";
const { Title } = Typography;
export const OnSiteVerificationDetailSerial = () => {
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const [data, setData] = useState([]);
  const { id, doNo } = useParams();
  const [isIssuedVerifiedList, setIsIssuedVerifiedList] = useState([]);
  const [isIssuedVerified, setIsIssuedVerified] = useState({});

  const getOnSiteScheduleIDVerification = async () => {
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
      setData(responseParam.data.records);
    } catch (error) {
      ErrorPrinter(error, history);
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
      >
        <div style={{ padding: "16px" }}>
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
