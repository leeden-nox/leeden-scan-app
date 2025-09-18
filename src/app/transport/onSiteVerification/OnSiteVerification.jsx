import { useEffect, useState } from "react";
import { Button, Table, Card, Modal } from "antd";
import { Route, useHistory, Switch } from "react-router-dom";
import moment from "moment";
import { AxiosWithLoading, ErrorPrinter, SpinLoading } from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import { PathLink } from "../../../constants/PathLink";
import UnauthorizedPage from "../../../constants/Unauthorized";
import MobilePageShell from "../../../constants/MobilePageShell";

export const OnSiteVerification = () => {
  const [data, setData] = useState([]);
  const [authorized, setAuthorized] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const history = useHistory();

  const initial = async (SkippedRecords, PageSize) => {
    try {
      let body = {
        PageSize: PageSize,
        SkippedRecords: SkippedRecords,
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

  const goToDetail = (scheduleID) => {
    history.push({
      pathname: PathLink.onSiteVerification + "/" + scheduleID,
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
              <div style={{ color: "#595959" }}>
                Pending DO:{" "}
                <span style={{ color: "#52c41a" }}>{record.PendingDO}</span>
              </div>
              <div style={{ color: "#8c8c8c" }}>
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
    const skippedRecords = (currentPage - 1) * pageSize;
    initial(skippedRecords, pageSize);
  }, [currentPage, pageSize]);
  
  if (!authorized) {
    return (
      <MobilePageShell title={"On Site Verification"} onBack={() => history.push('/')} onRefresh={initial}>
        <UnauthorizedPage title={"View On Site Verification (4.13.1, 1)"} subTitle={"Sorry, you are not authorized to access this page."}/>
      </MobilePageShell>
    )
  }
  else {
    return (
      <Switch>
        {/* <Route exact path={detailLink} component={FlowmeterReadingDetail} /> */}

        <Route exact path={PathLink.onSiteVerification}>
          <MobilePageShell
            title={"On Site Verification"}
            onBack={() => history.push('/')}
            onRefresh={() => {
              const skippedRecords = (currentPage - 1) * pageSize;
              initial(skippedRecords, pageSize);
            }}
          >
            <SpinLoading />
            <Table
              dataSource={data}
              columns={columns}
              rowKey={(record) => record.ScheduleID}
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
          </MobilePageShell>
        </Route>
      </Switch>
    );
  }
  
};
