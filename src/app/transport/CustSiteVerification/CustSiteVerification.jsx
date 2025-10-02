import {
  Button,
  Card,
  DatePicker,
  Progress,
  Table,
  Typography
} from "antd";
import dayjs from "dayjs";
import moment from "moment";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { APIHelper } from "../../../constants/APIHelper";
import {
  AxiosWithLoading,
  ErrorPrinter,
  SpinLoading,
} from "../../../constants/Common";
import MobilePageShell from "../../../constants/MobilePageShell";
import { PathLink } from "../../../constants/PathLink";
import UnauthorizedPage from "../../../constants/Unauthorized";
const { Text } = Typography;
export const CustSiteVerification = () => {
  const [data, setData] = useState([]);
  const [authorized, setAuthorized] = useState(true);
  const history = useHistory();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const initial = async () => {
    try {
      let body = {
        Date: selectedDate.format("YYYY-MM-DD"),
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getScheduleForUser", body)
      );
      setAuthorized(true);
      setData(responseParam.data.records);
    } catch (error) {
      setAuthorized(false);
      ErrorPrinter(error);
    }
  };
  const handleDateChange = (date) => {
    if (!date || date.isSame(selectedDate, "day")) return;
    setSelectedDate(date);
  };

  const goToDetail = (scheduleID) => {
    history.push({
      pathname: PathLink.custSiteVerification + "/" + scheduleID,
    });
  };

  const columns = [
    {
      title: "Schedules",
      dataIndex: "ScheduleID",
      key: "ScheduleID",
      render: (_, record) => {
        return (
          <>
            <Card
              key={record.ScheduleID}
              style={{
                marginBottom: "16px",
                borderRadius: "8px",
                background: "#f5f5f5",
              }}
              variant="outlined"
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#377188",
                }}
              >
                Schedule ID: {record.ScheduleID}
              </div>

              <div style={{ color: "#595959" }}>
                Vehicle No: {record.VehicleNo}
              </div>

              <div style={{ color: "#595959" }}>
                Tanker No: {record.TankerNo}
              </div>

              {/* DO Progress Section */}
              <div style={{ marginTop: "12px" }}>
                <Text style={{ color: "#595959" }}>
                  Delivery Progress:{" "}
                  <strong>
                    {record.TotalDO - record.PendingDO} / {record.TotalDO} DOs
                    Delivered
                  </strong>
                </Text>
                <Progress
                  percent={Math.round(
                    ((record.TotalDO - record.PendingDO) / record.TotalDO) * 100
                  )}
                  status={record.PendingDO === 0 ? "success" : "active"}
                  strokeColor="#52c41a"
                  trailColor="#d9d9d9"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </div>

              <div style={{ color: "#8c8c8c", marginTop: "12px" }}>
                Schedule Date:{" "}
                {moment(record.ScheduleDate).format("YYYY-MM-DD")}
              </div>

              <div style={{ marginTop: "12px", textAlign: "left" }}>
                <Button
                  type="primary"
                  onClick={() => goToDetail(record.ScheduleID)}
                  style={{ backgroundColor: "#377188", borderColor: "#377188" }}
                >
                  Detail
                </Button>
              </div>
            </Card>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    initial();
  }, [selectedDate]);

  if (!authorized) {
    return (
      <MobilePageShell
        title={"Cust Site Verification"}
        onBack={() => history.push("/")}
        onRefresh={initial}
      >
        <UnauthorizedPage
          title={"View Cust Site Verification (4.13.1, 1)"}
          subTitle={"Sorry, you are not authorized to access this page."}
        />
      </MobilePageShell>
    );
  } else {
    return (
          <MobilePageShell
            title={"Cust Site Verification"}
            onBack={() => history.push("/")}
            onRefresh={initial}
          >
            <SpinLoading />
            <div style={{ padding: "12px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
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

              <Table
                dataSource={data}
                columns={columns}
                rowKey={(record) => record.ScheduleID}
              />
            </div>
          </MobilePageShell>
    );
  }
};
