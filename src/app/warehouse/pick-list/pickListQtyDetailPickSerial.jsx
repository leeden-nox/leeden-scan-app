import {
  BarcodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined
} from "@ant-design/icons";
import { Button, Card, Checkbox, Divider, Input, List, message, Modal, Space, Typography } from "antd";
import { SwipeAction } from "antd-mobile";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { APIHelper } from "../../../constants/APIHelper";
import { AxiosWithLoading, ErrorPrinter, playErrorSound, playSound, ScanListener, SpinLoading } from "../../../constants/Common";
import MobilePageShell from "../../../constants/MobilePageShell";
import { useHistory } from "react-router-dom";
const { Text } = Typography;

const PickListQtyDetailPickSerial = ({data, setData, possibleProdCodes}) => {
  const history = useHistory();
  const query = new URLSearchParams(location.search);
  const isVerifiedPreviously = query.get("prodCodeVerified") === "true";
  const [isVerified, setIsVerified] = useState(isVerifiedPreviously);
  const DONo = useParams().doNo.split("?")[0];
  const { id } = useParams();
  const [authorized, setAuthorized] = useState(true);
  // const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  // const [possibleProdCodes, setPossibleProdCodes] = useState([]);
  const [selectedSerial, setSelectedSerial] = useState([]);
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null)
  const [showBinLocation, setShowBinLocation] = useState(false);
  const [binLocation, setBinLocation] = useState([]);
  const [batchSerialData, setBatchSerialData] = useState([]);
  const [serialList, setSerialList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    getPickListQtyDetail();
  }, []);

  const getPickListQtyDetail = async () => {
    try {
      const response2 = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getPickListQtyBatchSerial", {
          DONo: DONo,
          DetailNo: id,
        })
      );
      const response3 = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/pickListQtyGetSerialNoSAP", {
          ProdCode: data[0].OrderedProdCode,
          Warehouse: data[0].Warehouse,
          UOM: data[0].UOM,
        })
      );
      setBatchSerialData(response2.data.Records.records);

      setSerialList(response3.data);
    } catch (error) {
      setAuthorized(false);
      ErrorPrinter(error);
    }
  };

  const onRemoveSerialNo = (index) => {
    let serialList = selectedSerial || [];
    serialList.splice(index, 1);
    setSelectedSerial(serialList);
    setData([...data]);
  }

  const getPickListSerial = async (prodCode, warehouse, UOM) => {
    try {
      const response = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/pickListQtyGetSerialNoSAP", {
          ProdCode: prodCode,
          Warehouse: warehouse,
          UOM: UOM,
        })
      );
      setSerialList(response.data);
      setShowSerialModal(true);
    } catch (error) {
      ErrorPrinter(error);
    }
  }

  const updatePickListSerial = async () => {
    try {
      let body = {
        DONo: DONo,
        DetailNo: id,
        Serials: selectedSerial,
        IsBin: data[0]?.IsBinActivated || false
      };
      await AxiosWithLoading(
        APIHelper.postConfig("/logistics/pickListSerialPick", body)
      );
      getPickListQtyDetail();
      message.success("Pick List updated successfully");
    } catch (error) {
      ErrorPrinter(error);
      getPickListQtyDetail();
    }
  }

  const handleAddSerial = async () => {
    if (selectedSerial.length === 0) {
      message.error("Please select a serial before adding.");
      return;
    }
    if (!selectedBin && data[0]?.IsBinActivated){
      message.error("Please select bin location first.");
      return;
    }
    if (batchSerialData.some((item) => item.SerialNo === selectedSerial.Serial)) {
      message.error("Serial already added.");
      return;
    }
    await updatePickListSerial();
    setSelectedSerial([])
  }

  const scanBarcode = (barcode) => {
    if (data[0].TrackedBySerial) {
      const matchedSerial = serialList.find((item) => item.Serial === barcode);
      if (matchedSerial) {
        let serials = [...selectedSerial];
        serials.push(matchedSerial);
        setSelectedSerial(serials);
        playSound();

        return;
      }
    }

    if (isVerified) {
      //message.error("Barcode already verified");
      return;
    }
    if (possibleProdCodes.includes(barcode)) {
      setIsVerified(true);
      playSound();
    } else {
      message.error("Invalid barcode scanned");
      playErrorSound();
      setIsVerified(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setItemToDelete(null);
  };
  const showDeleteModal = (item) => {
    setItemToDelete(item);
    setModalVisible(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      //setData(data.filter(item => item.key !== itemToDelete.key));
      //setBatchSerialData(batchSerialData.filter((item) => item.DetailNo !== itemToDelete.DetailNo));
      deleteBatchSerial(itemToDelete.DetailNo);
      setItemToDelete(null);
    }
    setModalVisible(false);
  };
  const deleteBatchSerial = async (DetailNo) => {
    try {
      let body = {
        DetailNo: DetailNo,
        DONo: DONo
      };
      await AxiosWithLoading(
        APIHelper.postConfig("/logistics/pickListBatchSerialDelete", body)
      );
      message.success("Serial pick deleted successfully");
      getPickListQtyDetail();
    } catch (error) {
      ErrorPrinter(error);
    }
  };

  const handleAddBin = async () => {
    try {
      if (!isVerified) {
        message.error("Please verify product code first.");
        return;
      }
      const response = await AxiosWithLoading(
        APIHelper.postConfig('/logistics/getProductBinLocation', {
          ProdCode: data[0].OrderedProdCode,
          Warehouse: data[0].Warehouse
        })
      );
      if (response.data) {
        setBinLocation(response.data?.Records?.records || []);
      }
      setShowBinLocation(true);
    } catch (error) {
      ErrorPrinter(error);
    }
  }

  const handleScanResult = (success) => {
    setShowModal(false);
    setIsVerified(success);
  };

  if (!authorized) {
    return (
      <div className="full-screen-override">
        <UnauthorizedPage
          title={"Invalid DO"}
          subTitle={
            "Sorry, this DO is not in picking-in-progress or partially picked"
          }
        />
      </div>
    );
  }
  else {
    return showSerialModal ? (
      <SerialModal 
        visible={showSerialModal}
        onClose={() => {setShowSerialModal(false)}}
        list={serialList}
        onRefresh={getPickListSerial}
        item={data[0]}
        setSelected={setSelectedSerial}
        selected={selectedSerial}
        batchSerialData={batchSerialData}
      />
    ) : showBinLocation ? (
      <BinLocationModal
        visible={showBinLocation}
        onClose={() => setShowBinLocation(false)}
        list={binLocation}
        onRefresh={handleAddBin}
        setSelected={setSelectedBin}
      />
    )
    : (
      <>
        <MobilePageShell
          title={"Detail Item"}
          onBack={() => history.goBack()}
          onRefresh={getPickListQtyDetail}
          rightHeaderComponent={
            <Button
              icon={<EditOutlined style={{ color: "#fff" }} />}
              onClick={() => setShowModal(true)}
              disabled={isVerified}
              type="default"
              style={{ backgroundColor: "#377188", border: "none" }}
            />
          }
        >
          {data.length > 0 && (
            <ScanModal
              visible={showModal}
              onClose={handleScanResult}
              possibleProdCodes={possibleProdCodes}
            />
          )}

          {data.length > 0 && (
            <div style={{marginBottom:'2.5rem'}}>
              <Card bordered style={{ marginBottom: 16 }}>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Space
                    direction="horizontal"
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <Space>
                      <Text strong>Product</Text>
                      {isVerified ? (
                        <CheckCircleOutlined style={{ color: "#52C41A" }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: "#FF4D4F" }} />
                      )}
                    </Space>

                    <Text style={{ color: isVerified ? "#52C41A" : "#FF4D4F" }}>
                      {data[0].OrderedProdCode}
                    </Text>
                  </Space>
                  <Space
                    direction="horizontal"
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <Text strong></Text>
                    <Text>{data[0].OrderedProdName}</Text>
                  </Space>
                  <Space
                    direction="horizontal"
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <Text strong>Warehouse</Text>
                    <Text>{data[0].Warehouse}</Text>
                  </Space>
                  <Space
                    direction="horizontal"
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <Text strong>Balance Qty</Text>
                    <Text>
                      {`(Total:${data[0].OrderedQty}) ${
                        data[0].OrderedQty - data[0].QtyPicked
                      }`}{" "}
                    </Text>
                  </Space>
                  <Space
                    direction="horizontal"
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <Text strong>Warehouse Remarks</Text>
                    <Text>
                      {data[0].WarehouseRemarks ? data[0].WarehouseRemarks : "-"}
                    </Text>
                  </Space>
                  {data[0].IsBinActivated && (
                    <Space
                      direction="horizontal"
                      style={{ justifyContent: "space-between", width: "100%" }}
                    >
                      <Text strong>{'Bin Location'}</Text>
                      <Text onClick={() => handleAddBin()} disabled={!selectedBin}>{selectedBin ? selectedBin.Bin : "Please select bin >"}</Text>
                    </Space>
                  )}
                </Space>
              </Card>
              <div
                gutter={8}
                style={{
                  width: "100%",
                  alignItems: "between",
                }}
              >
                <SpinLoading />
                <div>
                  <Button
                    type="primary"
                    onClick={() => getPickListSerial(
                        data[0].OrderedProdCode,
                        data[0].Warehouse,
                        data[0].UOM
                      )
                    }
                    disabled={!isVerified}
                    style={{
                      backgroundColor: "#377188",
                      width: "100%",
                      borderRadius: 50,
                      marginBottom: '16px'
                    }}
                  >
                    {"Select Serial"}
                  </Button>
                </div>
              </div>
              
              {selectedSerial.map((srl, index) => (
                <SwipeAction
                  rightActions={[
                      {
                        key: 'delete',
                        text: <DeleteOutlined />,
                        color: 'danger',
                        onClick: () => onRemoveSerialNo(index),
                      }
                    ]}
                >
                  <div key={index} className="d-flex justify-content-between px-4 py-2" style={{ backgroundColor: "white", borderBottom:'1px solid #ccc', width:'100vw' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#888" }}>Serial: {srl.Serial}</div>
                    <div style={{ color: "#377188", fontWeight: 600, fontSize: 16 }}>Qty: 1</div>
                  </div>
                </SwipeAction>
              ))}
              {isVerified && (
                <div style={{ marginTop: "25px" }}>
                  {/* <Divider style={{ marginBottom: 1 }} /> */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: "bold",
                      padding: "4px 8px",
                      backgroundColor: "#fafafa",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <Text>Serial</Text>
                    <Text>Picked</Text>
                    <Text></Text> {/* Spacer for icon */}
                  </div>
                  <List
                    itemLayout="horizontal"
                    dataSource={batchSerialData}
                    renderItem={(item) => (
                      <List.Item style={{ padding: "4px 8px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Text>{item.SerialNo}</Text>
                          <Text>{item.Qty}</Text>
                          <div>
                            <Button
                              type="text"
                              icon={
                                <CheckCircleOutlined
                                  style={{ color: "green" }}
                                />
                              }
                              // onClick={!isFulFilled ? () => showFulfillModal(item) : null}
                            />
                            <Button
                              type="text"
                              icon={<DeleteOutlined style={{ color: "red" }} />}
                              onClick={() => showDeleteModal(item)}
                            />
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              )}
              <ScanListener onScanDetected={(barcode) => scanBarcode(barcode)} />
            </div>
          )}
          {selectedSerial.length > 0 && (
            <Button
              type="primary"
              block
              onClick={() => {handleAddSerial()}}
              style={{ backgroundColor: "#377188", bottom: '1px', position:'absolute', width:'100vw' }}
            >
              Post to LMS/SAP
            </Button>
          )}
          
          <Modal
            open={modalVisible}
            onOk={handleDelete}
            onCancel={handleCancel}
            title="Confirm Delete"
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <p>
              Delete <strong>{itemToDelete?.SerialNo}</strong> from the
              list?
            </p>
          </Modal>
        </MobilePageShell>
      </>
    );
  }
}
 
export default PickListQtyDetailPickSerial;


const SerialModal = ({
  visible,
  onClose,
  list = [],
  onRefresh,
  item,
  setSelected,
  selected,
  batchSerialData
}) => {
  const [search, setSearch] = useState("");

  const handleSelect = (detail) => {
    let serials = [...selected];
    serials.push(detail);
    setSelected(serials);
    // onClose();
  }

  return visible && (
    <MobilePageShell
      title={ "Serials"}
      onBack={onClose}
      onRefresh={() =>
        onRefresh(item.OrderedProdCode, item.Warehouse, item.UOM)
      }
    >
      <SpinLoading />
      <Input className="m-2" style={{width:'95vw'}} placeholder="Search Serial" value={search} onChange={(e) => setSearch(e.target.value)} />
      <Card style={{ marginBottom: 16, backgroundColor: "#f4f6f8" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#888" }}>
            Warehouse: {item.Warehouse}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#005999" }}>
            Code: {item.OrderedProdCode}
          </span>
        </div>

        <div style={{ fontSize: 11, fontWeight: 500, color: "#222" }}>
          {item.OrderedProdName}
        </div>
      </Card>

      {list.filter(item => (item.Serial || '').toLowerCase().includes(search.toLowerCase())).map((detail, index) => (
        <Checkbox 
          checked={selected.some(s => s.Serial === detail.Serial) || batchSerialData.some((item) => item.SerialNo === detail.Serial)}
          disabled={batchSerialData.some((item) => item.SerialNo === detail.Serial)}
          className="card-checboxWrap"
          onChange={(e) => {
            if (e.target.checked) handleSelect(detail)
            else {
              const filtered = selected.filter(s => s.Serial !== detail.Serial);
              setSelected(filtered);
            }
          }} 
        >
          <Card
            key={index}
            style={{ marginBottom: 16 }}
          >
            <div className="d-flex justify-content-between">
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#377188", fontWeight: 600, fontSize: 16 }}>
                    Serial: {detail.Serial}
                  </span>
                </div>

                <div style={{ backgroundColor: "#fefefe" }}>
                  <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
                    <div>
                      <strong>Manufacturing Date:</strong>{" "}
                      {detail.ManufacturingDate
                        ? dayjs(detail.ManufacturingDate).format("DD/MM/YYYY")
                        : "-"}
                    </div>
                    <div>
                      <strong>Expiration Date:</strong>{" "}
                      {detail.ExpirationDate
                        ? dayjs(detail.ExpirationDate).format("DD/MM/YYYY")
                        : "-"}
                    </div>
                    <div>
                      <strong>Admission Date:</strong>{" "}
                      {detail.AdmissionDate
                        ? dayjs(detail.AdmissionDate).format("DD/MM/YYYY")
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Checkbox>
      ))}
    </MobilePageShell>
  )
}

const BinLocationModal = ({
  visible,
  onClose,
  list = [],
  onRefresh,
  setSelected,
}) => {
  return visible && (
    <MobilePageShell
      title={'Bin Location'}
      onBack={onClose}
      onRefresh={() =>
        onRefresh()
      }
    >
      <SpinLoading />
      <div className="mt-3">
        {list.map((detail, index) => (
          <div key={index} onClick={() => {setSelected({Bin: detail.Bin, Qty: detail.OnHandQty}); onClose()}} className="px-3 py-2 my-2 mx-1 d-flex justify-content-between" style={{background:'white',borderRadius:'0.5rem'}}>
            <span>{detail.Bin}</span>
            <span style={{fontWeight:'bold'}}>{detail.OnHandQty}</span>
          </div>
        ))}
      </div>
    </MobilePageShell>
  )
}

const ScanModal = ({ visible, onClose, possibleProdCodes }) => {
  const [manualCode, setManualCode] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      setManualCode(""); // clear on open
    }
  }, [visible]);

  const handleSubmit = () => {
    const value = manualCode.trim();
    const matched = possibleProdCodes.includes(value);

    onClose(matched); // ✅ or ❌ result
    setManualCode(""); // reset input
  };

  return (
    <Modal
      open={visible}
      footer={null}
      centered
      closable={false}
      maskClosable={false}
      width="100%"
      style={{
        maxWidth: "100vw",
        overflowX: "hidden",
        textAlign: "center",
        padding: "32px 16px",
      }}
      styles={{
        body: {
          padding: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        },
      }}
    >
      <BarcodeOutlined style={{ fontSize: 48, color: "#377188" }} />
      <Text>Manually enter the product code to verify</Text>

      <Input
        ref={inputRef}
        value={manualCode}
        onChange={(e) => setManualCode(e.target.value)}
        onPressEnter={handleSubmit}
        placeholder="Type product code here"
        style={{
          maxWidth: "320px",
          textAlign: "center",
        }}
      />

      <Space style={{ marginTop: 24 }}>
        <Button type="default" onClick={() => onClose(false)}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Space>
    </Modal>
  );
};