
import {  Modal } from "antd";
import {  ArrowRightOutlined,CheckCircleOutlined  } from "@ant-design/icons";
import { useHistory, Route,useLocation, Switch } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, Typography, Tag, Space,Button } from "antd";
import { AxiosWithLoading, ErrorPrinter, SpinLoading } from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import { PathLink } from "../../../constants/PathLink";
import { PickListQtyDetail } from "./pickListQtyDetail";
import { PickListQtyDetailPick } from "./pickListQtyDetailPick";
import MobilePageShell from "../../../constants/MobilePageShell";
import MainMenu from "../../MainMenu";
import UnauthorizedPage from "../../../constants/Unauthorized";

export default function PickListQty() {
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const [data, setData] = useState([]);
  const location = useLocation();

  const getPickListQtyDO = async () => {
    try {
      let body = {};
      const response = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getPickListQtyDO", body)
      );
      setAuthorized(true);
      setData(response.data.Records.records);
    } catch (error) {
      setAuthorized(false);
      ErrorPrinter(error);
    }
  };

  useEffect(() => {
    getPickListQtyDO();
  }, [location]);

  if (!authorized) {
    return (
      <MobilePageShell title={"Pick List"} onBack={() => history.push('/')} onRefresh={getPickListQtyDO}>
        <UnauthorizedPage title={"View Pick List Qty (4.4.1, 1)"} subTitle={"Sorry, you are not authorized to access this page."}/>
      </MobilePageShell>
    );
  } else {
    return (
      <>
        <Switch>
          <Route exact path={PathLink.pickListQtyDetail} component={PickListQtyDetail} />
          <Route exact path={PathLink.pickListQtyDetailPick} component={PickListQtyDetailPick} />
          <Route exact path={'/'} render={() => <MainMenu />} />
        </Switch>
        <Route exact path={PathLink.pickListQty}>
                <MobilePageShell title={"Pick List"} onBack={() => history.push('/')} onRefresh={getPickListQtyDO}>
                  <SpinLoading />
                  {data.map((doItem) => (
                    <DOCard key={doItem.DONo} doData={doItem} onRefresh={() => getPickListQtyDO()} />
                  ))}
                </MobilePageShell>
        </Route>
      </>
    );
  }
};

const { Title, Text } = Typography;

const DOCard = ({ doData, onRefresh }) => {
  const {
    DONo,
    AccountName,
    StatusName,
    UserName,
    Notes,
    CustomerPO,
    RequiredDate,
    DocTagNo,
    isAllPicked,
  } = doData;
  const history = useHistory();
  const routeToDetail = () => {
        history.push({
          pathname: PathLink.pickListQty + "/" + DONo,
        });
  }

  const handleMarkPicked = (DONo) => {
    Modal.confirm({
      title: "Mark Delivery Order as Picked?",
      content: `Are you sure you want to update picking status for DO: ${DONo}?`,
      okText: "Yes, Mark as Picked",
      cancelText: "Cancel",
      centered: true,
      onOk: () => {
        // 🔥 Your API call here
        markDOAsPicked(DONo);

      },
    });
  };

  const markDOAsPicked = async (DONo) => {
      try {
      let body = {
        DONo: DONo,
      };
      await AxiosWithLoading(
        APIHelper.postConfig("/logistics/pickListQtyMarkAsPickedDO", body)
      ).then(() => {
        onRefresh();
      });

    } catch (error) {
      ErrorPrinter(error);
    }
  };

  return (
    <Card
      bordered
      style={{ borderRadius: 8, marginBottom: 16 }}
      hoverable
      size="small"
      onClick={routeToDetail}
    >
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <Space
          direction="horizontal"
          style={{ justifyContent: "space-between", width: "100%" }}
        >
          <Title level={5} style={{ margin: 0 }}>
            {DONo}
          </Title>
          <Text style={{ marginTop: 6 }}>{RequiredDate?.slice(0, 10)}</Text>
        </Space>

        <Space
          direction="horizontal"
          style={{ justifyContent: "space-between", width: "100%" }}
        >
          <Text type="secondary">{AccountName}</Text>
          {DocTagNo && (
            <Tag color="#EFE4C1" style={{ color: "black" }}>
              {DocTagNo}
            </Tag>
          )}
        </Space>

        <Space
          direction="horizontal"
          style={{ justifyContent: "space-between", width: "100%" }}
        >
          <Text>Created By: {UserName}</Text>
          <Text>{CustomerPO}</Text>
        </Space>

        <Text type="secondary">{Notes}</Text>
        <Space
          direction="horizontal"
          style={{
            justifyContent: "space-between",
            width: "100%",
            marginTop: 12,
          }}
        >
          <Tag
            color={StatusName === "Partially Picked" ? "#ECAE1C" : "#595A5C"}
            style={{ color: "#fff" }}
          >
            {StatusName}
          </Tag>
          {isAllPicked === 1 && (
            <Button
              type="text"
              icon={<CheckCircleOutlined style={{ color: "#52C41A" }} />}
              onClick={(e) => {
                e.stopPropagation(); // prevent triggering routeToDetail
                handleMarkPicked(DONo);
              }}
            >
              Mark Picked
            </Button>
          )}
          <ArrowRightOutlined style={{ fontSize: 16, color: "#595A5C" }} />
        </Space>
      </Space>
    </Card>
  );
};
