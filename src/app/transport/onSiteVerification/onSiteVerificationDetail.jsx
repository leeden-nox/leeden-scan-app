import { useEffect, useState } from "react";
import { Button, Table, Card, message, Tag,Row,Col,Space } from "antd";
import { useHistory, useParams } from "react-router-dom";
import moment from "moment";
import dayjs from "dayjs";
import {
  AxiosWithLoading,
  ErrorPrinter,
  playErrorSound,
  SpinLoading,
} from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import MobilePageShell from "../../../constants/MobilePageShell";
import { Typography, Divider } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { PathLink } from "../../../constants/PathLink";
import { playSound } from "../../../constants/Common";
import { ScanListener } from "../../../constants/Common";

export const onSiteVerificationDetail = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const history = useHistory();
  const scheduleID = useParams().id.split("?")[0];
  const initial = async () => {
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.1-1",
        CoyID: 1,
        ScheduleID: scheduleID,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getOnSiteScheduleIDVerification", body)
      );
      setData(responseParam.data.records);
    } catch (error) {
      ErrorPrinter(error);
    }
  };

  const handleDetailClicked = (DONo) => {
    // eslint-disable-next-line no-restricted-globals
    history.push(
      PathLink.onSiteVerification + "/" + scheduleID + "/" + DONo
    );
  };

   const handleSubmit = async (barcode) => { 
    try {
      let body = {
        Module: "Logistics",
        ModuleAccessID: "4.8.1-1",
        ScheduleID: scheduleID,
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
        // sendNotification({
        //   type: "success",
        //   message: "Serial :" + barcode + " updated successfully",
        // });
        message.success("Serial :" + barcode + " updated successfully");
        await initial();
        playSound();
        return true;
      } else {
      message.error("Serial :" + barcode + " updated failed");
        
        return false;
      }
    } catch (error) {
      //console.log(error)
    //ErrorPrinter(error, history);
      playErrorSound();
      message.error("Serial :" + barcode + " updated failed");
      return false;
    }
  };

const columns = [
  {
    title: "DO",
    dataIndex: "DONo",
    key: "delivery",
    render: (_, record) => <DeliveryCard record={record} onClick={handleDetailClicked} />,
  },
];
  const confirmLeave = () => {
    history.goBack();
  };
  useEffect(() => {
    initial();
  }, [currentPage, pageSize]);

  return (
    <MobilePageShell
      title={"On Site Verification"}
      onBack={confirmLeave}
      onRefresh={() => initial()}
    >
      <>
        <SpinLoading />
        <Table
          dataSource={data}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            onChange: (page, newPageSize) => {
              setCurrentPage(page);
              setPageSize(newPageSize);
            },
          }}
        />
      </>
            <ScanListener
              onScanDetected={(barcode) => handleSubmit(barcode)}
            />
    </MobilePageShell>
  );
};




const { Title, Text } = Typography;

const DeliveryCard = ({ record, onClick }) => {
  const {
    DONo,
    RequiredDate,
    AccountName,
    DeliveryAddressText,
    TotalUnverifiedSerial,
    TotalUnverifiedCyl,
    TotalUnverifiedRack,
    TotalUnverifiedTransportRack,
    IsCOPSerial,
  } = record;

  const formattedDate = RequiredDate
    ? moment(RequiredDate).format("DD-MM-YYYY")
    : "";

  return (
    <Card
      hoverable
      onClick={() => onClick(DONo)}
      bordered={false}
      bodyStyle={{ padding: "1rem", backgroundColor: "#fdfdfd" }}
      style={{
        boxShadow: "0 1px 4px rgba(31, 38, 135, 0.1)",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      <Row align="middle" justify="space-between">
        {/* Left: DO Info (narrower width) */}
        <Col flex="1">
          <Space direction="vertical" size={4}>
            <Title level={5} style={{ marginBottom: 0, color: "#5d6168" }}>
              {DONo}
            </Title>
            <Text style={{ color: "#5d6168" }}>{formattedDate}</Text>
            <Text italic style={{ color: "#5d6168" }}>{AccountName}</Text>
            <Text style={{ whiteSpace: "pre-line", color: "#c7c7c7" }}>
              {DeliveryAddressText}
            </Text>
          </Space>
        </Col>

        {/* Right: Centered Verification Block + Arrow */}
        <Col flex="0 0 120px" style={{ textAlign: "center" }}>
          <Space direction="vertical" size={6} align="center">
            <Text strong style={{ color: "#c37f7f", fontSize: "1.6em" }}>
              {TotalUnverifiedSerial}
            </Text>
            <Text italic style={{ color: "#edc6c4", fontSize: "0.9em" }}>
              Total Unverified
            </Text>

            {!IsCOPSerial ? (
              <>
                <Text italic style={{ color: "#edc6c4" }}>
                  CYL: <span style={{ color: "#c37f7f" }}>{TotalUnverifiedCyl}</span>
                </Text>
                <Text italic style={{ color: "#edc6c4" }}>
                  M-Rack: <span style={{ color: "#c37f7f" }}>{TotalUnverifiedRack}</span>
                </Text>
                <Text italic style={{ color: "#edc6c4" }}>
                  T-Rack: <span style={{ color: "#c37f7f" }}>{TotalUnverifiedTransportRack}</span>
                </Text>
              </>
            ) : (
              <Text italic style={{ color: "#edc6c4", fontWeight: "bold" }}>
                <span style={{ color: "#c37f7f" }}>COP Serial</span>
              </Text>
            )}

            
          </Space>
        </Col>
        <Col flex="0 0 10px"> 
            <Space direction="vertical" size={6} align="center">
                <RightOutlined style={{ fontSize: "1em", color: "#c37f7f" }} />
            </Space>
        </Col>
      </Row>
    </Card>
  );
};