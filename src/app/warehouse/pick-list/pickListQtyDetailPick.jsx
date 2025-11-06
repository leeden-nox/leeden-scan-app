import {
  BarcodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { APIHelper } from "../../../constants/APIHelper";
import { AxiosWithLoading, ErrorPrinter, playErrorSound, playSound, ScanListener, SpinLoading } from "../../../constants/Common";
import MobilePageShell from "../../../constants/MobilePageShell";
import UnauthorizedPage from "../../../constants/Unauthorized";
import "./FullScreenPage.css";

const { Text } = Typography;
export const PickListQtyDetailPick = () => {
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const DONo = useParams().doNo.split("?")[0];
  const { id } = useParams();

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isVerifiedPreviously = query.get("prodCodeVerified") === "true";
  const [data, setData] = useState([]);
  const [batchSerialData, setBatchSerialData] = useState([]);
  const [isVerified, setIsVerified] = useState(isVerifiedPreviously);
  const [showModal, setShowModal] = useState(false);
  const [pickedQty, setPickedQty] = useState(null);
  const [possibleProdCodes, setPossibleProdCodes] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  // serial
  const [serialList, setSerialList] = useState([]);
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isFulFilled, setisFulFilled] = useState(true);
  const [itemToFulFill, setItemToFulFill] = useState(null);
  const [modalFulfillVisible, setModalFulfillVisible] = useState(false);
  const [csSelectMoreThanOneBatch, setCSSelectMoreThanOneBatch] =
    useState(false);
  const [binLocation, setBinLocation] = useState([]);
  const [showBinLocation, setShowBinLocation] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null)
  const getPickListQtyDetail = async () => {
    try {
      let body = {
        DONo: DONo,
        SeqNo: id,
      };
      const response = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getPickListQtyDetailSeqNo", body)
      );
      console.log('data: ', response.data)
      const headerData = response.data.Records.records;
      setAuthorized(true);
      setData(headerData);
      setPossibleProdCodes([
        response.data.Records.records[0].OrderedProdCode,
        ...response.data.Records.records.map((item) => item.SupplierCode),
      ]);
      // Check if the record is tracked by batch
      if (
        response.data.Records.records &&
        response.data.Records.records[0].TrackedByBatch
      ) {
        const response2 = await AxiosWithLoading(
          APIHelper.postConfig("/logistics/getPickListQtyBatchSerial", {
            DONo: DONo,
            DetailNo: id,
          })
        );
        const response3 = await AxiosWithLoading(
          APIHelper.postConfig("/logistics/pickListQtyGetBatchNoSAP", {
            ProdCode: response.data.Records.records[0].OrderedProdCode,
            Warehouse: response.data.Records.records[0].Warehouse,
            UOM: response.data.Records.records[0].UOM,
          })
        );

        const pickedData = response2.data.Records.records;

        const amountPickedInHeader = headerData ? headerData[0].QtyPicked : 0;
        const sumOfPickedInSerialRow = pickedData.reduce((sum, item) => {
          const qty = parseFloat(item.Qty) || 0;
          return sum + qty;
        }, 0);
        
        if (
          amountPickedInHeader != sumOfPickedInSerialRow &&
          pickedData.length > 1
        ) {
          message.error("CS picked from more than 1 batch.");
          setCSSelectMoreThanOneBatch(true);
        }
        else if (amountPickedInHeader != sumOfPickedInSerialRow) {
          setisFulFilled(false);
        }
        else {
          setisFulFilled(true);
        }
        const batchData = response3.data;
        setBatchList(batchData);
        const merged = pickedData.map((item) => {
          const matchedBatch = batchData.find(
            (batch) => batch.BatchNo === item.BatchNo
          );

          return {
            ...item,
            BatchNo: item.BatchNo || item.BatchNoSAP,
            Qty: item.Qty || item.QtyPicked,
            SAPQty: matchedBatch?.Qty ?? null,
            AdmissionDate: matchedBatch?.AdmissionDate ?? null,
            Location: matchedBatch?.Location ?? null,
            // Add more if needed
          };
        });

        setBatchSerialData(merged);
      }
      else if (response.data.Records.records && response.data.Records.records[0].TrackedBySerial) {
        const response2 = await AxiosWithLoading(
          APIHelper.postConfig("/logistics/getPickListQtyBatchSerial", {
            DONo: DONo,
            DetailNo: id,
          })
        );
        const response3 = await AxiosWithLoading(
          APIHelper.postConfig("/logistics/pickListQtyGetSerialNoSAP", {
            ProdCode: response.data.Records.records[0].OrderedProdCode,
            Warehouse: response.data.Records.records[0].Warehouse,
            UOM: response.data.Records.records[0].UOM,
          })
        );

        setBatchSerialData(response2.data.Records.records);

        setSerialList(response3.data);
      }
    } catch (error) {
      setAuthorized(false);
      ErrorPrinter(error);
    }
  };

  const updatePickList = async (DONo, DetailNo, QtyPicked) => {
    if (pickedQty === null || pickedQty < 0 || pickedQty > data[0].OrderedQty) {
      message.error("Please enter a valid picked quantity");
      return;
    }
    if (data[0]?.IsBinActivated && !selectedBin){
      message.error("Please select bin location first.");
      return;
    }
    try {
      let body = {
        DONo: DONo,
        DetailNo: DetailNo,
        QtyPicked: QtyPicked,
        Warehouse: data[0].Warehouse,
        Location: selectedBin?.Bin || '',
        IsBin: data[0]?.IsBinActivated || false
      };
      await AxiosWithLoading(
        APIHelper.postConfig("/logistics/pickListQtyPerformPick", body)
      );
      getPickListQtyDetail();
      message.success("Pick List updated successfully");
    } catch (error) {
      // message.error("Failed to update Pick List");
      ErrorPrinter(error);
    }
  };
  const updatePickListBatch = async (DONo, DetailNo, QtyPicked) => {
    if (pickedQty === null || pickedQty < 0 || pickedQty > data[0].OrderedQty) {
      message.error("Please enter a valid picked quantity");
      return;
    }
    let body = {
      DONo: DONo,
      DetailNo: DetailNo,
      BatchNo: selectedBatch.BatchNo,
      QtyPicked: QtyPicked,
      AdmissionDate: selectedBatch.AdmissionDate,
      Warehouse: data[0].Warehouse,
      ProdCode: data[0].OrderedProdCode,
      UOM: data[0].UOM,
      Location: selectedBin?.Bin || '',
      IsBin: data[0]?.IsBinActivated || false
    };

    await AxiosWithLoading(
      APIHelper.postConfig("/logistics/pickListQtyPerformBatchPick", body)
    );
    getPickListQtyDetail();
    message.success("Pick List updated successfully");
  };

  const updatePickListSerial = async (DONo, DetailNo) => {
    try {
      let body = {
        DONo: DONo,
        DetailNo: DetailNo,
        Serial: selectedSerial.Serial,
        MfrSerialNo: selectedSerial.MfrSerialNo || '',
        AdmissionDate: selectedSerial.AdmissionDate,
        Warehouse: selectedSerial.Warehouse,
        Location: selectedBin?.Bin || '',
        IsBin: data[0]?.IsBinActivated || false
      };
      await AxiosWithLoading(
        APIHelper.postConfig("/logistics/pickListSerialPick", body)
      );
      getPickListQtyDetail();
      message.success("Pick List updated successfully");
    } catch (error) {
      ErrorPrinter(error);
    }
  }

  const scanBarcode = (barcode) => {
    if (data[0].TrackedByBatch) {
      const matchedBatch = batchList.find((item) => item.BatchNo === barcode);
      if (matchedBatch) {
        setSelectedBatch(matchedBatch);
        playSound();

        return;
      }
    }
    else if (data[0].TrackedBySerial) {
      const matchedSerial = serialList.find((item) => item.Serial === barcode);
      if (matchedSerial) {
        setSelectedSerial(matchedSerial);
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

  const getPickListBatch = async (prodCode, warehouse, UOM) => {
    try {
      let body = {
        ProdCode: prodCode,
        Warehouse: warehouse,
        UOM: UOM,
      };
      const response = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/pickListQtyGetBatchNoSAP", body)
      );
      setBatchList(response.data);
      setShowBatchModal(true);
    } catch (error) {
      ErrorPrinter(error);
    }
  };

const handleFulFill = async () => {
  if (itemToFulFill) {
    setItemToFulFill(null);
    validatePicking(itemToFulFill.DetailNo);
  }
  setModalFulfillVisible(false);
}
const validatePicking = async (DetailNo) => {
      try {
      let body = {
        DetailNo: DetailNo,
      };
      await AxiosWithLoading(
        APIHelper.postConfig("/logistics/pickListBatchValidateCSSelection", body)
      );
      message.success("Batch picked successfully");
      getPickListQtyDetail();
    } catch (error) {
      ErrorPrinter(error);
    }
}

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
      };
      await AxiosWithLoading(
        APIHelper.postConfig("/logistics/pickListBatchSerialDelete", body)
      );
      message.success("Batch pick deleted successfully");
      getPickListQtyDetail();
    } catch (error) {
      ErrorPrinter(error);
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
  const showFulfillModal = (item) => {
    setItemToFulFill(item);
    setModalFulfillVisible(true);
  }
  const handleCancelFulfill = () => {
    setModalFulfillVisible(false);
    setItemToFulFill(null);
  };

  // serial
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

  useEffect(() => {
    getPickListQtyDetail();
  }, []);
  const confirmLeave = () => {
    history.goBack();
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
  if (csSelectMoreThanOneBatch) {
    return (
      <div className="full-screen-override">
        <UnauthorizedPage
          title={"Error"}
          subTitle={"CS Select more than 1 batch."}
        />
      </div>
    );
  }

  const handleScanResult = (success) => {
    setShowModal(false);
    setIsVerified(success);
  };

  const handleAddBatch = () => {
    if (!selectedBatch) {
      message.error("Please select a batch before adding.", 1.5);
      return;
    }
    if (pickedQty === null || pickedQty < 0 || pickedQty > data[0].OrderedQty) {
      message.error("Please enter a valid picked quantity", 1.5);
      return;
    }
    if (pickedQty > selectedBatch.Qty) {
      message.error("Picked quantity exceeds available batch quantity.", 1.5);
      return;
    }
    if (
      batchSerialData.some((item) => item.BatchNo === selectedBatch.BatchNo)
    ) {
      message.error("Batch already added.", 1.5);
      return;
    }
    if (data[0]?.IsBinActivated && !selectedBin){
      message.error("Please select bin location first.");
      return;
    }

    updatePickListBatch(DONo, id, pickedQty);
    setPickedQty(null);
    setSelectedBatch(null);
  };

  const handleAddSerial = () => {
    if (!selectedSerial) {
      message.error("Please select a serial before adding.");
      return;
    }
    if (!selectedBin && data[0]?.IsBinActivated){
      message.error("Please select bin location first.");
      return;
    }
    if (batchSerialData.some((item) => item.Serial === selectedSerial.Serial)) {
      message.error("Serial already added.");
      return;
    }

    updatePickListSerial(DONo, id);
    setSelectedSerial(null)
  }

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

  return showBatchModal ? (
    <BatchSerialModal
      visible={showBatchModal}
      onClose={() => setShowBatchModal(false)}
      list={batchList}
      onRefresh={getPickListBatch}
      item={data[0]}
      setSelected={setSelectedBatch}
      isBatch={true}
    />
  ) : showSerialModal ? (
    <BatchSerialModal 
      visible={showSerialModal}
      onClose={() => setShowSerialModal(false)}
      list={serialList}
      onRefresh={getPickListSerial}
      item={data[0]}
      setSelected={setSelectedSerial}
      isBatch={false}
    />
  ) : showBinLocation ? (
    <BinLocationModal
      visible={showBinLocation}
      onClose={() => setShowBinLocation(false)}
      list={binLocation}
      onRefresh={handleAddBin}
      setSelected={setSelectedBin}
    />
  ):
  (
    <MobilePageShell
      title={"Detail Item"}
      onBack={confirmLeave}
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
      <>
        <SpinLoading />
        {data.length > 0 && (
          <ScanModal
            visible={showModal}
            onClose={handleScanResult}
            possibleProdCodes={possibleProdCodes}
          />
        )}
        {data.length > 0 && (
          <>
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
            {/* Track by batch */}
            {data[0].TrackedByBatch && (
              <>
                <Row
                  gutter={8}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Col flex="50%">
                    <Button
                      type="primary"
                      onClick={() =>
                        getPickListBatch(
                          data[0].OrderedProdCode,
                          data[0].Warehouse,
                          data[0].UOM
                        )
                      }
                      style={{
                        backgroundColor: "#377188",
                        width: "100%",
                        borderRadius: 50,
                      }}
                    >
                      {selectedBatch ? selectedBatch.BatchNo : "View Batch No"}
                    </Button>
                  </Col>
                  <Col flex="25%">
                    <InputNumber
                      placeholder="Qty"
                      min={0}
                      max={data[0].OrderedQty}
                      value={pickedQty}
                      onChange={setPickedQty}
                      stringMode={false}
                      inputMode="numeric"
                      style={{ width: "100%" }}
                    />
                  </Col>
                  <Col flex="25%">
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: "#377188",
                        width: "100%",
                        borderRadius: 50,
                      }}
                      onClick={() => handleAddBatch()}
                    >
                      +
                    </Button>
                  </Col>
                </Row>
                <div style={{ padding: "12px" }}>
                  <Divider style={{ marginBottom: 8 }} />

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
                    <Text>Batch</Text>
                    <Text>Qty</Text>
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
                          <Text>{item.BatchNo}</Text>
                          <Text>{item.SAPQty}</Text>
                          <Text>{item.Qty}</Text>
                          <div>
                            <Button
                              type="text"
                              icon={
                                isFulFilled ? (
                                  <CheckCircleOutlined
                                    style={{ color: "green" }}
                                  />
                                ) : (
                                  <CloseCircleOutlined
                                    style={{ color: "red" }}
                                  />
                                )
                              }
                              onClick={!isFulFilled ? () => showFulfillModal(item) : null}
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

                  <Modal
                    open={modalVisible}
                    onOk={handleDelete}
                    onCancel={handleCancel}
                    title="Confirm Delete"
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <p>
                      Delete <strong>{itemToDelete?.BatchNo}</strong> from the
                      list?
                    </p>
                  </Modal>
                  <Modal
                    open={modalFulfillVisible}
                    onOk={handleFulFill}
                    onCancel={handleCancelFulfill}
                    title="Confirm picking"
                    okText="Ok"
                    okButtonProps={{ danger: true }}
                  >
                    <p>
                      Validate this picking?
                    </p>
                  </Modal>
                </div>
              </>
            )}
            {data[0].TrackedBySerial && (
              <>
                <Row
                  gutter={8}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "between",
                  }}
                >
                  <Col flex="100%">
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
                      }}
                    >
                      {selectedSerial ? selectedSerial.Serial : "Select Serial"}
                    </Button>
                  </Col>
                  {selectedSerial && (
                    <Card style={{ marginTop: 16, backgroundColor: "white", width:'100vw' }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#888" }}>Serial: {selectedSerial.Serial}</div>
                        <div style={{ color: "#377188", fontWeight: 600, fontSize: 16 }}>Qty: {1}</div>
                        <Button
                          type="text"
                          icon={<DeleteOutlined style={{ color: "red" }} />}
                          onClick={() => setSelectedSerial(null)}
                        />
                      </div>
                    </Card>
                  )}
                </Row>
                {selectedSerial && (
                  <Row>
                    <Button
                      type="primary"
                      block
                      onClick={() => handleAddSerial()}
                      style={{ backgroundColor: "#377188", bottom: '20px', position:'absolute', width:'100vw' }}
                    >
                      Post to LMS
                    </Button>
                  </Row>
                )}
              </>
            )}
            {/* Default non batch non serial. */}
            {!data[0].TrackedByBatch && !data[0].TrackedBySerial && (
              <>
                <InputNumber
                  placeholder="Enter picked quantity"
                  min={0}
                  max={data[0].OrderedQty > (selectedBin?.Qty || 0) ? data[0].OrderedQty : selectedBin?.Qty}
                  value={pickedQty}
                  onChange={setPickedQty}
                  disabled={!isVerified}
                  style={{ width: "100%", marginBottom: 16 }}
                  stringMode={false}
                  inputMode="numeric"
                />

                <Button
                  type="primary"
                  block
                  disabled={!isVerified}
                  onClick={() => updatePickList(DONo, id, pickedQty)}
                  style={{ backgroundColor: "#377188" }}
                >
                  Confirm Picked Quantity
                </Button>
              </>
            )}
            <ScanListener onScanDetected={(barcode) => scanBarcode(barcode)} />
          </>
        )}
      </>
    </MobilePageShell>
  );
};

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

const BatchSerialModal = ({
  visible,
  onClose,
  list = [],
  onRefresh,
  item,
  setSelected,
  isBatch = true
}) => {
  const handleSelect = (detail) => {
    setSelected(detail);
    onClose();
  };

  return (
    visible && (
      <MobilePageShell
        title={isBatch ? "Batch Nos" : "Serials"}
        onBack={onClose}
        onRefresh={() =>
          onRefresh(item.OrderedProdCode, item.Warehouse, item.UOM)
        }
      >
        <SpinLoading />
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

        {list.map((detail, index) => (
          <Card
            key={index}
            style={{ marginBottom: 16 }}
            onClick={() => handleSelect(detail)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#377188", fontWeight: 600, fontSize: 16 }}>
                {isBatch ? `Batch No: ${detail.BatchNo}` : `Serial: ${detail.Serial}`}
              </span>
              {isBatch && (
                <span style={{ fontWeight: 500 }}>
                  Qty: {parseFloat(detail.Qty)} {detail.UOM}
                </span>)
              }
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
          </Card>
        ))}
      </MobilePageShell>
    )
  );
};

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