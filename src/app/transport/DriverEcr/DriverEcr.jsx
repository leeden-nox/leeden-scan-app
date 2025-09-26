import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Modal, Table, Typography } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
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
export const DriverEcr = () => {
  const [data, setData] = useState([]);
  const [authorized, setAuthorized] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [defaultECRWarehouse, setDefaultECRWarehouse] = useState("");
  const initial = async (SkippedRecords, PageSize) => {
    setIsLoading(true);
    fetchParamData();
    try {
      let body = {
        PageSize: PageSize,
        SkippedRecords: SkippedRecords,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getDriverECRByUserID", body)
      );
      //setAuthorized(true);
      setData(responseParam.data.Records.records);
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
        ModuleAccessID: "4.8.3-1",
        ParamList: "IsDefaultECRWarehouse",
      };
      let responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/common/ParameterData", body)
      );
      setDefaultECRWarehouse(
        responseParam.data.IsDefaultECRWarehouse[0].Warehouse
      );
      setAuthorized(true);
    } catch (error) {
      let data = ErrorPrinter(error, history);
      setAuthorized(false);
    } 
  };

  const goToDetail = (ecrNo) => {
    history.push({
      pathname: PathLink.driverEcr + "/" + ecrNo,
    });
  };
  const handleAddNewRecord = () => {
    Modal.confirm({
    title: "Create New Driver ECR",
    content: "You are about to create a new Driver ECR. Do you want to continue?",
    okText: "Create",
    cancelText: "Cancel",
    centered: true,
    async onOk() {
      // Your creation logic here
      await handleInsertECR2();
      // e.g. createECRRecord();
    },
    okButtonProps: { style: { backgroundColor: "#377188", borderColor: "#377188" } },
  });
}


  const handleInsertECR2 = async () => {
    setIsLoading(true);
    try {
      let body = {
        Warehouse: defaultECRWarehouse,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/insertDriverECR2", body)
      );
      //responseParam.data.records[0].ECRNo
      //route to the ECRNO detail page
    history.push({
      pathname: PathLink.driverEcr + "/" + responseParam.data,
    });
    } catch (error) {
      console.log(error);
    }
    finally {
        setIsLoading(false);
        }
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
                Date: {moment(record.ScheduleDate).format("YYYY-MM-DD")}
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
    const skippedRecords = (currentPage - 1) * pageSize;
    initial(skippedRecords, pageSize);
  }, [currentPage, pageSize]);

  if(isLoading) {
        return (
      <MobilePageShell
        title={"Driver ECR"}
        onBack={() => history.push("/")}
        onRefresh={initial}
      >
        <SpinLoadingByUseState loading={isLoading} />
      </MobilePageShell>
    );
  }

  if (!authorized) {
    return (
      <MobilePageShell
        title={"Driver ECR"}
        onBack={() => history.push("/")}
        onRefresh={initial}
      >
        <UnauthorizedPage
          title={"View Driver ECR (4.8.3, 1)"}
          subTitle={"Sorry, you are not authorized to access this page."}
        />
      </MobilePageShell>
    );
  } else {
    return (
          <MobilePageShell
            title={"Driver ECR"}
            onBack={() => history.push("/")}
            onRefresh={() => {
              const skippedRecords = (currentPage - 1) * pageSize;
              initial(skippedRecords, pageSize);
            }}
            rightHeaderComponent={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ backgroundColor: "#377188", borderColor: "#377188" }}
                onClick={handleAddNewRecord}
              >
              </Button>
            }
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
    );
  }
};
