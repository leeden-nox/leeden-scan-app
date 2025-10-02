import { Button, Card, Table, Typography,DatePicker } from "antd";
import dayjs from "dayjs";
import moment from "moment";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { APIHelper } from "../../../constants/APIHelper";
import {
  AxiosWithLoading,
  ErrorPrinter,
  SpinLoading,
  SpinLoadingByUseState,
} from "../../../constants/Common";
import MobilePageShell from "../../../constants/MobilePageShell";
import { PathLink } from "../../../constants/PathLink";
import UnauthorizedPage from "../../../constants/Unauthorized";
const { Text } = Typography;
export const ECR = () => {
  const [data, setData] = useState([]);
  const [authorized, setAuthorized] = useState(true);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs()); // default to today

  const initial = async () => {
    setIsLoading(true);
    fetchParamData();
    try {
      let body = {
        Date: selectedDate.format("YYYY-MM-DD") //using today's date
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getDriverECRForConvert", body)
      );
      console.log("api is called");
      setData(responseParam.data.Table);
    } catch (error) {
      //setAuthorized(false);
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
        ParamList: "",
      };
      let responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/common/ParameterData", body)
      );
      setAuthorized(true);
    } catch (error) {
      let data = ErrorPrinter(error, history);
      setAuthorized(false);
    } 
  };

  const goToDetail = (ecrNo) => {
    history.push({
      pathname: PathLink.ecr + "/" + ecrNo,
    });
  };

  const handleDateChange = (date) => {
  if (!date || date.isSame(selectedDate, "day")) return;
  setSelectedDate(date);
};


  const columns = [
    {
      title: "Driver ECR",
      dataIndex: "ECRNo",
      key: "ECRNo",
      render: (_, record) => {
        return (
          <>
            <Card
              key={record.ECRNo}
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
                ECRNo: {record.ECRNo}
              </div>
              <div style={{ color: "#8c8c8c", marginTop: "12px" }}>
                Date: {moment(record.ECRDate).format("YYYY-MM-DD")}
              </div>
              <div style={{ color: "#8c8c8c", marginTop: "12px" }}>
                ECRStatusName: {record.ECRStatusName}
              </div>
              <div style={{ color: "#8c8c8c", marginTop: "12px" }}>
                Cylinder Count: {record.SerialCount}
              </div>

              <div style={{ marginTop: "12px", textAlign: "left" }}>
                <Button
                  type="primary"
                  onClick={() => goToDetail(record.ECRNo)}
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

  if(isLoading) {
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
>
  <div style={{ padding: "12px" }}>
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
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
      rowKey={(record) => record.ECRNo}
      scroll={{ x: true }}
      size="small"
    />
  </div>
</MobilePageShell>

    );
  }
};
