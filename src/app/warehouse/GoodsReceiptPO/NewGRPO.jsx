import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { DeleteOutlined, SearchOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Button, Card, Col, Collapse, DatePicker, Input, InputNumber, message, Modal, Row, Select, Space, Tag, Typography } from "antd";
import { AxiosWithLoading, ErrorPrinter, playSound, ScanListener, SpinLoading } from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import { PathLink } from "../../../constants/PathLink";
import MobilePageShell from "../../../constants/MobilePageShell";
import { SwipeAction, TextArea } from "antd-mobile";
import GRPOBatch from "./GRPOBatch";
const { Text } = Typography;

const NewGRPO = () => {
  const history = useHistory();
  const [docSeries, setDocSeries] = useState([]);
  const [data, setData] = useState({start: dayjs()});
  const [poList, setPoList] = useState([]);
  const [searchPoVisible, setSearchPoVisible] = useState(false);
  const [showBatchDetail, setShowBatchDetail] = useState({show: false, item: null});
  const [showSerialDetail, setShowSerialDetail] = useState({show: false, item: null});
  const [showUpdateQtyModal, setShowUpdateQtyModal] = useState({show: false, item: null});

  window.addEventListener("popstate", function () {
    if (searchPoVisible) 
      setSearchPoVisible(false);
    else 
      history.goBack();
  });

  const getDocumentSeries = async () => {
    try {
      const res = await AxiosWithLoading(
        APIHelper.getConfig("/common/getdocumentseries")
      );
      let docs = res.data['SAPQuery_Data'];
      docs = docs.filter(doc => doc.Document === 'GRPO');
      setDocSeries(docs);
    } catch (error) {
      ErrorPrinter(error);
    }
  }

  const postGRPOToSAP = async () => {
    try {
      // 1. document series not null
      if (poList.every(item => item.VendorCode === poList[0].VendorCode) === false) {
        message.error("All PO items must be from the same vendor");
        return;
      }
      let body = {
        DocSeries: data.docSeries,
        DocDate: data.start.format('YYYY-MM-DD'),
        VendorRefNo: data.vendor || '',
        Remarks: data.remarks || '',
        POItems: poList,
        IsNew: true,
        VendorCode: poList[0].VendorCode,
        VendorName: poList[0].VendorName,
        CurrentExchangeRate: poList[0].CurrentExchangeRate,
        CurrencyCode: poList[0].CurrencyCode,
        Purchaser: poList[0].Purchaser,
      }
      const res = await AxiosWithLoading(
        APIHelper.postConfig("/good/warehousePostToSap", body)
      );
      console.log('data: ', body, res.data)
    }
    catch (error) {
      ErrorPrinter(error);
    }
  }

  const onRemovePo = (index) => {
    let newPoList = poList;
    newPoList.splice(index, 1);
    setPoList(newPoList);
    setData({...data});
  }

  useEffect(() => {
    getDocumentSeries();
  }, []);

  return searchPoVisible ? 
    <SearchPOModal
      visible={searchPoVisible}
      onClose={() => setSearchPoVisible(false)}
      setPoList={setPoList}
      poList={poList}
    /> :
    showBatchDetail.show ? 
    <GRPOBatch 
      item={showBatchDetail.item}
      poList={poList}
      setPoList={setPoList}
      onBack={() => setShowBatchDetail({show: false, item: null})}  
    /> :
  ( 
    <MobilePageShell title={"New GRN"} onBack={() => history.push(PathLink.processingGRPO)} onRefresh={()=>{}}>
      <SpinLoading />
      <div bordered style={{ marginBottom: 16 }}>
        <div
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: 80 }}
        >
          <div style={{background:'white', bottom:'1px'}}>
            <Space
              direction="horizontal"
              className="px-2 pb-2"
              style={{ justifyContent: "space-between", width: "100%", borderBottom:'1px solid #ccc' }}
            >
              <Text strong>Document Series</Text>
              <Select 
                optionFilterProp="children"
                placeholder="Document Series"
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                onChange={(value) => setData({...data, docSeries: value})}
                style={{marginTop:10, width:'100%'}}
                value={data.docSeries}
              >
                {docSeries.map((item, index) => (
                  <Select.Option key={index} value={item.SeriesName}>
                    {item.SeriesName}
                  </Select.Option>
                ))}
              </Select>
            </Space>

            <Space
              direction="horizontal"
              className="px-2 py-3"
              style={{ justifyContent: "space-between", width: "100%", borderBottom:'1px solid #ccc' }}
            >
              <Text strong>Document Date</Text>
              <DatePicker 
                className={'compact-calender'} 
                onChange={(date) => setData({...data, start: date})} 
                value={data.start} 
                allowClear={false} 
                size={"small"} 
              />
            </Space>

            <Space
              direction="horizontal"
              className="px-2 py-2"
              style={{ justifyContent: "space-between", width: "100%", borderBottom:'1px solid #ccc' }}
            >
              <Text strong>Vendor Ref No</Text>
              <Input bordered={false} placeholder='' style={{width:'45vw'}} value={data.vendor} onChange={(e) => setData({...data, vendor: e.target.value})} />
            </Space>

            <Space
              direction="horizontal"
              className="px-2 py-3"
              style={{ justifyContent: "space-between", width: "100%", borderBottom:'1px solid #ccc' }}
            >
              <TextArea placeholder="Remarks" style={{width:'100vw'}} rows='2' value={data.remarks} onChange={(e) => setData({...data, remarks: e.target.value})} />
            </Space>
          </div>
          {poList.map((item, index) => (
            <SwipeAction
              rightActions={[
                  {
                    key: 'delete',
                    text: <DeleteOutlined />,
                    color: 'danger',
                    onClick: () => onRemovePo(index),
                  }
                ]}
            >
              <Card
                key={index}
                style={{ margin: 12, borderRadius: 12 }}
                bodyStyle={{ padding: 10 }}
                onClick={() => {
                  if (item.IsTrackedBatch === '1') setShowBatchDetail({show: true, item}); 
                  else if (item.IsTrackedSerial === '1') setShowSerialDetail({show: true, item})
                }}
              >
                <Row justify="space-between" align="middle">
                  <Text strong>{item.SAPDocNum}</Text>
                  <RightOutlined />
                </Row>
                <Row justify="space-between">
                  <Col style={{width:'80%'}}>
                    <Text style={{fontSize:'0.8rem'}} strong>{item.ItemCode}</Text>
                    <br />
                    <Text style={{fontSize:'0.8rem'}} type="secondary">{item.ItemName}</Text>
                  </Col>
                  <Col style={{margin:'auto'}}><Tag style={{padding:'0.35rem'}} color="gold">{item.Warehouse}</Tag></Col>
                </Row>
                <Row align="middle" style={{ marginTop: 5 }} gutter={8}>
                  <Col>
                    <Tag color={item.IsTrackedBatch === '1' ? 'orange' : item.IsTrackedSerial === '1' ? 'blue' : "green"}>{item.IsTrackedBatch === '1' ? 'Batch' : item.IsTrackedSerial === '1' ? 'Serial' : 'Non BatchSerial'}</Tag>
                  </Col>
                  <Col flex="auto" />
                  {item.IsTrackedBatch === '0' && item.IsTrackedSerial === '0' && <Col onClick={() => setShowUpdateQtyModal({show: true, item})}>
                    <Text strong>{String(Number(item.Quantity))} out of {String(Number(item.OpenQty))}&nbsp;{item.BasedUOM}&nbsp;</Text>
                  </Col>}
                </Row>
              </Card>
            </SwipeAction>
          ))}
        </div>
        
        <div style={{background:'white', position:'absolute', width:'100vw', bottom:'1px' }}>
          {poList.length > 0 && (
            <Button
              type="primary"
              block
              onClick={() => postGRPOToSAP()}
              style={{ backgroundColor: "#377188", marginBottom: '0.5rem' }}
            >
              Post to SAP
            </Button>
          )}
          <Button
            type="primary"
            block
            onClick={() => setSearchPoVisible(true)}
            style={{ backgroundColor: "#377188", }}
          >
            Add New Item
          </Button>
        </div>
      </div>

      <Modal
        open={showUpdateQtyModal.show}
        title="Edit Info"
        onCancel={() => setShowUpdateQtyModal({show: false, item: null})}
        onOk={() => {
          if (!showUpdateQtyModal.item.Quantity || parseFloat(showUpdateQtyModal.item.Quantity) <= 0) {
            message.error("Please enter a valid quantity");
            return;
          }
          else if (parseFloat(showUpdateQtyModal.item.Quantity) > parseFloat(showUpdateQtyModal.item.OpenQty)) {
            message.error("Quantity cannot be more than Open Quantity");
            return;
          }
          else {
            const newItem = poList.find(itm => itm.LineItemNo === showUpdateQtyModal.item.LineItemNo && itm.SAPDocNum === showUpdateQtyModal.item.SAPDocNum && itm.VendorCode === showUpdateQtyModal.item.VendorCode);
            if (newItem) newItem.Quantity = showUpdateQtyModal.item.Quantity;
          }
          setShowUpdateQtyModal({show: false, item: null});
        }}
      >
        <div>Product: {showUpdateQtyModal.item && showUpdateQtyModal.item.ItemName}</div>  
        <div>Open Qty: {showUpdateQtyModal.item && String(Number(showUpdateQtyModal.item.OpenQty))}</div>
        <div>
          Qty Received: &nbsp;
          <InputNumber 
            min={0} 
            value={showUpdateQtyModal.item && showUpdateQtyModal.item.Quantity} 
            controls={false}
            style={{width:70, textAlign:'center'}}
            onChange={(value) => {
              setShowUpdateQtyModal({...showUpdateQtyModal, item: {...showUpdateQtyModal.item, Quantity: value}});
            }}
          />
        </div>
      </Modal>
    </MobilePageShell>
   );
}

const SearchPOModal = ({visible, onClose, setPoList, poList}) => {
  const [search, setSearch] = useState({});
  const [data, setData] = useState([]);

  const getOpenPO = async () => {
    try {
      const res = await AxiosWithLoading(
        APIHelper.getConfig("/good/getopenpo?vendorname=" + (search.vendorName || '') + "&prodcode=" + (search.productCode || '') + "&prodname=" + (search.productName || '') + "&pono=" + (search.purchaseOrderNo || ''))
      );
      setData(res.data['SAPQuery_Data']);
      console.log('data: ', res.data['SAPQuery_Data']);
      // setData([
      //   {
      //       "LineItemNo": "3",
      //       "OpenQty": "3.000000",
      //       "Purchaser": "S10498",
      //       "PurchaserName": "CHENG FONG LING",
      //       "CurrentExchangeRate": "1.300000",
      //       "UOM": "CYL",
      //       "BasedQty": "1.000000",
      //       "BasedUOM": "CYL",
      //       "ConvertedQty": "1.000000",
      //       "ConvertedUOM": "CYL",
      //       "IsTrackedBatch": "0",
      //       "IsTrackedSerial": "0",
      //       "UpdateDate": "11/8/2017 12:00:00 AM",
      //       "UpdateTime": "141708",
      //       "SAPDocNum": "1000033",
      //       "CustomDocNum": "MRG1700036",
      //       "ItemCode": "WD3BCL30006",
      //       "ItemName": "BORON TRICHLORIDE BCL3 99.9995% DISS634 47L 50KG",
      //       "DocStatus": "O",
      //       "LineStatus": "O",
      //       "VendorCode": "CRMGP",
      //       "VendorName": "Matheson Gas Products Korea Co., Ltd",
      //       "UnitPrice": "3600.000000",
      //       "SAPDocEntry": "121",
      //       "Dimension1": "GAS",
      //       "Dimension2": "L2NA",
      //       "Dimension3": "L3NA",
      //       "Dimension4": "L4NA",
      //       "LineDiscount": "0.000000",
      //       "TaxType": "PN",
      //       "Warehouse": "G02",
      //       "CurrencyCode": "USD",
      //       "Field33": "0.000000",
      //       "Field34": "3600.000000",
      //       "Field35": "85279",
      //       "Field36": "Y",
      //       "Field37": null,
      //       "Field38": null,
      //       "Field39": null,
      //       "Field40": null,
      //       "IsBin": false,
      //       "DefaultSystemBin": ""
      //   },
      //   {
      //       "LineItemNo": "1",
      //       "OpenQty": "96.000000",
      //       "Purchaser": "S10498",
      //       "PurchaserName": "CHENG FONG LING",
      //       "CurrentExchangeRate": "1.374600",
      //       "UOM": "CYL",
      //       "BasedQty": "1.000000",
      //       "BasedUOM": "CYL",
      //       "ConvertedQty": "1.000000",
      //       "ConvertedUOM": "CYL",
      //       "IsTrackedBatch": "0",
      //       "IsTrackedSerial": "0",
      //       "UpdateDate": "11/8/2017 12:00:00 AM",
      //       "UpdateTime": "141721",
      //       "SAPDocNum": "1000034",
      //       "CustomDocNum": "MRG1700109",
      //       "ItemCode": "WE3WF600003",
      //       "ItemName": "TUNGSTEN HEXAFLUORIDE WF6 99.9995% 70KG 40L",
      //       "DocStatus": "O",
      //       "LineStatus": "O",
      //       "VendorCode": "COS010",
      //       "VendorName": "SK Specialty Co., Ltd.",
      //       "UnitPrice": "6180.300000",
      //       "SAPDocEntry": "124",
      //       "Dimension1": "GAS",
      //       "Dimension2": "L2NA",
      //       "Dimension3": "L3NA",
      //       "Dimension4": "L4NA",
      //       "LineDiscount": "0.000000",
      //       "TaxType": "PN",
      //       "Warehouse": "G02",
      //       "CurrencyCode": "USD",
      //       "Field33": "0.000000",
      //       "Field34": "6180.300000",
      //       "Field35": "89802",
      //       "Field36": "Y",
      //       "Field37": null,
      //       "Field38": null,
      //       "Field39": null,
      //       "Field40": null,
      //       "IsBin": false,
      //       "DefaultSystemBin": ""
      //   },
      //   {
      //       "LineItemNo": "0",
      //       "OpenQty": "31614.000000",
      //       "Purchaser": "S10330",
      //       "PurchaserName": "SHELLY TANG",
      //       "CurrentExchangeRate": "1.270700",
      //       "UOM": "LB",
      //       "BasedQty": "1.000000",
      //       "BasedUOM": "LB",
      //       "ConvertedQty": "1.000000",
      //       "ConvertedUOM": "LB",
      //       "IsTrackedBatch": "1",
      //       "IsTrackedSerial": "0",
      //       "UpdateDate": "9/16/2025 12:00:00 AM",
      //       "UpdateTime": "110505",
      //       "SAPDocNum": "6021114",
      //       "CustomDocNum": "PRW2501743",
      //       "ItemCode": "H1398245114",
      //       "ItemName": "HOBART FLUX CORED WIRE FABCO XL 550 VP(LT) S245112-053 0.045” 1.2MM 33LB/SPOOL",
      //       "DocStatus": "O",
      //       "LineStatus": "O",
      //       "VendorCode": "C2LI004",
      //       "VendorName": "ITW WELDING S'PORE PL-HOBART",
      //       "UnitPrice": "2.273000",
      //       "SAPDocEntry": "64583",
      //       "Dimension1": "WSD",
      //       "Dimension2": "L2NA",
      //       "Dimension3": "L3NA",
      //       "Dimension4": "L4NA",
      //       "LineDiscount": "0.000000",
      //       "TaxType": "PN",
      //       "Warehouse": "W02",
      //       "Field32": "USD",
      //       "Field33": "0.000000",
      //       "Field34": "2.273000",
      //       "Field35": "0",
      //       "Field36": "Y",
      //       "Field37": null,
      //       "Field38": null,
      //       "Field39": null,
      //       "Field40": null,
      //       "IsBin": false,
      //       "DefaultSystemBin": ""
      //   },
      //   {
      //       "LineItemNo": "0",
      //       "OpenQty": "1.000000",
      //       "Purchaser": "S10346",
      //       "PurchaserName": "ANN LIM",
      //       "CurrentExchangeRate": "1.276600",
      //       "UOM": "EA",
      //       "BasedQty": "1.000000",
      //       "BasedUOM": "EA",
      //       "ConvertedQty": "1.000000",
      //       "ConvertedUOM": "EA",
      //       "IsTrackedBatch": "0",
      //       "IsTrackedSerial": "1",
      //       "UpdateDate": "10/10/2025 12:00:00 AM",
      //       "UpdateTime": "151905",
      //       "SAPDocNum": "6021258",
      //       "CustomDocNum": "PRW2501902",
      //       "ItemCode": "O2396930000",
      //       "ItemName": "OTC P6930F00 851590 P.C. BOARD",
      //       "DocStatus": "O",
      //       "LineStatus": "O",
      //       "VendorCode": "C2OO003",
      //       "VendorName": "OTC DAIHEN ASIA CO.,LTD.",
      //       "UnitPrice": "485.000000",
      //       "SAPDocEntry": "65353",
      //       "Dimension1": "WSD",
      //       "Dimension2": "L2NA",
      //       "Dimension3": "L3NA",
      //       "Dimension4": "L4NA",
      //       "LineDiscount": "0.000000",
      //       "TaxType": "PN",
      //       "Warehouse": "W02",
      //       "Field32": "USD",
      //       "Field33": "0.000000",
      //       "Field34": "485.000000",
      //       "Field35": "0",
      //       "Field36": "Y",
      //       "Field37": null,
      //       "Field38": null,
      //       "Field39": null,
      //       "Field40": null,
      //       "IsBin": false,
      //       "DefaultSystemBin": ""
      //   },
      // ])
    } catch (error) {
      ErrorPrinter(error);
    }
  }

  const addPOItem = (item) => {
    try {
      if ((!item.Quantity || parseFloat(item.Quantity) && item.IsTrackedBatch === '0' && item.IsTrackedSerial === '0') <= 0) {
        message.error("Please enter a valid quantity");
        return;
      }
      else if (parseFloat(item.Quantity) > parseFloat(item.OpenQty) && item.IsTrackedBatch === '0' && item.IsTrackedSerial === '0') {
        message.error("Quantity cannot be more than Open Quantity");
        return;
      }
      else if (!(poList.some(po => po.SAPDocNum === item.SAPDocNum && po.LineItemNo === item.LineItemNo && po.VendorCode === item.VendorCode))) {
        setPoList([...poList, item]);
        message.success("Item added successfully");
      }
    }
    catch (error) {
      ErrorPrinter(error);
    }
  }

  const scanBarcode = (barcode) => {
    setSearch({...search, productCode: barcode})
    playSound();
  }

  return visible && (
    <MobilePageShell title={'Search PO'} onBack={onClose}>
      <SpinLoading />
      <div>
        <div className="d-flex align-items-center">
          <Input 
            placeholder="Purchase Order No" 
            className="m-2" 
            // style={{width:'90vw'}} 
            value={search.purchaseOrderNo} 
            onChange={(e) => setSearch({...search, purchaseOrderNo: e.target.value})} 
            suffix={<SearchOutlined onClick={() => getOpenPO()} style={{ color: 'rgba(0,0,0,.45)' }} />}
          />
          <Button className="mr-5" onClick={() => getOpenPO()}>Search</Button>
        </div>
        <Collapse ghost>
          <Collapse.Panel style={{fontSize:'small', paddingTop:'0px', paddingBottom: '0px'}} header="Filters" key="1">
            <Input 
              placeholder="Vendor name" 
              // className="m-2" 
              style={{width:'85vw'}} 
              value={search.vendorName} 
              onChange={(e) => setSearch({...search, vendorName: e.target.value})} 
            />
            <Input 
              placeholder="Product code" 
              className="mt-2" 
              style={{width:'85vw'}} 
              value={search.productCode} 
              onChange={(e) => setSearch({...search, productCode: e.target.value})} 
            />
            <Input 
              placeholder="Product name" 
              className="mt-2" 
              style={{width:'85vw'}} 
              value={search.productName} 
              onChange={(e) => setSearch({...search, productName: e.target.value})} 
            />
          </Collapse.Panel>
        </Collapse>
        <div style={{ maxWidth: 420, margin: "auto", padding: 10 }}>
          {data.map((item, index) => (
            <Card
              key={index}
              style={{ marginBottom: 12, borderRadius: 12 }}
              bodyStyle={{ padding: 10 }}
            >
              <Row justify="space-between" align="middle">
                <Text strong>{item.SAPDocNum}</Text>
                <RightOutlined />
              </Row>
              <Row justify="space-between" style={{ marginTop: 6 }}>
                <Col style={{width:'75%'}}>
                  <Text strong>{item.VendorCode}</Text>
                  <br />
                  <Text type="secondary">{item.VendorName}</Text>
                </Col>
                {item.IsTrackedBatch === '0' && item.IsTrackedSerial === '0' && <Col style={{ textAlign: "center" }}>
                  <InputNumber min={0} value={item.Quantity} controls={false}
                    style={{width:70, textAlign:'center'}}
                    onChange={(val) => {
                      const newItem = data.find(itm => itm.LineItemNo === item.LineItemNo && itm.SAPDocNum === item.SAPDocNum && itm.VendorCode === item.VendorCode);
                      if (newItem) newItem.Quantity = val;
                    }}
                  />
                  <br />
                  <Text type="secondary">{item.BasedUOM}</Text>
                </Col>}
              </Row>
              <Row justify="space-between" style={{ marginTop: 8 }}>
                <Col style={{width:'80%'}}>
                  <Text strong>{item.ItemCode}</Text>
                  <br />
                  <Text type="secondary">{item.ItemName}</Text>
                </Col>
                <Col style={{margin:'auto'}}><Tag style={{padding:'0.5rem'}} color="gold">{item.Warehouse}</Tag></Col>
              </Row>
              <Row align="middle" style={{ marginTop: 10 }} gutter={8}>
                <Col>
                  <Tag color={item.IsTrackedBatch === '1' ? 'orange' : item.IsTrackedSerial === '1' ? 'blue' : "green"}>{item.IsTrackedBatch === '1' ? 'Batch' : item.IsTrackedSerial === '1' ? 'Serial' : 'Non BatchSerial'}</Tag>
                </Col>
                <Col flex="auto" />
                <Col>
                  <Text strong>{String(Number(item.OpenQty))}&nbsp;{item.BasedUOM}&nbsp;{item.UOM !== item.BasedUOM && parseFloat(item.OpenQty)*parseFloat(item.ConvertedQty)/parseFloat(item.BasedQty)}&nbsp;{item.UOM !== item.BasedUOM && item.UOM}</Text>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    shape="circle"
                    onClick={() => addPOItem(item)}
                    icon={<PlusOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </div>
        <ScanListener onScanDetected={(barcode) => scanBarcode(barcode)} />
      </div>
    </MobilePageShell>
  )
}
 
export default NewGRPO;