/* eslint-disable react-hooks/exhaustive-deps */
import "./FullScreenPage.css";
import { message, Modal } from "antd";
import { ArrowRightOutlined,CheckSquareOutlined,BorderOutlined } from "@ant-design/icons";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { List } from "antd";
import { Card, Typography, Tag, Space,Button } from "antd";
import { AxiosWithLoading, ErrorPrinter, playErrorSound, playSound, ScanListener, SpinLoading } from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import { PathLink } from "../../../constants/PathLink";
import MobilePageShell from "../../../constants/MobilePageShell";
import UnauthorizedPage from "../../../constants/Unauthorized";

export const PickListQtyDetail = () => {
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const DONo = useParams().doNo.split("?")[0];
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProdCode, setSelectedProdCode] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [modalData, setModalData] = useState([]);
  const location = useLocation();
  const [showCompletedOnly, setShowCompletedOnly] = useState(true);

  const getPickListQtyDetail = async () => {
    try {
      let body = {
        DONo: DONo,
      };
      const response = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getPickListQtyDetail", body)
      );

  
      if (
        response.data.Records.records.length === 0 ||
        response.data.Records.records[0].OrderedProdCode === "invalid"
      ) {
        setAuthorized(false);
      } else {
        setAuthorized(true);
        setData(response.data.Records.records);
      }
      //setData(response.data.Records.records);
    } catch (error) {
      setAuthorized(false);
      ErrorPrinter(error, history);
    }
  };
  const getPickListQtyDetailByProdCode = async (ProdCode) => {
    try {
      let body = {
        DONo: DONo,
        ProdCode: ProdCode,
      };
      const response = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getPickListQtyDetailByProdCode", body)
      );

      if (
        response.data.Records.records.length === 0 ||
        response.data.Records.records[0].OrderedProdCode === "invalid"
      ) {
        playErrorSound();
        message.error("Invalid Product Code for this DO");
      } else if (response.data.Records.records.length === 1) {
        // if (response.data.Records.records[0].TrackedBySerial) {
        //   message.error(
        //     "This item is tracked by serial, function not available yet."
        //   );
        //   playErrorSound();
        //   return;
        // }
        playSound();
        history.push({
          pathname:
            PathLink.pickListQty +
            "/" +
            DONo +
            "/" +
            response.data.Records.records[0].DetailNo,
          search: "?prodCodeVerified=true",
        });
      } else {
        setAuthorized(true);
        setData(response.data.Records.records);
      }
    } catch (error) {
      setAuthorized(false);
      ErrorPrinter(error, history);
    }
  };
  const getPickListLocationsByProdCode = async (prodCode, warehouse) => {
    try {
      let body = {
        ProdCode: prodCode,
        Warehouse: warehouse,
      };
      const response = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getPickListQtyLocations", body)
      );
      setModalData(response.data.Records.records);
      setSelectedProdCode(prodCode);
      setSelectedWarehouse(warehouse);
      setShowModal(true);
    } catch (error) {
      ErrorPrinter(error);
    }
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedProdCode("");
    setSelectedWarehouse("");
    setModalData([]);
  };

  useEffect(() => {
    getPickListQtyDetail();
  }, [location]);

  const confirmLeave = () => {
    history.goBack();
  };
  if (!authorized) {
    return (
      <MobilePageShell
        title={DONo}
        onBack={confirmLeave}
        onRefresh={getPickListQtyDetail}
      >
        <UnauthorizedPage
          title={"Invalid DO"}
          subTitle={
            "Sorry, this DO is not in picking-in-progress or partially picked"
          }
        />
      </MobilePageShell>
    );
  }

  const toggleFilter = () => {
    setShowCompletedOnly((prev) => !prev);
    // Trigger your filtering logic here
  };
  const filteredDOs = showCompletedOnly
  ? data.filter(item => item.QtyPicked !== item.OrderedQty)
  : data;
  return (
    <MobilePageShell
      title={DONo}
      onBack={confirmLeave}
      onRefresh={getPickListQtyDetail}
      rightHeaderComponent={<Button
      type="text"
      icon={showCompletedOnly ? <CheckSquareOutlined /> : <BorderOutlined />}
      onClick={toggleFilter}
      title="Toggle Completed DO Filter"
      style={{ float: "right",color: "#fff" }}
    />}
    >
      <SpinLoading />
      <Modal
        title={`Bins in ${selectedWarehouse} — ${selectedProdCode}`}
        open={showModal}
        onCancel={closeModal}
        footer={null}
        centered
      >
        <List
          itemLayout="horizontal"
          dataSource={modalData}
          renderItem={({ bin, Qty }) => (
            <List.Item>
              <Space
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong>{bin}</Text>
                <Tag color="blue">{Qty} pcs</Tag>
              </Space>
            </List.Item>
          )}
        />
      </Modal>
      {filteredDOs.map((doDetailItem, index) => (
        <DODetailCard
          key={index}
          doDetailItem={doDetailItem}
          viewLocations={getPickListLocationsByProdCode}
        />
      ))}
      <ScanListener
        onScanDetected={(barcode) => getPickListQtyDetailByProdCode(barcode)}
      />
    </MobilePageShell>
  );
};

const { Title, Text } = Typography;

const DODetailCard = ({ doDetailItem, viewLocations }) => {
  const {
    OrderedProdCode,
    OrderedProdName,
    OrderedQty,
    Warehouse,
    OnHandQty,
    UOM,
    IsBinActivated,
    QtyPicked,
    DetailNo,
    DONo,
    TrackedByBatch,
    TrackedBySerial
  } = doDetailItem;
  const history = useHistory();
  const routeToDetail = () => {
    // if (TrackedBySerial) {
    //   message.error(
    //     "This item is tracked by serial, function not available yet."
    //   );
    //   return;
    // }
    history.push({
      pathname: PathLink.pickListQty + "/" + DONo + "/" + DetailNo,
    });
  };

  return (
    <Card
      bordered
      style={{ borderRadius: 8, marginBottom: 16 }}
      hoverable
      size="small"
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Product Code & Arrow */}
        <Space
          style={{
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
            backgroundColor: "#F5F5F5",
            padding: "6px 12px",
            borderRadius: 4,
            cursor: "pointer",
          }}
          onClick={routeToDetail}
        >
          <Title level={5} style={{ margin: 0 }}>
            {OrderedProdCode} {TrackedByBatch && <Tag color="Green">Batch</Tag>} {TrackedBySerial && <Tag color="Red">Serial</Tag>}
          </Title>
          <ArrowRightOutlined style={{ fontSize: 16, color: "#595A5C" }} />
        </Space>

        {/* Product Name */}
        <Text strong>{OrderedProdName}</Text>

        {/* Quantities */}
        <Space
          direction="horizontal"
          style={{ justifyContent: "space-between", width: "100%" }}
        >
          <Text>{Warehouse + " -> " + OnHandQty} </Text>
          <Tag color={OrderedQty - QtyPicked !== 0 ? "#ECAE1C" : "#52C41A"}>
            {OrderedQty - QtyPicked}
            {UOM}{" "}
          </Tag>
        </Space>
        {IsBinActivated && (
          <Space
            style={{
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
              backgroundColor: "#F5F5F5",
              padding: "6px 12px",
              borderRadius: 4,
              cursor: "pointer",
            }}
            onClick={() => viewLocations(OrderedProdCode, Warehouse)}
          >
            <Text>View more location</Text>
            <ArrowRightOutlined style={{ fontSize: 16, color: "#595A5C" }} />
          </Space>
        )}
      </Space>
    </Card>
  );
};
