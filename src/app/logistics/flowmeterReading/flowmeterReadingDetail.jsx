import { useEffect, useState } from "react";
import { Button, Table, Card, message, Tag } from "antd";
import { useHistory, useParams } from "react-router-dom";
import moment from "moment";
import dayjs from "dayjs";
import {
  AxiosWithLoading,
  ErrorPrinter,
  SpinLoading,
} from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import MobilePageShell from "../../../constants/MobilePageShell";
import SignaturePreviewModal from "../../../constants/SignaturePreviewModal";
import SignaturePadJpeg from "../../../constants/SignaturePadJpeg";

export const FlowmeterReadingDetail = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const history = useHistory();
  const scheduleID = useParams().id.split("?")[0];
  const [visibleESign, setVisibleESign] = useState(false);
  const [eSignDONo, setESignDONo] = useState(null);
  const [visibleSignatureModal, setVisibleSignatureModal] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState(null);
  const initial = async () => {
    try {
      let body = {
        ScheduleID: scheduleID,
      };
      const responseParam = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/getScheduleDetail", body)
      );
      setData(responseParam.data.records);
    } catch (error) {
      ErrorPrinter(error);
    }
  };

  const unlockDO = async (DONo) => {
    try {
      let body = {
        DONo: DONo,
      };
      await AxiosWithLoading(
        APIHelper.postConfig("/logistics/unlockDOForFlowmeter", body)
      );
      message.success("DO is locked");
      initial();
    } catch (error) {
      ErrorPrinter(error);
    }
  };

  const lockDO = async (DONo) => {
    try {
      let body = {
        DONo: DONo,
      };
      await AxiosWithLoading(
        APIHelper.postConfig("/logistics/lockDOForFlowmeter", body)
      );
      message.success("DO is unlocked");
      initial();
    } catch (error) {
      ErrorPrinter(error);
    }
  };

  const signDO = async (DONo, Signature) => {
    try {
      let body = {
        DONo: DONo,
        Signature: Signature,
      };
      await AxiosWithLoading(APIHelper.postConfig("/logistics/eSignDO", body));
      message.success("DO Is Signed.");
      initial();
    } catch (error) {
      ErrorPrinter(error);
    }
  };
  const performESign = (DONo) => {
    setVisibleESign(true);
    setESignDONo(DONo);
  };
  const viewSignature = async (hexBlob) => {
    setVisibleSignatureModal(true);
    setSignatureBase64(hexBlob);
  };
  const columns = [
    {
      title: "Delivery Orders",
      dataIndex: "ScheduleID",
      key: "ScheduleID",
      render: (_, record) => {
        return (
          <>
            <Card
              key={record.DONo}
              style={{
                marginBottom: "16px",
                borderRadius: "8px",
                background: "#f5f5f5",
              }}
              bordered={false}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#377188",
                }}
              >
                DO No: {record.DONo}{" "}
                {record.DeliveredSignDate && (
                  <Tag color="green">
                    Signed on{" "}
                    {dayjs(record.DeliveredSignDate).format("DD MMM YYYY")}
                  </Tag>
                )}
              </div>
              <div style={{ color: "#595959" }}>
                Customer Name: {record.AccountShortName}
              </div>
              <div style={{ color: "#595959" }}>
                <strong>Address:</strong> <br />
                {record.Address1} <br />
                {record.Address2} <br />
                {record.Address3} <br />
                {record.Address4}
              </div>
              <div style={{ color: "#8c8c8c" }}>
                DO Date: {moment(record.DODate).format("YYYY-MM-DD")}
              </div>

              {record.startVolume != null && (
                <div>
                  <strong>Start Reading:</strong>{" "}
                  <span style={{ color: "#52c41a" }}>
                    {record.startVolume}{" "}
                  </span>
                </div>
              )}
              {record.endVolume != null && (
                <div>
                  <strong>End reading:</strong>{" "}
                  <span style={{ color: "#52c41a" }}>{record.endVolume} </span>
                </div>
              )}
              {record.FlowmeterReading != null && (
                <div>
                  <strong>Flowmeter reading:</strong>{" "}
                  <span style={{ color: "#52c41a" }}>
                    {record.FlowmeterReading} Kg
                  </span>
                </div>
              )}
              <div
                style={{
                  marginTop: "12px",
                  textAlign: "left",
                  display: "flex",
                  gap: "8px",
                }}
              >
                {record.ActiveDONo == null &&
                  record.FlowmeterReading == null && (
                    <Button
                      type="primary"
                      style={{ background: "#52c41a", borderColor: "#52c41a" }}
                      onClick={() => unlockDO(record.DONo)}
                    >
                      Unlock DO
                    </Button>
                  )}
                {record.ActiveDONo == record.DONo && (
                  <Button
                    type="primary"
                    danger
                    onClick={() => lockDO(record.DONo)}
                  >
                    Lock DO
                  </Button>
                )}
                {record.FlowmeterReading != null &&
                  record.DeliveredSignDate == null && (
                    <Button
                      type="primary"
                      style={{ background: "#377188", borderColor: "#377188" }}
                      onClick={() => performESign(record.DONo)}
                    >
                      Perform E-Sign
                    </Button>
                  )}
                {record.DeliveredSignDate != null &&
                  record.SignatureImageBlob != null && (
                    <Button
                      type="primary"
                      style={{ background: "#377188", borderColor: "#377188" }}
                      onClick={() => viewSignature(record.SignatureImageBlob)}
                    >
                      view signature
                    </Button>
                  )}
              </div>
            </Card>
          </>
        );
      },
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
      title={"Flowmeter Reading"}
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
        <SignaturePadJpeg
          visible={visibleESign}
          setVisible={setVisibleESign}
          modalTitle={`E-Sign for DO #${eSignDONo}`}
          onSubmit={(jpegDataUrl) => {
            signDO(eSignDONo, jpegDataUrl);
          }}
        />
        <SignaturePreviewModal
          visible={visibleSignatureModal}
          setVisible={setVisibleSignatureModal}
          base64String={signatureBase64}
        />
      </>
    </MobilePageShell>
  );
};
